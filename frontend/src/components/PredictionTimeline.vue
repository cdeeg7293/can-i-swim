<script setup>
import { computed } from 'vue'
import { CalendarClock } from 'lucide-vue-next'
import { useConditionsStore } from '../store/useConditionsStore'

const store = useConditionsStore()

const maxScore = 10;

const formatTime = (isoString) => {
  const d = new Date(isoString);
  let h = d.getHours();
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12;
  h = h ? h : 12;
  return `${h} ${ampm}`;
}

const getScoreColor = (score) => {
  if (score >= 8) return 'bg-emerald-400 shadow-[0_0_15px_rgba(52,211,153,0.5)]';
  if (score >= 5) return 'bg-amber-400 shadow-[0_0_15px_rgba(251,191,36,0.5)]';
  return 'bg-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.5)]';
}
</script>

<template>
  <div class="w-full rounded-3xl bg-slate-900/40 backdrop-blur-xl border border-white/5 p-6 hover:border-indigo-500/30 transition-all duration-500 flex flex-col min-h-[350px]">
    <h2 class="text-sm font-bold text-slate-300 mb-6 flex items-center gap-2">
      <CalendarClock class="w-4 h-4 text-indigo-400" /> 12-Hour Swim Forecast
    </h2>
    
    <div v-if="store.predictions && store.predictions.length > 0" class="flex-1 w-full pl-2 pr-2 overflow-x-auto pb-4 custom-scrollbar">
      <div class="flex items-end h-48 gap-3 min-w-[600px] mt-8">
        <div v-for="pred in store.predictions" :key="pred.timestamp" class="flex-1 flex flex-col items-center justify-end group">
           <!-- The Bar -->
           <div class="w-full max-w-[40px] relative rounded-t-lg transition-all duration-500 ease-in-out hover:brightness-125"
                :class="getScoreColor(pred.swim_score)"
                :style="{ height: `${(pred.swim_score / maxScore) * 100}%`, minHeight: '10%' }">
             <div class="absolute -top-8 left-1/2 -translate-x-1/2 text-white font-black text-lg opacity-0 group-hover:opacity-100 transition-opacity">
               {{ pred.swim_score }}
             </div>
           </div>
           
           <div class="mt-4 text-xs font-bold text-slate-500 uppercase tracking-widest text-center">
             {{ formatTime(pred.timestamp) }}
           </div>
           <div class="mt-1 text-[10px] text-slate-600 font-medium flex items-center justify-center gap-1">
             {{ pred.wind_speed }}km/h
           </div>
        </div>
      </div>
    </div>
    
    <div v-else class="flex-1 flex flex-col items-center justify-center text-slate-500 gap-3">
        <div class="w-8 h-8 rounded-full border-2 border-slate-700 border-t-indigo-500 animate-spin"></div>
        <span class="text-sm font-medium tracking-wide">Building forecast models...</span>
    </div>
  </div>
</template>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  height: 6px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: rgba(2, 6, 23, 0.5);
  border-radius: 10px;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(51, 65, 85, 0.8);
  border-radius: 10px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: rgba(71, 85, 105, 1);
}
</style>
