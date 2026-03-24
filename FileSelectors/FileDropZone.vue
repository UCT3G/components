<!-- FileSelector.vue -->
<template>
  <div class="file-selector-container">

    <!-- Contenedor con grid de Bootstrap -->
    <div class="row align-items-stretch" :class="stacked ? 'g-2' : 'g-3'">
      <!-- Zona drag & drop -->
      <div 
        :class="(hasAnyFile && !stacked) ? 'col-md-8' : 'col-12'"
      >
        <div 
          class="file-drop-zone h-100"
          :class="{ 'is-dragover': isDragOver }"
          @dragover.prevent="isDragOver = true"
          @dragleave.prevent="isDragOver = false"
          @drop.prevent="handleDrop"
          @click="triggerFileInput"
        >
          <div class="drop-zone-content">
            <div class="file-icon"></div>
            <p class="drop-text">Arrastra tu archivo o haz clic para seleccionar</p>
            <p class="file-types">
              {{ acceptText }}
            </p>
          </div>

          <input 
            type="file" 
            ref="fileInput"
            class="d-none"
            @change="handleFile"
            :accept="accept"
          />
        </div>
      </div>

      <!-- Columna para información del archivo -->
      <div v-if="hasAnyFile" :class="stacked ? 'col-12' : 'col-md-4'">
        <!-- Archivo seleccionado -->
        <div v-if="selectedFile" class="file-info p-3 bg-light rounded h-100 d-flex flex-column justify-content-center">
          <p class="mb-0 fw-bold text-truncate" :title="selectedFile.name">{{ selectedFile.name }}</p>
          <p class="mb-0 text-muted small">{{ formatFileSize(selectedFile.size) }}</p>
        </div>

        <!-- Archivo existente desde el store -->
        <div v-if="existingFileUrl && !selectedFile" class="file-info p-3 bg-light rounded d-flex justify-content-between align-items-center h-100">
          <div class="text-truncate me-2">
            <p class="mb-0 fw-bold text-truncate" :title="existingFileName">{{ existingFileName }}</p>
            <p class="mb-0 text-muted small">{{ existingFileSize ? formatFileSize(existingFileSize) : 'Archivo actual' }}</p>
          </div>
          <DynamicSvgLoader 
            @click.stop.prevent="downloadFile"
            fileName="icons/CloudArrowDown" 
            title="Descargar archivo"
            class="iconBtn flex-shrink-0"
            width_icon="32px"
            height_icon="32px"
          >
          </DynamicSvgLoader>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { defineComponent, ref, computed, watch } from "vue";
import { toast } from 'vue3-toastify';
import { useStore } from "vuex";
import DynamicSvgLoader from '@/components/LoaderSVG/LoaderSVG.vue';
import { DEV_BASE_URL } from "@/../axios-config.js";

