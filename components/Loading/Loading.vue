<template>
    <div :class="{ 'full-screen-overlay': blockFullScreem }">
        <div v-if="sistema === 'TRESGUERRAS'"> 
            <div class="container">
                <svg width="100%" height="100" viewBox="-1 -1 22 22">
                    <defs>
                        <linearGradient id="gradient" x1="0%" y1="0%" x2="100%">
                            <stop offset="0%" style="stop-color: var(--bluelight-sb); stop-opacity: 1" />
                            <stop offset="100%" style="stop-color: var(--purple-sb); stop-opacity: 1" />
                        </linearGradient>
                    </defs>
                    <path style="--order: 7" class="eight e-8" stroke="url(#gradient)"></path>
                    <path style="--order: 6" class="eight e-7" stroke="url(#gradient)"></path>
                    <path style="--order: 5" class="eight e-6" stroke="url(#gradient)"></path>
                    <path style="--order: 4" class="eight e-5" stroke="url(#gradient)"></path>
                    <path style="--order: 3" class="eight e-4" stroke="url(#gradient)"></path>
                    <path style="--order: 2" class="eight e-3" stroke="url(#gradient)"></path>
                    <path style="--order: 1" class="eight e-2" stroke="url(#gradient)"></path>
                    <path style="--order: 0" class="eight e-1" stroke="url(#gradient)"></path>
                </svg>
            </div>
        </div>
        <div v-if="sistema === 'PDLT'"> 
            <div class="container">
                <svg width="100%" height="100" viewBox="-1 -1 22 22">
                    <defs>
                        <linearGradient id="gradient" x1="0%" y1="0%" x2="100%">
                            <stop offset="0%" style="stop-color: var(--bluelight-sb); stop-opacity: 1" />
                            <stop offset="100%" style="stop-color: var(--purple-sb); stop-opacity: 1" />
                        </linearGradient>
                    </defs>
                    <path style="--order: 7" class="eight e-8" stroke="url(#gradient)"></path>
                    <path style="--order: 6" class="eight e-7" stroke="url(#gradient)"></path>
                    <path style="--order: 5" class="eight e-6" stroke="url(#gradient)"></path>
                    <path style="--order: 4" class="eight e-5" stroke="url(#gradient)"></path>
                    <path style="--order: 3" class="eight e-4" stroke="url(#gradient)"></path>
                    <path style="--order: 2" class="eight e-3" stroke="url(#gradient)"></path>
                    <path style="--order: 1" class="eight e-2" stroke="url(#gradient)"></path>
                    <path style="--order: 0" class="eight e-1" stroke="url(#gradient)"></path>
                </svg>
            </div>
        </div>
        <div v-if="sistema === 'UCT ADMIN'">
            <div class="container">
                <svg width="100%" height="100" viewBox="-1 -1 22 22">
                    <defs>
                        <linearGradient id="gradient" x1="0%" y1="0%" x2="100%">
                            <stop offset="0%" style="stop-color: var(--bluelight-sb); stop-opacity: 1" />
                            <stop offset="100%" style="stop-color: var(--purple-sb); stop-opacity: 1" />
                        </linearGradient>
                    </defs>
                    <path style="--order: 7" class="eight e-8" stroke="url(#gradient)"></path>
                    <path style="--order: 6" class="eight e-7" stroke="url(#gradient)"></path>
                    <path style="--order: 5" class="eight e-6" stroke="url(#gradient)"></path>
                    <path style="--order: 4" class="eight e-5" stroke="url(#gradient)"></path>
                    <path style="--order: 3" class="eight e-4" stroke="url(#gradient)"></path>
                    <path style="--order: 2" class="eight e-3" stroke="url(#gradient)"></path>
                    <path style="--order: 1" class="eight e-2" stroke="url(#gradient)"></path>
                    <path style="--order: 0" class="eight e-1" stroke="url(#gradient)"></path>
                </svg>
            </div>
        </div>
    </div>
</template>

<script>
import { useStore } from 'vuex';

export default {
    name: 'LoadingUCT',
    props: {
        blockFullScreem: {
            type: Boolean,
            default: false
        },
    },
    setup() {
        const store = useStore();
        const sistema = store.state.user.modulo_activo.sistema;
        
        return {
            sistema
        }
    },
}
</script>

<style scoped>
/* .container {
    display: flex;
    justify-content: center;
    align-items: center;
    overflow: hidden;
} */
.container svg {
    --spin-duration: 2000ms;
    --infinity-duration: 2000ms;
    --hsl-base-h: 5deg;
    --hsl-base-s: 70%;
    --hsl-base-l: 50%;
    animation: spin81213 var(--spin-duration) linear infinite;
}

.eight {
    --eight-length-px: 60.84563446044922px;
    --offset: calc(var(--order) * 5px);
    animation: infinity8123 var(--infinity-duration) linear infinite;
    d: path("m5 5a1 1 0 0110 0c0 4-10 6-10 10a1 1 0 0010 0c0-4-10-6-10-10");
    fill: none;
    stroke-dasharray: 6px calc(var(--eight-length-px) - 6px);
    stroke-linecap: round;
    stroke-width: calc(1 - var(--order) / 10);
}

@keyframes infinity8123 {
    0% {
        stroke-dashoffset: calc(var(--eight-length-px) + var(--offset));
    }
    100% {
        stroke-dashoffset: var(--offset);
    }
}

@keyframes spin81213 {
    0% {
        transform: rotate(0);
    }
    100% {
        transform: rotate(360deg);
    }
}

.full-screen-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(255, 255, 255, 0.5);
    backdrop-filter: blur(5px);
    transition: backdrop-filter 0.3s ease, background-color 0.3s ease;
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
}
</style>
