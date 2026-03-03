<script setup>
import { onMounted, ref, onUnmounted } from 'vue'
import { useConditionsStore } from './store/useConditionsStore'
import CoastalMap from './components/CoastalMap.vue'
import WindIndicator from './components/WindIndicator.vue'
import ConditionHistoryChart from './components/ConditionHistoryChart.vue'
import TideTimeline from './components/TideTimeline.vue'
import PredictionTimeline from './components/PredictionTimeline.vue'
import ScoringInfo from './components/ScoringInfo.vue'
import { Droplets, Wind, Waves, Activity, MapPin, RefreshCw, ThermometerSun, Sun, CloudRain, Timer } from 'lucide-vue-next'

const store = useConditionsStore()
const mouseX = ref(0)
const mouseY = ref(0)

const onMouseMove = (e) => {
  mouseX.value = e.clientX
  mouseY.value = e.clientY
}

onMounted(() => {
  store.fetchInitial()
  store.fetchPredictions()
  store.connectWebSocket()
  window.addEventListener('mousemove', onMouseMove)
})

onUnmounted(() => {
  window.removeEventListener('mousemove', onMouseMove)
})
</script>

<template>
  <div class="min-h-screen bg-[#020617] text-slate-200 font-sans relative overflow-hidden flex flex-col">
    <!-- Dynamic Ambient Background Glow -->
    <div 
      class="pointer-events-none fixed inset-0 z-0 transition-opacity duration-300"
      :style="{
        background: `radial-gradient(600px circle at ${mouseX}px ${mouseY}px, rgba(14, 165, 233, 0.07), transparent 40%)`
      }"
    ></div>

    <!-- Top Navigation -->
    <header class="relative z-10 w-full backdrop-blur-xl border-b border-white/5 bg-slate-950/50 sticky top-0">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="h-10 w-10 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
            <Waves class="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 class="text-xl font-bold tracking-tight text-white m-0 leading-tight">Can I Swim?</h1>
            <p class="text-xs text-slate-400 font-medium tracking-wide uppercase flex items-center gap-1">
              <MapPin class="w-3 h-3" /> Skerries Coast
            </p>
          </div>
        </div>
        <div class="flex items-center gap-2">
          <div class="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/80 border border-slate-800 text-xs font-medium backdrop-blur-sm">
            <span class="relative flex h-2 w-2">
              <span v-if="store.isConnected" class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span class="relative inline-flex rounded-full h-2 w-2" :class="store.isConnected ? 'bg-emerald-500' : 'bg-rose-500'"></span>
            </span>
            <span :class="store.isConnected ? 'text-emerald-400' : 'text-rose-400'">
              {{ store.isConnected ? 'Live' : 'Connecting' }}
            </span>
          </div>
        </div>
      </div>
    </header>

    <!-- Main Dashboard Grid -->
    <main class="relative z-10 flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      <!-- Top Row: Scores & Current Conditions -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        <!-- Swim Score -->
        <div class="col-span-1 rounded-3xl bg-slate-900/40 backdrop-blur-xl border border-white/5 p-6 relative overflow-hidden group hover:border-cyan-500/30 transition-all duration-500">
          <div class="absolute -right-10 -top-10 w-40 h-40 bg-cyan-500/10 blur-3xl rounded-full group-hover:bg-cyan-500/20 transition-all duration-700"></div>
          <div class="flex justify-between items-start mb-4">
            <div class="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400">
              <Droplets class="w-6 h-6" />
            </div>
            <div class="text-right">
              <h2 class="text-xs font-bold text-slate-400 uppercase tracking-widest">Swim Score</h2>
            </div>
          </div>
          <div class="flex items-end gap-2 mt-4">
            <span class="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-blue-500">
              {{ store.current ? store.current.swim_score : '-' }}
            </span>
            <span class="text-2xl font-bold text-slate-600 mb-2">/10</span>
          </div>
          <p class="text-sm text-slate-500 mt-4 font-medium">Optimal conditions based on water temperature and calm winds.</p>
        </div>

        <!-- Run Score -->
        <div class="col-span-1 rounded-3xl bg-slate-900/40 backdrop-blur-xl border border-white/5 p-6 relative overflow-hidden group hover:border-amber-500/30 transition-all duration-500">
          <div class="absolute -right-10 -top-10 w-40 h-40 bg-amber-500/10 blur-3xl rounded-full group-hover:bg-amber-500/20 transition-all duration-700"></div>
          <div class="flex justify-between items-start mb-4">
            <div class="p-2.5 rounded-xl bg-amber-500/10 text-amber-400">
              <Activity class="w-6 h-6" />
            </div>
            <div class="text-right">
              <h2 class="text-xs font-bold text-slate-400 uppercase tracking-widest">Run Score</h2>
            </div>
          </div>
          <div class="flex items-end gap-2 mt-4">
            <span class="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-orange-500">
              {{ store.current ? store.current.run_score : '-' }}
            </span>
            <span class="text-2xl font-bold text-slate-600 mb-2">/10</span>
          </div>
          <p class="text-sm text-slate-500 mt-4 font-medium">Favorable air temp and wind resistance for coastal running.</p>
        </div>

        <!-- Current Stats List -->
        <div class="col-span-1 md:col-span-2 lg:col-span-2 rounded-3xl bg-slate-900/40 backdrop-blur-xl border border-white/5 p-6 flex flex-col justify-between group hover:border-indigo-500/30 transition-all duration-500">
          <h2 class="text-sm font-bold text-slate-300 mb-4 flex items-center gap-2">
            <RefreshCw class="w-4 h-4 text-indigo-400" :class="{'animate-spin': !store.current}" /> Live Dashboard Details
          </h2>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
             <div class="flex items-center justify-between p-3 rounded-2xl bg-slate-950/50 border border-white/5 hover:bg-slate-800/50 transition-colors">
               <div class="flex items-center gap-3">
                 <Wind class="w-5 h-5 text-slate-400" />
                 <span class="text-sm text-slate-300 font-medium">Wind</span>
               </div>
               <span class="text-lg font-bold text-white">{{ store.current ? store.current.wind_speed : '-' }} <span class="text-xs font-normal text-slate-500">km/h</span></span>
             </div>
             <div class="flex items-center justify-between p-3 rounded-2xl bg-slate-950/50 border border-white/5 hover:bg-slate-800/50 transition-colors">
               <div class="flex items-center gap-3">
                 <ThermometerSun class="w-5 h-5 text-amber-400" />
                 <span class="text-sm text-slate-300 font-medium">Air Temp</span>
               </div>
               <span class="text-lg font-bold text-white">{{ store.current ? store.current.air_temp : '-' }} <span class="text-xs font-normal text-slate-500">°C</span></span>
             </div>
             <div class="flex items-center justify-between p-3 rounded-2xl bg-slate-950/50 border border-white/5 hover:bg-slate-800/50 transition-colors">
               <div class="flex items-center gap-3">
                 <Droplets class="w-5 h-5 text-cyan-400" />
                 <span class="text-sm text-slate-300 font-medium">Water Temp</span>
               </div>
               <span class="text-lg font-bold text-white">{{ store.current ? store.current.water_temp : '-' }} <span class="text-xs font-normal text-slate-500">°C</span></span>
             </div>
             <div class="flex items-center justify-between p-3 rounded-2xl bg-slate-950/50 border border-white/5 hover:bg-slate-800/50 transition-colors">
               <div class="flex items-center gap-3">
                 <Sun class="w-5 h-5 text-yellow-400" />
                 <span class="text-sm text-slate-300 font-medium">UV Index</span>
               </div>
               <span class="text-lg font-bold text-white">{{ store.current ? store.current.uv_index : '-' }}</span>
             </div>
             <div class="flex items-center justify-between p-3 rounded-2xl bg-slate-950/50 border border-white/5 hover:bg-slate-800/50 transition-colors">
               <div class="flex items-center gap-3">
                 <CloudRain class="w-5 h-5 text-blue-400" />
                 <span class="text-sm text-slate-300 font-medium">Rain / Runoff</span>
               </div>
               <span class="text-lg font-bold text-white">{{ store.current ? store.current.precipitation : '-' }} <span class="text-xs font-normal text-slate-500">mm</span></span>
             </div>
             <div class="flex items-center justify-between p-3 rounded-2xl bg-slate-950/50 border border-white/5 hover:bg-slate-800/50 transition-colors">
               <div class="flex items-center gap-3">
                 <Waves class="w-5 h-5 text-teal-400" />
                 <span class="text-sm text-slate-300 font-medium">Wave Height</span>
               </div>
               <div class="text-right">
                 <span class="text-lg font-bold text-white">{{ store.current ? store.current.wave_height : '-' }} <span class="text-xs font-normal text-slate-500">m</span></span>
               </div>
             </div>
             <div class="flex items-center justify-between p-3 rounded-2xl bg-slate-950/50 border border-white/5 hover:bg-slate-800/50 transition-colors">
               <div class="flex items-center gap-3">
                 <Timer class="w-5 h-5 text-rose-400" />
                 <span class="text-sm text-slate-300 font-medium">Wave Period</span>
               </div>
               <div class="text-right">
                 <span class="text-lg font-bold text-white">{{ store.current ? store.current.wave_period : '-' }} <span class="text-xs font-normal text-slate-500">s</span></span>
               </div>
             </div>
             <div class="flex items-center justify-between p-3 rounded-2xl bg-slate-950/50 border border-white/5 hover:bg-slate-800/50 transition-colors">
               <div class="flex items-center gap-3">
                 <Activity class="w-5 h-5 text-purple-400" />
                 <span class="text-sm text-slate-300 font-medium">Tide Level</span>
               </div>
               <div class="text-right">
                 <span class="text-lg font-bold text-white">{{ store.current ? store.current.tide_level : '-' }} <span class="text-xs font-normal text-slate-500">m</span></span>
               </div>
             </div>
          </div>
        </div>
      </div>

      <!-- Map & Wind Direction Row -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div class="lg:col-span-2 rounded-3xl bg-slate-900/40 backdrop-blur-xl border border-white/5 overflow-hidden min-h-[350px] relative group hover:border-blue-500/30 transition-all duration-500">
           <div class="absolute top-4 left-4 z-20 px-3 py-1.5 rounded-lg bg-slate-900/80 backdrop-blur-md border border-white/10 text-xs font-bold text-white shadow-xl flex items-center gap-2">
             <MapPin class="w-3 h-3 text-blue-400"/> Map View
           </div>
           <CoastalMap />
        </div>
        <div class="lg:col-span-1 rounded-3xl bg-slate-900/40 backdrop-blur-xl border border-white/5 p-6 flex items-center justify-center min-h-[350px] relative overflow-hidden group hover:border-sky-500/30 transition-all duration-500">
           <div class="absolute inset-0 bg-gradient-to-br from-sky-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
           <WindIndicator :speed="store.current?.wind_speed || 0" :direction="store.current?.wind_direction || 0" />
        </div>
      </div>

      <!-- Chart & Timeline Row -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div class="rounded-3xl bg-slate-900/40 backdrop-blur-xl border border-white/5 p-6 hover:border-emerald-500/30 transition-all duration-500 flex flex-col min-h-[350px]">
          <h2 class="text-sm font-bold text-slate-300 mb-6 flex items-center gap-2">
            <Activity class="w-4 h-4 text-emerald-400" /> 24-Hour Trends
          </h2>
          <div class="flex-1 w-full relative">
            <ConditionHistoryChart v-if="store.current" />
          </div>
        </div>
        
        <div class="rounded-3xl bg-slate-900/40 backdrop-blur-xl border border-white/5 p-6 hover:border-purple-500/30 transition-all duration-500 flex flex-col min-h-[350px] justify-center relative overflow-hidden">
          <div class="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-purple-900/20 via-slate-900/0 to-slate-900/0 z-0"></div>
          <h2 class="text-sm font-bold text-slate-300 mb-8 flex items-center gap-2 relative z-10 w-full">
            <Waves class="w-4 h-4 text-purple-400" /> Tide Activity
          </h2>
          <div class="flex-1 w-full flex items-center justify-center relative z-10">
            <TideTimeline :tideLevel="store.current?.tide_level || 0" :tideStatus="store.current?.tide_status || 'Rising'" />
          </div>
        </div>
      </div>

      <!-- Future Predictions Row -->
      <div class="grid grid-cols-1 gap-6">
        <PredictionTimeline />
      </div>

      <!-- Scoring Explanation Row -->
      <div class="grid grid-cols-1 gap-6 pb-12">
        <ScoringInfo />
      </div>

    </main>
  </div>
</template>

<style>
/* Global scrollbar styling for premium feel */
::-webkit-scrollbar {
  width: 8px;
}
::-webkit-scrollbar-track {
  background: #020617; 
}
::-webkit-scrollbar-thumb {
  background: #1e293b; 
  border-radius: 4px;
}
::-webkit-scrollbar-thumb:hover {
  background: #334155; 
}
</style>