export default defineComponent({
  name: "FileSelector",
  components:{DynamicSvgLoader},
  props: {
    /**
     * Tipos aceptados, ejemplo:
     * ".xlsx,.xls"
     * "image/*"
     * ".pdf"
     * vacío => acepta cualquier tipo
     */
    accept: {
      type: String,
      default: ""
    },
    initialFile: { type: Object, default: null },
    getterPath: { type: String, default: null }, // ruta del getter en el store
    basePath: { type: String, default: "" }, // ej: "archivos/psicometricos/pyxoom/competencias/"
    stacked: { type: Boolean, default: false } // Forzar diseño vertical
  },

  emits: ["file-selected"],

  setup(props, { emit }) {
    const store = useStore();
    const isDragOver = ref(false);
    const selectedFile = ref(null);
    const fileInput = ref(null);
    const existingFileSize = ref(null);

    // Determinar si hay algún archivo presente (nuevo o remoto)
    const hasAnyFile = computed(() => !!selectedFile.value || !!existingFileUrl.value);

    // Obtener URL del archivo desde el store usando el getter
    const existingFileUrl = computed(() => {
      if (!props.getterPath) return null;
      
      try {
        const fileName = store.getters[props.getterPath];
        if (!fileName) return null;
        
        // Construir la URL completa
        return `${DEV_BASE_URL}${props.basePath}${fileName}`;
      } catch (error) {
        console.warn(`No se pudo acceder al getter: ${props.getterPath}`, error);
        return null;
      }
    });

    // Watch para obtener el tamaño del archivo remoto
    watch(existingFileUrl, async (newUrl) => {
      if (newUrl) {
        try {
          const response = await fetch(newUrl, { method: 'HEAD' });
          if (response.ok) {
            const size = response.headers.get('content-length');
            if (size) existingFileSize.value = parseInt(size);
          }
        } catch (error) {
          console.warn("No se pudo obtener el tamaño del archivo remoto", error);
        }
      } else {
        existingFileSize.value = null;
      }
    }, { immediate: true });

    const existingFileName = computed(() => {
      if (!props.getterPath) return null;
      return store.getters[props.getterPath] || null;
    });

    const downloadFile = async () => {
      if (!existingFileUrl.value || !existingFileName.value) {
        toast.error('No se pudo descargar el archivo');
        return;
      }

      try {
        const response = await fetch(existingFileUrl.value);
        if (!response.ok) throw new Error("Error al descargar archivo");

        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);

        const link = document.createElement("a");
        link.href = url;
        link.download = existingFileName.value;
        document.body.appendChild(link);
        link.click();
        link.remove();

        window.URL.revokeObjectURL(url);
      } catch (error) {
        toast.error("No se pudo descargar el archivo");
        console.error(error);
      }
    };


    const triggerFileInput = () => fileInput.value.click();

    const acceptExtensions = computed(() => {
      if (!props.accept) return "Cualquier archivo";
      return props.accept.replaceAll(",", ", ");
    });

    const acceptText = computed(() =>
      props.accept ? `Formatos soportados: ${acceptExtensions.value}` : "Cualquier tipo de archivo"
    );

    const isValidFileType = (file) => {
      if (!props.accept) return true; 
      const allowed = props.accept.split(",");
      return allowed.some(ext => file.name.toLowerCase().endsWith(ext.trim().toLowerCase()));
    };

    const handleDrop = (e) => {
      isDragOver.value = false;

      const file = e.dataTransfer.files[0];
      if (!file) return;

      if (!isValidFileType(file)) {
        toast.error(`Archivo no válido. Formatos permitidos: ${acceptExtensions.value}`);
        return;
      }

      selectedFile.value = file;
      emit("file-selected", file);
    };

    const handleFile = (e) => {
      const file = e.target.files[0];
      if (!file) return;

      if (!isValidFileType(file)) {
        toast.error(`Archivo no válido. Formatos permitidos: ${acceptExtensions.value}`);
        return;
      }

      selectedFile.value = file;
      emit("file-selected", file);
    };

    const formatFileSize = (bytes) => {
      if (!bytes) return "0 Bytes";
      const k = 1024;
      const sizes = ["Bytes", "KB", "MB"];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return (bytes / Math.pow(k, i)).toFixed(2) + " " + sizes[i];
    };

    return {
      isDragOver,
      selectedFile,
      fileInput,
      triggerFileInput,
      acceptText,
      handleDrop,
      handleFile,
      formatFileSize,
      downloadFile,
      existingFileName,
      existingFileUrl,
      hasAnyFile,
      existingFileSize
    };
  }
});
</script>

<style scoped>
.file-selector-container {
  margin-bottom: 1rem;
}

.file-drop-zone {
  border: 2px dashed var(--bs-gray-400);
  border-radius: 0.5rem;
  padding: 2rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  background-color: var(--bs-gray-100);
}

.file-drop-zone:hover {
  border-color: var(--bs-gray-400);
  background-color: var(--bs-gray-200);
}

.file-drop-zone.is-dragover {
  border-color: none;
  background-color: var(--bs-blue-100);
}

.drop-zone-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.file-types {
  margin: 0;
  font-size: 0.875rem;
  color: var(--bs-gray-500);
}

.file-info {
  border-left: 4px solid var(--purple-sb);
}

:deep(.iconBtn svg) {
  width: 100% !important;
  height: 100% !important;
}

</style>
