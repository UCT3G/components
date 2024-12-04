<template>
  <!-- Aplica los tamaños utilizando estilos enlazados -->
  <div
    v-html="svgContent"
    :class="dynamicClass"
    :style="{ width: width_icon, height: height_icon }"
  ></div>
</template>

<script>
const svgCache = {}; // Objeto de caché para almacenar los SVG y promesas

export default {
  name: 'DynamicSvgLoader',
  props: {
    fileName: {
      type: String,
      required: true,
    },
    width_icon: {
      type: String,
      default: '0px',
    },
    height_icon: {
      type: String,
      default: 'auto',
    },
    icon_active: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      svgContent: '',
    };
  },
  computed: {
    dynamicClass() {
      return this.icon_active ? 'loaderSVG-contend-selected' : 'loaderSVG-contend';
    },
  },
  watch: {
    fileName: {
      handler: 'loadSvg',
      immediate: true,
    },
  },
  methods: {
    async loadSvg() {
      if (svgCache[this.fileName]) {
        const cached = svgCache[this.fileName];
        if (cached instanceof Promise) {
          // Si es una promesa, esperar a que se resuelva
          this.svgContent = await cached;
          //console.log('SVG cargado desde promesa en caché');
        } else {
          // Si es el contenido SVG, usarlo directamente
          this.svgContent = cached;
          //console.log('SVG cargado desde caché');
        }
      } else {
        // Iniciar la carga del SVG y almacenar la promesa en el caché
        const fetchPromise = (async () => {
          try {
            const svgPath = require(`@/assets/images/${this.fileName}.svg`);
            const response = await fetch(svgPath);
            const svg = await response.text();
            // Una vez cargado, reemplazar la promesa en el caché con el contenido SVG
            svgCache[this.fileName] = svg;
            //console.log('SVG cargado desde archivo y almacenado en caché');
            return svg;
          } catch (error) {
            console.error('Error al cargar el SVG:', error);
            const errorSvg =
              '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100"><text y="50%" x="50%" dy="0.3em" text-anchor="middle" fill="red">Error</text></svg>';
            svgCache[this.fileName] = errorSvg; // Almacenar el SVG de error en el caché
            return errorSvg;
          }
        })();
        // Almacenar la promesa en el caché
        svgCache[this.fileName] = fetchPromise;
        this.svgContent = await fetchPromise;
      }
    },
    loadDefaultSvg() {
      // SVG de error por defecto
      this.svgContent =
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100"><text y="50%" x="50%" dy="0.3em" text-anchor="middle" fill="red">Error</text></svg>';
    },
  },
};
</script>

<style>
.loaderSVG-contend,
.loaderSVG-contend-selected {
  fill: var(--icon_color);
  cursor: pointer;
  padding: 10px;
  position: relative;
  box-sizing: content-box;
}
.loaderSVG-contend:hover {
  fill: var(--icon_color_hover, var(--icon_color));
}
.loaderSVG-contend-selected {
  fill: var(--icon_color_selected);
}
.loaderSVG-contend svg {
  /* Estilos adicionales si es necesario */
}
</style>
