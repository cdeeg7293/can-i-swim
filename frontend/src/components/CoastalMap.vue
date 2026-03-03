<script setup>
import 'leaflet/dist/leaflet.css';
import { LMap, LTileLayer, LMarker, LPopup } from '@vue-leaflet/vue-leaflet';
import { ref } from 'vue';

const zoom = ref(13);
const skerriesHQ = ref([53.582, -6.108]);
</script>

<template>
  <div class="w-full h-full min-h-[250px] relative rounded-xl overflow-hidden shadow-inner border border-ocean/30 group">
    <div class="absolute inset-0 z-10 pointer-events-none ring-1 ring-inset ring-ocean/50 rounded-xl"></div>
    <l-map v-model:zoom="zoom" :center="skerriesHQ" :useGlobalLeaflet="false" class="h-full w-full z-0">
      <l-tile-layer
        url="https://{s}.basemaps.cartocdn.com/rastertiles/dark_all/{z}/{x}/{y}{r}.png"
        layer-type="base"
        name="Dark Map"
        attribution="&copy; <a href='https://carto.com/'>Carto</a>"
      ></l-tile-layer>
      <l-marker :lat-lng="skerriesHQ">
        <l-popup class="text-deep font-sans">
          <strong>Skerries Coast</strong><br>
          Data fetching location.
        </l-popup>
      </l-marker>
    </l-map>
  </div>
</template>

<style scoped>
/* Ensure the map inherits dark mode properly if not completely handled by cartocdn */
.leaflet-container {
    background: #050a15 !important;
}
</style>
