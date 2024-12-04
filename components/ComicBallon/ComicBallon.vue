<template>
  <div v-if="texto != '' " class="comic-balloon" :style="balloonStyles">
    <span
      v-for="(word, index) in animatedText"
      :key="index"
      class="balloon-text"
      :style="{ animationDelay: `${index * velocidad}s` }"
    >
      {{ word }}
    </span>

    <div class="balloon-arrow" :style="arrowStyles"></div>
  </div>
  <div v-if="textoHTML != '' " class="EncuestasPublicas-msgAvatar" :style="balloonStyles">
    <span  v-html="textoHTML"></span>
    <div class="balloon-arrow" :style="arrowStyles"></div>
  </div>
</template>

<script>
import { defineComponent, computed } from 'vue';

export default defineComponent({
  name: 'ComicBalloon',
  props: {
    config: {
      type: Object,
      required: true,
      default: () => ({
        borde: 'bottom',
        x: 50,
        y: 50,
      }),
    },
    texto: {
      type: String,
      required: false,
      default: ''
    },
    textoHTML: {
      type: String,
      required: false,
      default: ''
    },
    velocidad: {
      type: Number,
      required: false,
      default: 0.02,
    },
  },
  setup(props) {
    const balloonStyles = computed(() => ({
      position: 'relative',
      padding: '20px',
      background: '#f5f5f5',
      borderRadius: '10px',
      width: 'calc(100% - 20px)',
      height: 'auto',
      boxShadow: 'rgba(0, 0, 0, 0.35) 0px 5px 15px',
    }));

    const arrowStyles = computed(() => {
      const { borde, x, y } = props.config;
      let positionStyles = {};

      switch (borde) {
        case 'top':
          positionStyles = {
            bottom: '100%',
            left: `${x}%`,
            transform: 'translateX(-50%)',
            borderLeft: '10px solid transparent',
            borderRight: '10px solid transparent',
            borderBottom: '10px solid #f5f5f5',
          };
          break;
        case 'bottom':
          positionStyles = {
            top: '100%',
            left: `${x}%`,
            transform: 'translateX(-50%)',
            borderLeft: '10px solid transparent',
            borderRight: '10px solid transparent',
            borderTop: '10px solid #f5f5f5',
          };
          break;
        case 'left':
          positionStyles = {
            top: `${y}%`,
            right: '100%',
            transform: 'translateY(-50%)',
            borderTop: '10px solid transparent',
            borderBottom: '10px solid transparent',
            borderRight: '10px solid #f5f5f5',
          };
          break;
        case 'right':
          positionStyles = {
            top: `${y}%`,
            left: '100%',
            transform: 'translateY(-50%)',
            borderTop: '10px solid transparent',
            borderBottom: '10px solid transparent',
            borderLeft: '10px solid #f5f5f5',
          };
          break;
      }
      return {
        position: 'absolute',
        width: '0',
        height: '0',
        ...positionStyles,
      };
    });

    // Divide el texto en palabras en lugar de caracteres
    const animatedText = computed(() => {
      return props.texto.split(' ').map(word => `${word}\u00A0`);
    });

    return { balloonStyles, arrowStyles, animatedText };
  },
});
</script>

<style scoped>
.comic-balloon {
  position: relative;
  display: inline-block;
  padding: 20px;
  background: #f5f5f5;
  border-radius: 10px;
  width: auto;
  max-width: 100%;
  word-wrap: break-word;
  white-space: pre-wrap; /* Maneja correctamente los espacios y saltos de línea */
  box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.1);
  margin: 10px;
}

.balloon-text {
  opacity: 0;
  display: inline-block;
  animation: fadeIn 0.5s forwards;
}

.balloon-arrow {
  position: absolute;
  width: 0;
  height: 0;
}

@keyframes fadeIn {
  to {
    opacity: 1;
  }
}

.EncuestasPublicas-msgAvatar{
  max-height: 250px;
  overflow-y: auto;
  padding: 20px;
  border-radius: 20px;
  margin: 10px 0;
  margin-right: 5px;
}
</style>
