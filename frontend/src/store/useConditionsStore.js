import { defineStore } from 'pinia';

export const useConditionsStore = defineStore('conditions', {
    state: () => ({
        current: null,
        history: [],
        predictions: [],
        isConnected: false,
        ws: null,
    }),
    actions: {
        async fetchInitial() {
            try {
                const curRes = await fetch('http://127.0.0.1:3000/api/current');
                if (curRes.ok) {
                    this.current = await curRes.json();
                }

                const histRes = await fetch('http://127.0.0.1:3000/api/history');
                if (histRes.ok) {
                    this.history = await histRes.json();
                }
            } catch (e) {
                console.error('Initial fetch failed', e);
            }
        },
        async fetchPredictions() {
            try {
                const res = await fetch('http://127.0.0.1:3000/api/predictions');
                if (res.ok) {
                    this.predictions = await res.json();
                }
            } catch (e) {
                console.error('Predictions fetch failed', e);
            }
        },
        connectWebSocket() {
            if (this.ws) return; // Prevent multiple connections

            this.ws = new WebSocket('ws://127.0.0.1:3000');

            this.ws.onopen = () => {
                this.isConnected = true;
            };

            this.ws.onmessage = (event) => {
                try {
                    const msg = JSON.parse(event.data);
                    if (msg.type === 'UPDATE') {
                        this.current = msg.data;
                        // Optional: push to history to keep it real-time updated without refreshing
                        if (this.current) {
                            // Keep history at 96 max (24 hours at 15 min intervals)
                            this.history.unshift(this.current);
                            if (this.history.length > 96) this.history.pop();
                        }
                    }
                } catch (e) {
                    console.error('WS message error', e);
                }
            };

            this.ws.onclose = () => {
                this.isConnected = false;
                this.ws = null; // Clear the socket instance
                // Reconnect after 5 seconds
                setTimeout(() => this.connectWebSocket(), 5000);
            };
        }
    }
});
