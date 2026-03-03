<script setup>
import { computed } from 'vue'
import { Line } from 'vue-chartjs'
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler } from 'chart.js'
import { useConditionsStore } from '../store/useConditionsStore'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler)

const store = useConditionsStore()

const chartData = computed(() => {
  const h = store.history ? [...store.history].reverse() : []
  return {
    labels: h.map((snap) => {
      const d = new Date(snap.timestamp)
      return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`
    }),
    datasets: [
      {
        label: 'Wind Speed (km/h)',
        backgroundColor: 'rgba(56, 189, 248, 0.1)', // sky-400
        borderColor: '#38bdf8',
        data: h.map(s => s.wind_speed),
        fill: true,
        tension: 0.4,
        pointRadius: 0,
        pointHoverRadius: 6,
      },
      {
        label: 'Water Temp (°C)',
        backgroundColor: 'rgba(251, 191, 36, 0.1)', // amber-400
        borderColor: '#fbbf24',
        data: h.map(s => s.water_temp),
        fill: false,
        tension: 0.4,
        borderDash: [5, 5],
        pointRadius: 0,
        pointHoverRadius: 6,
      }
    ]
  }
})

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  color: '#94a3b8', // slate-400
  interaction: {
    mode: 'index',
    intersect: false,
  },
  plugins: {
    legend: {
      position: 'top',
      align: 'end',
      labels: {
        color: '#cbd5e1', // slate-300
        font: { family: 'Inter', size: 12 },
        usePointStyle: true,
        boxWidth: 8
      }
    },
    tooltip: {
      backgroundColor: 'rgba(2, 6, 23, 0.9)', // slate-950
      titleColor: '#f1f5f9',
      bodyColor: '#cbd5e1',
      borderColor: 'rgba(255,255,255,0.1)',
      borderWidth: 1,
      padding: 12,
      cornerRadius: 12,
      displayColors: true,
      usePointStyle: true
    }
  },
  scales: {
    x: {
      grid: {
        color: 'rgba(255, 255, 255, 0.05)',
        drawBorder: false,
      },
      ticks: {
        color: '#64748b', // slate-500
        maxTicksLimit: 6,
        font: { family: 'Inter', size: 11 }
      }
    },
    y: {
      grid: {
        color: 'rgba(255, 255, 255, 0.05)',
        drawBorder: false,
      },
      ticks: {
        color: '#64748b',
        font: { family: 'Inter', size: 11 }
      }
    }
  }
}
</script>

<template>
  <div class="w-full h-full relative group">
      <Line v-if="store.history.length > 0" :data="chartData" :options="chartOptions" class="relative z-10" />
      <div v-else class="absolute inset-0 flex flex-col items-center justify-center text-slate-500 gap-3 z-10">
        <div class="w-8 h-8 rounded-full border-2 border-slate-700 border-t-cyan-500 animate-spin"></div>
        <span class="text-sm font-medium tracking-wide">Syncing telemetry...</span>
      </div>
  </div>
</template>
