<template>
  <div 
    class="w-100 bg-white shadow-lg rounded position-relative d-flex justify-content-center mb-5" 
    :style="modoPreview === 'html' ? 'max-width: 580px; height: 82vh; overflow: hidden;' : 'max-width: 580px; aspect-ratio: 1 / 1.4142; overflow: hidden;'"
  >
    <!-- Loader -->
    <div v-if="cargando" class="position-absolute top-0 start-0 w-100 h-100 d-flex flex-column align-items-center justify-content-center bg-white bg-opacity-75" style="z-index: 5;">
      <LoadingUCT class="loader" />
    </div>

    <!-- IFRAME DUAL -->
    <iframe 
      v-if="pdfUrl || htmlPreview"
      :id="iframeId"
      :src="modoPreview === 'pdf' ? pdfUrl : null"
      :srcdoc="modoPreview === 'html' ? processedHtml : null"
      class="w-100 h-100 border-0"
    ></iframe>
    
    <!-- Estado vacío / inicial -->
    <div v-else class="d-flex flex-column align-items-center justify-content-center h-100 text-center p-5 text-muted w-100">
      <h6>{{ emptyTitle }}</h6>
      <p class="small text-secondary">{{ emptyDescription }}</p>
    </div>
  </div>
</template>

<script>
import { defineComponent, computed } from 'vue';
import LoadingUCT from '@/components/Loading/Loading.vue';

export default defineComponent({
  name: 'PDFPreviewSheet',
  components: {
    LoadingUCT
  },
  props: {
    iframeId: {
      type: String,
      required: true
    },
    cargando: {
      type: Boolean,
      default: false
    },
    modoPreview: {
      type: String,
      default: 'html' // 'html' o 'pdf'
    },
    pdfUrl: {
      type: String,
      default: null
    },
    /** HTML crudo devuelto por el backend. El componente se encarga de inyectar
     *  los estilos de escala necesarios para que se vea correctamente en el iframe. */
    htmlPreview: {
      type: String,
      default: null
    },
    emptyTitle: {
      type: String,
      default: '¡Listo para previsualizar!'
    },
    emptyDescription: {
      type: String,
      default: 'Inicia la previsualización para ver los cambios.'
    }
  },
  setup(props) {
    /**
     * Inyecta un bloque <style> que adapta el HTML A4 (210mm × 297mm)
     * al ancho del iframe, escalando correctamente el contenido.
     * Se centraliza aquí para que ningún padre tenga que conocer este detalle.
     */
    const processedHtml = computed(() => {
      if (!props.htmlPreview) return null;

      const scaleStyle = `
        <style>
          /* Forzar que el contenido HTML se adapte al ancho del iframe */
          html, body {
            margin: 0 !important;
            padding: 0 !important;
            width: 210mm !important; 
            min-height: 297mm !important;
            overflow-x: hidden !important;
            overflow-y: auto !important;
          }
          body {
            transform-origin: top left !important;
            transform: scale(calc(100vw / 210mm)) !important;
          }
        </style>
      `;

      if (props.htmlPreview.includes('</head>')) {
        return props.htmlPreview.replace('</head>', `${scaleStyle}</head>`);
      }
      return scaleStyle + props.htmlPreview;
    });

    return { processedHtml };
  }
});
</script>

<style scoped>
.loader {
  width: 80px;
  height: 80px;
}
</style>
