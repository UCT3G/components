<template>
  <button class="btn-secondary" :disabled="isDisabled" @click="handleClick">
    <span v-html="svgContent" class="icon"></span>
    
    <div class="btn-secondary-contenido"><slot></slot></div>
  </button>
</template>

<script>
import { ref, watch } from 'vue';
import { svgCache } from '@/utils/svgCache.js'; // Asegúrate de crear este archivo

export default {
  name: 'BotonIconoSecondary',
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
      default: '10px' // Este es el ancho predeterminado del icono SVG
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
          console.log(`SVG '${props.iconName}' cargado desde promesa en caché`);
        } else {
          // Si es el contenido SVG, usarlo directamente
          svgContent.value = cached;
          console.log(`SVG '${props.iconName}' cargado desde caché`);
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
            console.log(`SVG '${props.iconName}' cargado desde archivo y almacenado en caché`);
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
        emit('clickSecondary'); // Corregí 'clickPrymary' a 'clickSecondary'
      }
    };

    return { handleClick, svgContent };
  }
}
</script>

<style scoped>
.btn-secondary {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 5px;
    color: var(----card-title-color);
    font-family: 'MonserratSemiBold';
    border-color: unset;
    padding: 3px 12px!important;
    border-radius: 10px!important;
    background: var(--gris);
    cursor: pointer;
    border: none;
    outline: none;
    transition: transform 0.3s ease;
    margin:5px;
    font-size: 13px;
    box-shadow: rgba(50, 50, 93, 0.25) 0px 6px 12px -2px, rgba(0, 0, 0, 0.3) 0px 3px 7px -3px;
}

.btn-secondary:hover {
    background: var(--purple-sb);
    border: unset;
    fill: var(--babyBlue);
}

.btn-secondary:active {
    background: var(--purple-sb);
}

.btn-secondary .icon {      
    min-height: 25px;
    padding: 3px;
}   

.btn-secondary:disabled {
    background: var(--purple-sb)!important;
    cursor: not-allowed;
    fill: var(--babyBlue);
}

.btn-secondary svg{
  fill: var(--gris);
}

.btn-secondary-contenido{
  width: 70%;
}
</style>
