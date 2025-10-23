<template>
  <button class="btn-primary" :disabled="isDisabled" @click="handleClick">
    <span v-html="svgContent" class="icon"></span>
    <slot></slot>
  </button>
</template>

<script>
import { ref, watch } from 'vue';
import { svgCache } from '@/utils/svgCache.js'; // Asegúrate de crear este archivo

export default {
  name: 'BotonIconoPrimary',
  props: {
    iconName: {
      type: String,
      required: true
    },
    isDisabled: {
      type: Boolean,
      default: false
    },
    width_icon: {
      type: String,
      default: '10px'
    }
  },
  setup(props, { emit }) {
    const svgContent = ref('');

    const loadSvg = async () => {
      if (svgCache[props.iconName]) {
        const cached = svgCache[props.iconName];
        if (cached instanceof Promise) {
          // Si es una promesa, esperar a que se resuelva
          svgContent.value = await cached;
        } else {
          // Si es el contenido SVG, usarlo directamente
          svgContent.value = cached;
        }
      } else {
        // Iniciar la carga del SVG y almacenar la promesa en el caché
        const fetchPromise = (async () => {
          try {
            const svgPath = require(`@/assets/images/icons/${props.iconName}`);
            const response = await fetch(svgPath);
            const svgText = await response.text();
            const modifiedSvg = svgText.replace(/<svg /, `<svg style="width: ${props.width_icon};" `);
            // Reemplazar la promesa con el contenido SVG en el caché
            svgCache[props.iconName] = modifiedSvg;
            return modifiedSvg;
          } catch (error) {
            console.error('Error loading the SVG:', error);
            const errorSvg =
              '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100"><text y="50%" x="50%" dy="0.3em" text-anchor="middle" fill="red">Error</text></svg>';
            svgCache[props.iconName] = errorSvg; // Almacenar el SVG de error en el caché
            return errorSvg;
          }
        })();
        // Almacenar la promesa en el caché
        svgCache[props.iconName] = fetchPromise;
        svgContent.value = await fetchPromise;
      }
    };

    watch(() => props.iconName, loadSvg, { immediate: true });

    const handleClick = () => {
      if (!props.isDisabled) {
        emit('clickPrimary'); // Corregí 'clickPrymary' a 'clickPrimary'
      }
    };

    return { handleClick, svgContent };
  }
};
</script>

<style scoped>
.btn-primary {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  color: #fff;
  background-color: #007bff;
  border-color: unset;
  padding: 20px!important;
  border-radius: 20px !important;
  background: var(--blueBerry);
  cursor: pointer;
  border: none;
  outline: none;
  transition: transform 0.3s ease;
  margin: 5px;
  font-size: 12px;
  height: 31px;
  width: 98%;
}

.btn-primary:hover {
  background: var(--purple-sb);
}

.btn-primary:active {
  background: var(--purple-sb);
}

.icon {
  fill: var(--babyBlue);
  min-height: 30px;
  padding: 3px;
}

.btn-primary:disabled {
  background: var(--purple-sb)!important;
  cursor: not-allowed;
}
</style>
