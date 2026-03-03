const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'skerries.db');

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database', err.message);
    } else {
        console.log('Connected to the SQLite database.');

        db.run(`CREATE TABLE IF NOT EXISTS conditions_snapshot (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
            wind_speed REAL,
            wind_direction REAL,
            water_temp REAL,
            tide_level REAL,
            tide_status TEXT,
            swim_score INTEGER,
            run_score INTEGER,
            air_temp REAL,
            uv_index REAL,
            wave_height REAL,
            wave_period REAL,
            precipitation REAL
        )`, (err) => {
            if (err) {
                console.error("Error creating table", err);
            }
        });
    }
});

module.exports = db;
