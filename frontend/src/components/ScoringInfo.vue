<script setup>
import { computed } from 'vue'
import { Info, Droplets, Wind, Waves } from 'lucide-vue-next'

const isOpen = false; // Could make it expandable, but let's just show it in a glass card for now
</script>

<template>
  <div class="w-full rounded-3xl bg-slate-900/40 backdrop-blur-xl border border-white/5 p-6 hover:border-slate-500/30 transition-all duration-500">
    <h2 class="text-sm font-bold text-slate-300 mb-6 flex items-center gap-2">
      <Info class="w-4 h-4 text-sky-400" /> How is the Swim Score Calculated?
    </h2>
    
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm text-slate-400">
      <div class="space-y-2">
        <h3 class="text-white font-medium flex items-center gap-2"><Droplets class="w-4 h-4 text-cyan-400"/> Water Temp</h3>
        <p>Cold water shock is a significant risk. The score strongly favors water temperatures above 14°C and penalties apply below 10°C to encourage acclimatization and wetsuit use.</p>
      </div>

      <div class="space-y-2">
        <h3 class="text-white font-medium flex items-center gap-2"><Wind class="w-4 h-4 text-amber-400"/> Wind & Chop</h3>
        <p>Strong winds generate messy, unpredictable waves and chop. Optimal scores require winds under 15 km/h. Severe penalties apply when wind exceeds 30 km/h due to danger.</p>
      </div>

      <div class="space-y-2">
        <h3 class="text-white font-medium flex items-center gap-2"><Waves class="w-4 h-4 text-purple-400"/> Tide & Rip Currents</h3>
        <p>Currents are strongest halfway between high and low tide. The score currently monitors tidal states, though swimmers should always perform localized risk assessments for rip currents.</p>
      </div>
    </div>

    <div class="mt-6 p-4 rounded-2xl bg-slate-950/50 border border-rose-500/20 text-xs text-rose-200/70 text-center">
      <strong>Disclaimer:</strong> This dashboard is an ongoing algorithmic experiment based on API forecast data. It does not replace common sense. Always assess local conditions before entering the ocean. If in doubt, don't go out.
    </div>
  </div>
</template>
