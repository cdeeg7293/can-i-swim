<script setup>
import { computed } from 'vue'
import { Navigation } from 'lucide-vue-next'

const props = defineProps({
  speed: {
    type: Number,
    required: true
  },
  direction: {
    type: Number,
    required: true
  }
})

// Calculate rotation ensuring it transitions smoothly
const rotationStyle = computed(() => {
  return {
    transform: `rotate(${props.direction}deg)`,
    transition: 'transform 1.2s cubic-bezier(0.34, 1.56, 0.64, 1)' // slight bounce
  }
})

// Categorize wind severity to color code it
const severityColor = computed(() => {
  if (props.speed < 15) return 'text-emerald-400 shadow-emerald-400/50'
  if (props.speed < 30) return 'text-amber-400 shadow-amber-400/50'
  return 'text-rose-500 shadow-rose-500/50'
})

const outerRingBorder = computed(() => {
  if (props.speed < 15) return 'border-emerald-500/30'
  if (props.speed < 30) return 'border-amber-500/30'
  return 'border-rose-500/30'
})
</script>

<template>
  <div class="flex flex-col items-center justify-center relative w-full h-full">
    <h2 class="absolute top-0 left-0 text-sm font-bold text-slate-300 w-full flex items-center gap-2">
      <Navigation class="w-4 h-4 text-sky-400" /> Wind Direction
    </h2>
    
    <div class="relative w-48 h-48 mt-8 flex items-center justify-center">
      <!-- Outer glass ring -->
      <div 
        class="absolute inset-0 rounded-full border-[6px] bg-slate-950/50 backdrop-blur-md shadow-2xl flex items-center justify-center"
        :class="outerRingBorder"
      >
        <!-- Compass Markers -->
        <span class="absolute top-2 text-[10px] text-slate-500 font-bold uppercase tracking-widest">N</span>
        <span class="absolute bottom-2 text-[10px] text-slate-500 font-bold uppercase tracking-widest">S</span>
        <span class="absolute right-3 text-[10px] text-slate-500 font-bold uppercase tracking-widest">E</span>
        <span class="absolute left-3 text-[10px] text-slate-500 font-bold uppercase tracking-widest">W</span>

        <div class="w-full h-full opacity-20 border-[2px] border-dashed border-slate-400 rounded-full m-8"></div>
      </div>
      
      <!-- Center Info -->
      <div class="absolute inset-0 flex flex-col items-center justify-center z-10 pointer-events-none">
        <div class="text-3xl font-black text-white drop-shadow-md">{{ speed }}</div>
        <div class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">km/h</div>
      </div>

      <!-- The Pointer Arrow (Animated) -->
      <div class="absolute inset-0 z-20" :style="rotationStyle">
        <!-- SVG pointer positioned at the top of the dial indicating wind direction -->
        <div class="absolute top-4 left-1/2 -translate-x-1/2">
          <svg xmlns="http://www.w3.org/2000/svg" 
            class="h-8 w-8 drop-shadow-[0_0_12px_rgba(255,255,255,0.8)] filter transition-colors duration-500" 
            :class="severityColor"
            viewBox="0 0 24 24" fill="currentColor" stroke="none">
            <!-- Arrow pointing UP to represent blowing TO a direction. Adjust path as needed. -->
            <path d="M12 2L4 20l8-4 8 4z" />
          </svg>
        </div>
      </div>

    </div>
    
    <div class="mt-8 text-center bg-slate-950/50 px-4 py-2 rounded-xl border border-white/5">
      <div class="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center justify-center gap-2">
         <span class="inline-block w-2 h-2 rounded-full" :class="speed < 15 ? 'bg-emerald-500' : speed < 30 ? 'bg-amber-500' : 'bg-rose-500'"></span>
         {{ direction }}° direction
      </div>
    </div>
  </div>
</template>
