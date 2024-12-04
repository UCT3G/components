<template>
  <div class="carousel">
    <div class="inner" ref="inner" :style="innerStyles">
      <slot name="card" v-for="card in cards" :card="card" :key="card"></slot>
    </div>
  </div>
  <button
    v-if="showButtons && currentScrollPosition > 0"
    class="carousel-button left"
    @click="anterior"
    :disabled="currentScrollPosition === 0"
  >
    <DynamicSvgLoader
      class="d-block p-0 icono-boton"
      fileName="icons/D_FLECHA_I"
      width_icon="15px"
      :icon_active="true"
    >
    </DynamicSvgLoader>
  </button>
  <button
    v-if="showButtons && currentScrollPosition < maxScrollPosition"
    class="carousel-button right"
    @click="siguiente"
    :disabled="currentScrollPosition >= maxScrollPosition"
  >
    <DynamicSvgLoader
      class="d-block p-0 icono-boton"
      fileName="icons/D_FLECHA_D"
      width_icon="15px"
      :icon_active="true"
    >
    </DynamicSvgLoader>
  </button>
</template>

<script>
import { onMounted, onUnmounted, ref, watch, nextTick  } from "vue";
import DynamicSvgLoader from "@/components/LoaderSVG/LoaderSVG.vue";

export default {
  components: {
    DynamicSvgLoader,
  },
  props: {
    cards: {
      type: Array,
      required: true,
    },
  },
  setup(props) {
    const innerStyles = ref({});
    const inner = ref(null);
    const currentScrollPosition = ref(0);
    const step = ref(0);
    const showButtons = ref(false);
    const cardsScroll = ref([]);
    const maxScrollPosition = ref(0);

    const setStep = () => {
      nextTick(() => {
        if (inner.value && cardsScroll.value.length > 0) {
          
          const cardWidth = inner.value.scrollWidth / cardsScroll.value.length;
          
          step.value = cardWidth;
          showButtons.value = inner.value.scrollWidth > inner.value.clientWidth;
          maxScrollPosition.value = Math.max(
            inner.value.scrollWidth - inner.value.clientWidth,
            0
          );
        }
      });
    };

    const siguiente = () => {
      if (currentScrollPosition.value < maxScrollPosition.value) {
        currentScrollPosition.value = Math.min(
          currentScrollPosition.value + step.value,
          maxScrollPosition.value
        );
        updateTranslate();
      }
    };

    const anterior = () => {
      if (currentScrollPosition.value > 0) {
        currentScrollPosition.value = Math.max(
          currentScrollPosition.value - step.value,
          0
        );
        updateTranslate();
      }
    };

    const updateTranslate = () => {
      innerStyles.value = {
        transform: `translateX(-${currentScrollPosition.value}px)`,
        transition: "transform 0.4s",
      };
    };

    const handleResize = () => {
      setStep();
      currentScrollPosition.value = Math.min(
        currentScrollPosition.value,
        maxScrollPosition.value
      );
      updateTranslate();
    };

    onMounted(() => {
      window.addEventListener("load", () => {
        setStep();
      });
      window.addEventListener("resize", handleResize);
    });

    onUnmounted(() => {
      window.removeEventListener("resize", handleResize);
    });

    watch(() => 
    props.cards,
    (newVal) => {
    cardsScroll.value = newVal;
    setStep(); // Llamar a setStep si quieres que los cálculos se hagan tras actualizar los datos
  },
  { immediate: true });

    return {
      innerStyles,
      inner,
      siguiente,
      anterior,
      currentScrollPosition,
      maxScrollPosition,
      showButtons,
    };
  },
};
</script>

<style scoped>
.carousel {
  overflow: hidden;
  margin-left: 2rem;
  margin-right: 2rem;
  padding: 0.5rem;
}

.inner {
  white-space: nowrap;
  transition: transform 0.2s;
}

.carousel-button {
  cursor: pointer;
  position: absolute;
  top: 45%;
  transform: translateY(-45%);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  color: #fff;
  border-color: unset;
  padding: 3px 12px !important;
  border-radius: 5px !important;
  background: var(--gris);
  border: none;
  outline: none;
  transition: transform 0.3s ease;
  margin: 5px;
  font-size: 12px;
  height: 31px;
}

.carousel-button:hover {
  background: linear-gradient(90deg, var(--purple-sb) 0%, var(--bluelight-sb) 100%);
}

.icono-boton:hover {
  fill: var(--blanco);
}

.left {
  left: 0;
}

.right {
  right: 0;
}
</style>
