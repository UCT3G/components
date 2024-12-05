<template>
  <div v-if="visible" class="full-screen-overlay">
    <div class="loader">
      <svg height="0" width="0" viewBox="0 0 64 64" class="absolute">
        <defs xmlns="http://www.w3.org/2000/svg">
          <linearGradient gradientUnits="userSpaceOnUse" y2="2" x2="0" y1="62" x1="0" id="b">
            <stop stop-color="#973BED"></stop>
            <stop stop-color="#007CFF" offset="1"></stop>
          </linearGradient>
          <linearGradient gradientUnits="userSpaceOnUse" y2="0" x2="0" y1="64" x1="0" id="c">
            <stop stop-color="#FFC800"></stop>
            <stop stop-color="#F0F" offset="1"></stop>
            <animateTransform repeatCount="indefinite" keySplines=".42,0,.58,1;.42,0,.58,1;.42,0,.58,1;.42,0,.58,1;.42,0,.58,1;.42,0,.58,1;.42,0,.58,1;.42,0,.58,1" keyTimes="0; 0.125; 0.25; 0.375; 0.5; 0.625; 0.75; 0.875; 1" dur="8s" values="0 32 32;-270 32 32;-270 32 32;-540 32 32;-540 32 32;-810 32 32;-810 32 32;-1080 32 32;-1080 32 32" type="rotate" attributeName="gradientTransform"></animateTransform>
          </linearGradient>
          <linearGradient gradientUnits="userSpaceOnUse" y2="2" x2="0" y1="62" x1="0" id="d">
            <stop stop-color="#00E0ED"></stop>
            <stop stop-color="#00DA72" offset="1"></stop>
          </linearGradient>
        </defs>
      </svg>

      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 64 64" height="64" width="64" class="inline-block">
        <path stroke-linejoin="round" stroke-linecap="round" stroke-width="8" stroke="url(#b)" d="M 4 4 H 12 V 32 A 20 20 0 0 0 52 32 V 4 H 60 V 32 A 28 28 0 0 1 4 32 Z" class="dash" id="u" pathLength="360"></path>
      </svg>

      <div class="w-2"></div>
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" style="--rotation-duration:0ms; --rotation-direction:normal;" viewBox="0 0 64 64" height="64" width="64" class="inline-block">
        <path stroke-linejoin="round" stroke-linecap="round" stroke-width="12" stroke="url(#c)" d="
          M 50 12
          Q 32 0 14 12
          Q 0 32 14 52
          Q 32 64 50 52
          " class="dash" id="c" pathLength="360"></path>
      </svg>

      <div class="w-2"></div>
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" style="--rotation-duration:0ms; --rotation-direction:normal;" viewBox="0 0 64 64" height="64" width="64" class="inline-block">
        <path stroke-linejoin="round" stroke-linecap="round" stroke-width="8" stroke="url(#d)" d="M 4 4 H 60 V 12 H 36 V 60 H 28 V 12 H 4 Z" class="dash" id="t" pathLength="360"></path>
      </svg>
    </div>
  </div>
</template>

<script>
export default {
  name: 'LoadingScreen',
  props: {
    visible: {
      type: Boolean,
      required: true
    },
  },
};
</script>

<style scoped>
.absolute {
  position: absolute;
}

.inline-block {
  display: inline-block;
}

.loader {
  display: flex;
  margin: 0.25em 0;
}

.w-2 {
  width: 0.5em;
}

.dash {
  animation: dashArray 2s ease-in-out infinite, dashOffset 2s linear infinite;
}

@keyframes dashArray {
  0% {
    stroke-dasharray: 0 1 359 0;
  }
  50% {
    stroke-dasharray: 0 359 1 0;
  }
  100% {
    stroke-dasharray: 359 1 0 0;
  }
}

@keyframes dashOffset {
  0% {
    stroke-dashoffset: 365;
  }
  100% {
    stroke-dashoffset: 5;
  }
}

.full-screen-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: transparent; /* Cambiado a transparente */
  backdrop-filter: blur(5px); /* Mantiene el desenfoque de fondo */
  transition: backdrop-filter 0.3s ease, background-color 0.3s ease;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}
</style>
