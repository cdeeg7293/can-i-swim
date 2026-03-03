<script setup>
import { computed } from 'vue'

const props = defineProps({
  tideLevel: {
    type: Number,
    required: true
  },
  tideStatus: {
    type: String, // 'Rising', 'Falling'
    required: true
  }
})

// Calculate position 0 to 100% based on our mock levels (0 to 4m) and status
const indicatorPosition = computed(() => {
  const levelNorm = Math.min(Math.max((props.tideLevel || 0) / 4, 0), 1) // 0 to 1
  if (props.tideStatus === 'Rising') {
    return (levelNorm * 50) + '%'
  } else {
    // Falling
    return (50 + (1 - levelNorm) * 50) + '%'
  }
})

const getStatusColor = computed(() => {
   if (props.tideStatus === 'Rising') return 'shadow-cyan-400/50 bg-cyan-400'
   return 'shadow-purple-400/50 bg-purple-400'
})
</script>

<template>
  <div class="w-full relative px-6 py-6 pb-12 flex items-center justify-center">
    
    <!-- Track line -->
    <div class="absolute left-6 right-6 h-1 bg-slate-800 rounded-full flex items-center justify-between pointer-events-none">
       <div class="h-4 w-4 rounded-full bg-slate-900 border-2 border-slate-700"></div>
       <div class="h-4 w-4 rounded-full bg-slate-900 border-2 border-slate-700 relative z-0">
          <div class="absolute inset-2 -top-10 text-center w-20 -left-8 text-xs font-bold text-slate-400 uppercase tracking-widest hidden sm:block">Peak</div>
       </div>
       <div class="h-4 w-4 rounded-full bg-slate-900 border-2 border-slate-700"></div>
    </div>

    <!-- Active filled line -->
    <div class="absolute left-6 right-6 h-1 flex items-center bg-transparent pointer-events-none z-10">
       <div 
         class="h-full bg-gradient-to-r from-transparent via-cyan-500 to-purple-500 rounded-full transition-all duration-1000 ease-in-out relative"
         :style="{ width: indicatorPosition }"
       >
          <!-- Pulsing Blip -->
          <div class="absolute top-1/2 right-0 -translate-y-1/2 translate-x-1/2 w-6 h-6 rounded-full border-[4px] border-slate-950 flex items-center justify-center shadow-lg transition-colors z-20" :class="getStatusColor">
             <div class="absolute inset-0 bg-white/20 rounded-full animate-ping"></div>
          </div>
       </div>
    </div>

    <!-- Labels below -->
    <div class="absolute bottom-0 left-4 right-4 flex justify-between text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-6">
      <div class="w-12 text-center text-slate-600">Low</div>
      <div class="w-20 text-center text-cyan-500/80 -ml-10 hidden sm:block">Rising <span class="text-[14px]">↗</span></div>
      <div class="w-12 text-center text-slate-300">High</div>
      <div class="w-20 text-center text-purple-500/80 -mr-10 hidden sm:block">Falling <span class="text-[14px]">↘</span></div>
      <div class="w-12 text-center text-slate-600">Low</div>
    </div>

  </div>
</template>
