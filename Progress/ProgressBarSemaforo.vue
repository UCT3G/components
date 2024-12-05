<template>
    <div class="row barra-nav">
        <div id="circle-bar-cont" class="col d-flex justify-content-between align-items-center">
            <div class="circle-container">
                <div v-for="(circle, index) in circles" :key="index" class="circle"
                    :class="{ active: index < numLitCircles }"></div>
            </div>
            <div class="texto-avance">
                {{ Math.floor(avance) }}%
            </div>
        </div>
    </div>
</template>

<script>
import { computed, defineComponent, onMounted, ref } from 'vue';
import { useStore } from 'vuex';

export default defineComponent({
    setup() {
        const store = useStore();
        const circles = ref([]);
        const avance = computed(
            () => store.getters["UsuarioCompetencias/promedioAvance"]
        );

        onMounted(() => {
            createCircles();
        });

        const createCircles = () => {
            circles.value = Array(11).fill({ color: 'rgba(0, 0, 0, 0.2)' });
        };

        const numLitCircles = computed(() => {
            const numCircles2 = avance.value / 9.09;
            const numCircles = numCircles2 - Math.floor(numCircles2) <= 0.9 ? Math.floor(numCircles2) : Math.ceil(numCircles2);
            return numCircles;
        });

        return {
            avance,
            circles,
            numLitCircles
        }
    }
})
</script>

<style scoped>
.barra-nav {
    width: 100%;
    height: 100%;
    background-color: var(--haze);
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    border-radius: 50px;
    display: flex;
    align-items: center;
    padding: 0 10px;
}

#circle-bar-cont {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

@keyframes fillCircle {
    0% {
        transform: scale(0);
        opacity: 0.2;
    }

    50% {
        transform: scale(1.1);
        opacity: 1;
    }

    100% {
        transform: scale(1);
        opacity: 1;
    }
}

.circle-container {
    display: flex;
    gap: 10px;
    align-items: center;
    align-content: center
}

.circle {
    width: 25px;
    height: 25px;
    border-radius: 50%;
    transition: background-color 0.3s, opacity 0.3s;
    opacity: 0.2;
}

.texto-avance{
    color: var(--card-title-color);
    font-size: 18px;
    font-style: italic;
    font-weight: bolder;
}

@media screen and (min-width: 1200px) {
    .circle {
        width: 25px;
        height: 25px;
    }
}

/* Para pantallas medianas */
@media screen and (max-width: 1199px) {
    .circle {
        width: 22px;
        height: 22px;
    }
}

/* Para pantallas más pequeñas */
@media screen and (max-width: 992px) {
    .circle {
        width: 17px;
        height: 17px;
    }

    .barra-nav {
        padding: 0 5px;
    }
}

@media screen and (max-width: 768px) {
    .circle {
        width: 22px;
        height: 22px;
    }

    .texto-avance{
    font-size: 15px;
}
}

@media screen and (max-width: 576px) {
    .circle {
        width: 13px;
        height: 13px;
    }
}

@media screen and (max-width: 375px) {
    .circle {
        width: 10px;
        height: 10px;
    }

    .circle-container {
        display: flex;
        gap: 5px;
        /* Espacio entre los círculos */
    }

    .texto-avance{
        font-size: 12px;
    }
}

.circle.active {
    animation: fillCircle 7s infinite;
    /* Aplica la animación al estar activo */
    opacity: 0.05;
    /* Estado activo */
}

/* Añadir el retraso para cada círculo */
.circle.active:nth-child(1) {
    animation-delay: 0s;
    background: linear-gradient(to bottom right, rgb(255, 0, 255), rgb(237, 30, 121));
}

.circle.active:nth-child(2) {
    animation-delay: 0.3s;
    background: linear-gradient(to bottom right, rgb(255, 0, 255), rgb(237, 30, 121));
}

.circle.active:nth-child(3) {
    animation-delay: 0.6s;
    background: linear-gradient(to bottom right, rgb(255, 0, 255), rgb(237, 30, 121));
}

.circle.active:nth-child(4) {
    animation-delay: 0.9s;
    background: linear-gradient(to right, rgb(237, 30, 121), rgb(251, 176, 59));
}

