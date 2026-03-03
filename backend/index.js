const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const cors = require('cors');
const cron = require('node-cron');
const db = require('./db');
const { fetchAndScore, fetchPredictions } = require('./fetcher');

const app = express();
app.use(cors());

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

let currentSnapshot = null;
let currentPredictions = [];

// REST Endpoints
app.get('/api/current', (req, res) => {
    if (currentSnapshot) {
        res.json(currentSnapshot);
    } else {
        // Fetch latest from DB
        db.get('SELECT * FROM conditions_snapshot ORDER BY timestamp DESC LIMIT 1', (err, row) => {
            if (err) return res.status(500).json({ error: err.message });
            if (row) {
                currentSnapshot = row;
                res.json(row);
            } else {
                res.status(404).json({ error: 'No data yet' });
            }
        });
    }
});

app.get('/api/history', (req, res) => {
    // 24hr history
    db.all('SELECT * FROM conditions_snapshot ORDER BY timestamp DESC LIMIT 96', (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

app.get('/api/predictions', (req, res) => {
    res.json(currentPredictions);
});

wss.on('connection', (ws) => {
    console.log('Client connected to WebSocket');
    if (currentSnapshot) {
        ws.send(JSON.stringify({ type: 'UPDATE', data: currentSnapshot }));
    }
});

function broadcastUpdate(data) {
    currentSnapshot = data;
    wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({ type: 'UPDATE', data }));
        }
    });
}

async function performFetch() {
    try {
        console.log("Fetching latest condition data...");
        const newSnapshot = await fetchAndScore();
        console.log("New snapshot:", newSnapshot);
        if (newSnapshot) broadcastUpdate(newSnapshot);

        const newPredictions = await fetchPredictions();
        if (newPredictions && newPredictions.length > 0) {
            currentPredictions = newPredictions;
        }
    } catch (err) {
        console.error("Fatal error in performFetch:", err);
    }
}

// Will be updated via cron job
cron.schedule('*/15 * * * *', performFetch);

// Also run on startup after a small delay
setTimeout(performFetch, 1000);

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Backend API listening on http://localhost:${PORT}`);
});
