<template>
  <div 
    class="position-relative img-upload-slot-wrapper" 
    :class="{
      'edit-mode-active': isEditMode,
      'drag-over': isDragging && isEditMode
    }" 
    :title="isEditMode ? tooltip : ''"
    @click="isEditMode && inputImg.click()"
    @dragover.prevent="onDragOver"
    @dragleave.prevent="onDragLeave"
    @drop.prevent="onDrop"
  >
    <!-- Imagen Principal -->
    <img 
        v-if="hasImage" 
        :src="imageUrl" 
        :alt="tooltip" 
        class="img-fluid img-upload-slot-fluid"
        :style="{ objectFit: objectFit }"
    >

    <!-- Overlay / Placeholder de Edición -->
    <div v-if="isEditMode" class="img-upload-slot-overlay" :class="{'placeholder-visible': !hasImage || isDragging}">
        <DynamicSvgLoader 
            class="upload-slot-icon-loader"
            :fileName="iconName"
            :width_icon="iconSize"
            :height_icon="iconSize"
        />
    </div>

    <!-- Input Oculto -->
    <input 
        ref="inputImg" 
        type="file" 
        :accept="accept" 
        :multiple="multiple"
        class="d-none" 
        @change="onFileSelected"
    >
  </div>
</template>

<script>
import { defineComponent, ref } from 'vue';
import DynamicSvgLoader from '@/components/LoaderSVG/LoaderSVG.vue';

export default defineComponent({
    name: 'ImageUploadSlot',
    components: {
        DynamicSvgLoader
    },
    props: {
        imageUrl: { type: String, default: '' },   // URL de la imagen a mostrar
        hasImage: { type: Boolean, default: false },  // Indica si hay una imagen válida cargada
        isEditMode: { type: Boolean, default: false }, // Habilita el modo de edición (click para cargar, hover effects)
        tooltip: { type: String, default: '' }, // Texto para el tooltip y alt de la imagen
        campo: { type: String, required: true },  // Identificador del campo (se devuelve en el evento 'image-selected')
        objectFit: { type: String, default: 'contain' },  // Ajuste de la imagen: 'contain', 'cover', 'fill', etc.
        iconName: { type: String, default: 'icons/image' },  // Nombre del archivo SVG para el icono (dentro de assets)
        iconSize: { type: String, default: '25px' }, // Tamaño del icono
        accept: { type: String, default: 'image/*' }, // Tipos de archivo permitidos para subir
        multiple: { type: Boolean, default: false } // Permitir subir múltiples archivos simultáneamente
    },
    emits: ['image-selected'],
    setup(props, { emit }) {
        const inputImg = ref(null);
        const isDragging = ref(false);

        const emitPayload = (fileList) => {
            if (props.multiple) {
                emit('image-selected', { campo: props.campo, files: Array.from(fileList) });
            } else {
                emit('image-selected', { campo: props.campo, file: fileList[0] });
            }
        };

        const onFileSelected = (event) => {
            const files = event.target.files;
            if (!files || files.length === 0) return;
            emitPayload(files);
        };

        const onDragOver = (event) => {
            if (!props.isEditMode) return;
            if (event.dataTransfer.types.includes('Files')) {
                isDragging.value = true;
            }
        };

        const onDragLeave = () => {
            isDragging.value = false;
        };

        const onDrop = (event) => {
            if (!props.isEditMode) return;
            isDragging.value = false;

            const files = event.dataTransfer.files;
            if (files && files.length > 0) {
                emitPayload(files);
            }
        };

        return {
            inputImg,
            isDragging,
            onFileSelected,
            onDragOver,
            onDragLeave,
            onDrop
        };
    }
});
</script>

<style scoped>
    .img-upload-slot-wrapper {
        overflow: hidden;
        height: 100%;
        width: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.2s ease;
    }

    .img-upload-slot-wrapper.edit-mode-active { 
        cursor: pointer; 
    }

    .img-upload-slot-fluid {
        max-width: 100%;
        max-height: 100%;
        transition: filter 0.3s ease;
    }

    .img-upload-slot-overlay {
        position: absolute;
        inset: 0;
        background: var(--bs-gray-100);
        display: flex;
        align-items: center;
        justify-content: center;
        opacity: 0;
        transition: opacity 0.2s ease, background 0.2s ease, border-color 0.2s ease;
        color: white;
        border: 2px dashed var(--bs-gray-400);
        box-sizing: border-box;
    }

    /* Si no hay imagen, el overlay/placeholder es siempre visible en modo edición */
    .img-upload-slot-overlay.placeholder-visible {
        opacity: 1;
    }

    /* Efectos de interacción en modo edición */
    .img-upload-slot-wrapper.edit-mode-active:hover {
        transform: scale(1.01);
        z-index: 5;
    }

    .img-upload-slot-wrapper.edit-mode-active:hover .img-upload-slot-overlay {
        opacity: 1;
        background: var(--bs-gray-200);
        border-color: var(--bs-gray-500);
    }

    /* Feedback visual al arrastrar */
    .img-upload-slot-wrapper.drag-over .img-upload-slot-overlay {
        opacity: 1 !important;
        background: var(--bs-gray-200) !important;
        border-color: var(--bs-primary) !important;
        border-style: dashed !important;
    }

    /* Ajustes para el loader de SVG */
    .upload-slot-icon-loader {
        --icon_color: var(--bs-gray-600);
        --icon_color_hover: var(--bs-gray-800);
    }

    .upload-slot-icon-loader :deep(.loaderSVG-contend) {
        padding: 0 !important;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .upload-slot-icon-loader :deep(svg) {
        width: 100% !important;
        height: 100% !important;
        color:var(--bs-gray-400) !important;
    }
</style>
