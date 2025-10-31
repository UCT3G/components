<template>
  <button
    class="btn-icon-only"
    :disabled="isDisabled"
    :title="title"
    :aria-label="title || iconName"
    @click="handleClick"
    :style="{
      '--icon-color': color,
      '--icon-hover-color': hoverColor,
      '--icon-size': width_icon
    }"
  >
    <span v-html="svgContent" class="icon"></span>
  </button>
</template>

<script>
import { ref, watch } from 'vue';
import { svgCache } from '@/utils/svgCache.js';

export default {
  name: 'ButtonOnlyIcon',
  emits: ['click'],
  props: {
    iconName: { type: String, required: true },
    isDisabled: { type: Boolean, default: false },
    width_icon: { type: String, default: '18px' }, // <- Cambia a '26px' donde lo uses
    color: { type: String, default: 'var(--negro)' },
    hoverColor: { type: String, default: 'var(--blueBerry)' },
    title: { type: String, default: '' }
  },
  setup(props, { emit }) {
    const svgContent = ref('');

    // Quita fills/strokes duros y estilos inline que fijen color/tamaño
    const normalizeSvg = (svgText) => {
      let txt = svgText
        // Quitar width/height del <svg ...> para que CSS mande
        .replace(/\s(width|height)="[^"]*"/gi, '')
        // Reemplazar atributos fill/stroke por currentColor
        .replace(/\sfill="[^"]*"/gi, '')
        .replace(/\sstroke="[^"]*"/gi, '')
        // Quitar estilos inline que pongan fill/stroke
        .replace(/\sstyle="[^"]*"/gi, (m) => {
          const limpio = m
            .replace(/fill\s*:\s*[^;"]*;?/gi, '')
            .replace(/stroke\s*:\s*[^;"]*;?/gi, '')
            .replace(/stroke-width\s*:\s*[^;"]*;?/gi, '')
            .replace(/;\s*;/g, ';')
            .replace(/\sstyle="\s*"/, '');
          return limpio.trim() === 'style=""' ? '' : limpio;
        });
      // Añadir fill/stroke en el tag raíz solo si de plano no hay nada
      // (normalmente no hace falta porque CSS lo forzará con !important)
      return txt;
    };

    const loadSvg = async () => {
      try {
        if (svgCache[props.iconName]) {
          const cached = svgCache[props.iconName];
          svgContent.value = cached instanceof Promise ? await cached : cached;
          return;
        }

        const fetchPromise = (async () => {
          try {
            const svgPath = require(`@/assets/images/icons/${props.iconName}`);
            const response = await fetch(svgPath);
            const svgText = await response.text();
            const modifiedSvg = normalizeSvg(svgText);
            svgCache[props.iconName] = modifiedSvg;
            return modifiedSvg;
          } catch (error) {
            console.error('Error loading the SVG:', error);
            const errorSvg =
              '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><text y="50%" x="50%" dy=".3em" text-anchor="middle">!</text></svg>';
            svgCache[props.iconName] = errorSvg;
            return errorSvg;
          }
        })();

        svgCache[props.iconName] = fetchPromise;
        svgContent.value = await fetchPromise;
      } catch (e) {
        console.error(e);
      }
    };

    watch(() => props.iconName, loadSvg, { immediate: true });

    const handleClick = () => {
      if (!props.isDisabled) {
        // Emite ambos por compatibilidad
        emit('click');
        //emit('clickPrimary');
      }
    };

    return { svgContent, handleClick };
  }
};
</script>

<style scoped>
.btn-icon-only {
  background: transparent;
  border: none;
  outline: none;
  padding: 0;
  margin: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;

  /* color base del icono */
  color: var(--icon-color);

  /* área clickeable */
  min-width: calc(var(--icon-size) + 8px);
  min-height: calc(var(--icon-size) + 8px);
}

/* Asegurar que el SVG sí cambie de tamaño con la prop */
.icon :where(svg) {
  width: var(--icon-size) !important;
  height: var(--icon-size) !important;
  display: block;
}

/* Forzar hover por fill/stroke (y herencia) */
.btn-icon-only:hover:not(:disabled) .icon :where(svg),
.btn-icon-only:hover:not(:disabled) .icon :where(svg *) {
  fill: var(--icon-hover-color) !important;
  stroke: var(--icon-hover-color) !important;
}

.btn-icon-only:focus-visible {
  box-shadow: 0 0 0 2px color-mix(in srgb, var(--icon-hover-color), white 70%);
  border-radius: 6px;
}

.btn-icon-only:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Color normal por si algún nodo no hereda */
.icon :where(svg),
.icon :where(svg *) {
  fill: currentColor !important;
  stroke: currentColor !important;
}
</style>
