/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{vue,js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                ocean: '#005f73',
                sand: '#e9d8a6',
                sun: '#ee9b00',
                deep: '#0a1d37',
                accent: '#94d2bd',
                darkBG: '#050a15',
                card: 'rgba(20, 30, 50, 0.7)'
            },
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
            }
        },
    },
    plugins: [],
}
