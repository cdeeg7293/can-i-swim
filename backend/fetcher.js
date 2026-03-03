const db = require('./db');
// Removed axios requirement, using native fetch


const LATITUDE = 53.582;
const LONGITUDE = -6.108;

function calculateSwimScore(windSpeed, waterTemp, precipitation, waveHeight = 0) {
    let score = 5; // Base score out of 10

    // Wind penalty (km/h)
    if (windSpeed < 10) score += 2;
    else if (windSpeed < 20) score += 1;
    else if (windSpeed > 30) score -= 2;
    else if (windSpeed > 40) score -= 4;

    // Wave penalty (m)
    if (waveHeight < 0.5) score += 1;
    else if (waveHeight > 1.5) score -= 2;
    else if (waveHeight > 2.5) score -= 4;

    // Water temp bonus/penalty (C)
    if (waterTemp > 14) score += 2;
    else if (waterTemp > 10) score += 1;
    else if (waterTemp < 8) score -= 2;

    // Rain penalty (mm)
    if (precipitation === 0) score += 1;
    else if (precipitation > 5) score -= 2;

    return Math.max(0, Math.min(10, score)); // Clamp 0-10
}

function calculateRunScore(windSpeed, temp, precipitation) {
    let score = 5;

    // Temp
    if (temp >= 10 && temp <= 18) score += 2;
    else if (temp > 25) score -= 2;
    else if (temp < 5) score -= 1;

    // Wind penalty
    if (windSpeed < 15) score += 2;
    else if (windSpeed > 25) score -= 2;

    // Rain penalty
    if (precipitation === 0) score += 1;
    else if (precipitation > 2) score -= 2;

    return Math.max(0, Math.min(10, score));
}

function simulateTide() {
    // Basic mock: high tide every 12 hours. We can improve this later.
    const hour = new Date().getHours();
    // Assuming 0 is Low, 6 is High, 12 is Low, 18 is High
    const cycle = (hour % 12) / 12; // 0 to 1
    const level = Math.sin(cycle * Math.PI * 2) * 2 + 2; // Level 0m to 4m
    const status = Math.cos(cycle * Math.PI * 2) > 0 ? 'Rising' : 'Falling';
    return { level: parseFloat(level.toFixed(2)), status };
}

async function fetchAndScore() {
    try {
        // Fetch Weather
        const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${LATITUDE}&longitude=${LONGITUDE}&current=temperature_2m,wind_speed_10m,wind_direction_10m,precipitation,uv_index`;
        const weatherRes = await fetch(weatherUrl);
        const weatherData = await weatherRes.json();

        const currentW = weatherData.current;
        const windSpeed = currentW.wind_speed_10m;
        const windDir = currentW.wind_direction_10m;
        const temp = currentW.temperature_2m;
        const precip = currentW.precipitation;
        const uvIndex = currentW.uv_index;

        // Try to fetch Marine (wave height). Water temp not easily available on default free Open-Meteo, 
        // fallback to air temp - a few degrees as an approximation if we can't find it.
        const marineUrl = `https://marine-api.open-meteo.com/v1/marine?latitude=${LATITUDE}&longitude=${LONGITUDE}&current=wave_height,wave_period`;
        let waveHeight = 0;
        let wavePeriod = 0;
        try {
            const marineRes = await fetch(marineUrl);
            const marineData = await marineRes.json();
            waveHeight = marineData.current?.wave_height || 0;
            wavePeriod = marineData.current?.wave_period || 0;
        } catch (e) {
            console.error("Marine API failed, using defaults", e);
        }

        const waterTemp = Math.max(8, temp - 3); // Mock water temp approximation

        const tide = simulateTide();

        const swimScore = calculateSwimScore(windSpeed, waterTemp, precip, waveHeight);
        const runScore = calculateRunScore(windSpeed, temp, precip);

        const snapshot = {
            wind_speed: windSpeed,
            wind_direction: windDir,
            water_temp: parseFloat(waterTemp.toFixed(1)),
            tide_level: tide.level,
            tide_status: tide.status,
            swim_score: Math.round(swimScore),
            run_score: Math.round(runScore),
            air_temp: temp,
            uv_index: uvIndex,
            wave_height: waveHeight,
            wave_period: wavePeriod,
            precipitation: precip
        };

        // Save to DB
        return new Promise((resolve, reject) => {
            const stmt = db.prepare(`INSERT INTO conditions_snapshot (wind_speed, wind_direction, water_temp, tide_level, tide_status, swim_score, run_score, air_temp, uv_index, wave_height, wave_period, precipitation) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);
            stmt.run([snapshot.wind_speed, snapshot.wind_direction, snapshot.water_temp, snapshot.tide_level, snapshot.tide_status, snapshot.swim_score, snapshot.run_score, snapshot.air_temp, snapshot.uv_index, snapshot.wave_height, snapshot.wave_period, snapshot.precipitation], function (err) {
                if (err) {
                    console.error(err);
                    reject(err);
                } else {
                    snapshot.id = this.lastID;
                    snapshot.timestamp = new Date().toISOString();
                    resolve(snapshot);
                }
            });
        });

    } catch (err) {
        console.error("Error fetching data:", err);
        return null;
    }
}

async function fetchPredictions() {
    try {
        const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${LATITUDE}&longitude=${LONGITUDE}&hourly=temperature_2m,wind_speed_10m,wind_direction_10m,precipitation,uv_index&forecast_days=2`;
        const weatherRes = await fetch(weatherUrl);
        const wData = await weatherRes.json();

        // Marine API
        const marineUrl = `https://marine-api.open-meteo.com/v1/marine?latitude=${LATITUDE}&longitude=${LONGITUDE}&hourly=wave_height,wave_period&forecast_days=2`;
        let mData = { hourly: { wave_height: [], wave_period: [] } };
        try {
            const marineRes = await fetch(marineUrl);
            const data = await marineRes.json();
            if (data && data.hourly) mData = data;
        } catch (e) {
            console.error("Marine API failed for predictions");
        }

        const predictions = [];
        const now = new Date();
        now.setMinutes(0, 0, 0); // start of current hour

        const times = wData.hourly.time;
        for (let i = 0; i < times.length; i++) {
            const t = new Date(times[i]);
            if (t >= now && predictions.length < 12) { // We want the next 12 hours of predictions
                const windSpeed = wData.hourly.wind_speed_10m[i];
                const windDir = wData.hourly.wind_direction_10m[i];
                const temp = wData.hourly.temperature_2m[i];
                const precip = wData.hourly.precipitation[i];
                const uvIndex = wData.hourly.uv_index[i] || 0;

                const waveHeight = mData.hourly.wave_height[i] || 0;
                const wavePeriod = mData.hourly.wave_period[i] || 0;

                // Rough mock of water temp
                const waterTemp = Math.max(8, temp - 3);

                predictions.push({
                    time: times[i],
                    timestamp: new Date(times[i]).toISOString(),
                    wind_speed: windSpeed,
                    wind_direction: windDir,
                    water_temp: parseFloat(waterTemp.toFixed(1)),
                    swim_score: Math.round(calculateSwimScore(windSpeed, waterTemp, precip, waveHeight)),
                    run_score: Math.round(calculateRunScore(windSpeed, temp, precip)),
                    air_temp: temp,
                    uv_index: uvIndex,
                    wave_height: waveHeight,
                    wave_period: wavePeriod,
                    precipitation: precip
                });
            }
        }
        return predictions;
    } catch (err) {
        console.error("Error fetching predictions", err);
        return [];
    }
}

module.exports = {
    fetchAndScore,
    fetchPredictions
};