.circle.active:nth-child(5) {
    animation-delay: 1.2s;
    background: linear-gradient(to bottom right, rgb(255, 255, 0), rgb(252, 238, 33));
}

.circle.active:nth-child(6) {
    animation-delay: 1.5s;
    background: linear-gradient(to bottom right, rgb(255, 255, 0), rgb(252, 238, 33));
}

.circle.active:nth-child(7) {
    animation-delay: 1.8s;
    background: linear-gradient(to bottom right, rgb(255, 255, 0), rgb(252, 238, 33));
}

.circle.active:nth-child(8) {
    animation-delay: 2.1s;
    background: linear-gradient(to right, rgb(0, 255, 0), rgb(41, 171, 226));
}

.circle.active:nth-child(9) {
    animation-delay: 2.4s;
    background: linear-gradient(to bottom right, rgb(0, 255, 255), rgb(0, 0, 255));
}

.circle.active:nth-child(10) {
    animation-delay: 2.7s;
    background: linear-gradient(to bottom right, rgb(0, 255, 255), rgb(0, 0, 255));
}

.circle.active:nth-child(11) {
    animation-delay: 3s;
    background: linear-gradient(to bottom right, rgb(0, 255, 255), rgb(0, 0, 255));
}


/* background: linear-gradient(to right, rgb(128, 231, 165), rgb(58, 190, 202));  Color de la pestaña */
.circle:nth-child(1) {
    background-color: rgba(255, 0, 255, 0.5);
}

.circle:nth-child(2) {
    background-color: rgba(237, 30, 121, 0.5);
}

.circle:nth-child(3) {
    background-color: rgba(237, 30, 121, 0.5);
}

.circle:nth-child(4) {
    background-color: rgba(251, 176, 59, 0.5);
}

.circle:nth-child(5) {
    background-color: rgba(255, 255, 0, 0.5);
}

.circle:nth-child(6) {
    background-color: rgba(252, 238, 33, 0.5);
}

.circle:nth-child(7) {
    background-color: rgba(0, 255, 0, 0.5);
}

.circle:nth-child(8) {
    background-color: rgba(0, 255, 0, 0.5);
}

.circle:nth-child(9) {
    background-color: rgba(0, 255, 0, 0.5);
}

.circle:nth-child(10) {
    background-color: rgba(0, 0, 255, 0.5);
}

.circle:nth-child(11) {
    background-color: rgba(0, 0, 255, 0.5);
}

.circle.active:nth-child(1) {
    background: linear-gradient(to bottom right, rgb(255, 0, 255), rgb(237, 30, 121))
}

.circle.active:nth-child(2) {
    background: linear-gradient(to bottom right, rgb(255, 0, 255), rgb(237, 30, 121))
}

.circle.active:nth-child(3) {
    background: linear-gradient(to bottom right, rgb(255, 0, 255), rgb(237, 30, 121))
}

.circle.active:nth-child(4) {
    background: linear-gradient(to right, rgb(237, 30, 121), rgb(251, 176, 59))
}

.circle.active:nth-child(5) {
    background: linear-gradient(to bottom right, rgb(255, 255, 0), rgb(252, 238, 33))
}

.circle.active:nth-child(6) {
    background: linear-gradient(to bottom right, rgb(255, 255, 0), rgb(252, 238, 33))
}

.circle.active:nth-child(7) {
    background: linear-gradient(to bottom right, rgb(255, 255, 0), rgb(252, 238, 33))
}

.circle.active:nth-child(8) {
    background: linear-gradient(to right, rgb(0, 255, 0), rgb(41, 171, 226))
}

.circle.active:nth-child(9) {
    background: linear-gradient(to bottom right, rgb(0, 255, 255), rgb(0, 0, 255))
}

.circle.active:nth-child(10) {
    background: linear-gradient(to bottom right, rgb(0, 255, 255), rgb(0, 0, 255))
}

.circle.active:nth-child(11) {
    background: linear-gradient(to bottom right, rgb(0, 255, 255), rgb(0, 0, 255))
}
</style>