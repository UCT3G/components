<template>
  <div 
    class="position-relative img-upload-slot-wrapper" 
    :class="{'edit-mode-active': isEditMode}" 
    :title="isEditMode ? tooltip : ''"
    @click="isEditMode && inputImg.click()"
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
    <div v-if="isEditMode" class="img-upload-slot-overlay" :class="{'placeholder-visible': !hasImage}">
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
        accept="image/*" 
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
        // URL de la imagen a mostrar
        imageUrl: { type: String, default: '' },
        // Indica si hay una imagen válida cargada
        hasImage: { type: Boolean, default: false },
        // Habilita el modo de edición (click para cargar, hover effects)
        isEditMode: { type: Boolean, default: false },
        // Texto para el tooltip y alt de la imagen
        tooltip: { type: String, default: '' },
        // Identificador del campo (se devuelve en el evento 'image-selected')
        campo: { type: String, required: true },
        // Ajuste de la imagen: 'contain', 'cover', 'fill', etc.
        objectFit: { type: String, default: 'contain' },
        // Nombre del archivo SVG para el icono (dentro de assets)
        iconName: { type: String, default: 'icons/image' },
        // Tamaño del icono
        iconSize: { type: String, default: '25px' }
    },
    emits: ['image-selected'],
    setup(props, { emit }) {
        const inputImg = ref(null);

        const onFileSelected = (event) => {
            const file = event.target.files[0];
            if (!file) return;
            emit('image-selected', { campo: props.campo, file });
        };

        return {
            inputImg,
            onFileSelected
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
        background: rgba(0, 0, 0, 0.15);
        display: flex;
        align-items: center;
        justify-content: center;
        opacity: 0;
        transition: opacity 0.2s ease, background 0.2s ease;
        color: white;
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
        background: rgba(0, 0, 0, 0.3);
    }

    /* Ajustes para el loader de SVG */
    .upload-slot-icon-loader :deep(.loaderSVG-contend) {
        padding: 0 !important;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .upload-slot-icon-loader :deep(svg) {
        width: 100% !important;
        height: 100% !important;
    }
</style>
