<template>
    <div class="card-header encuesta-card-header p-2">
        <!-- MODO BANNER COMPLETO -->
        <div v-if="headerMode === 'full'" class="h-100">
            <ImageUploadSlot
                campo="header_img_full"
                :imageUrl="getImageUrl('header_img_full')"
                :hasImage="hasFull"
                :isEditMode="isEditMode"
                tooltip="Imagen de banner completo"
                @image-selected="handleImageSelected"
            />
        </div>

        <!-- MODO DIVIDIDO -->
        <div v-else class="row g-0 align-items-stretch justify-content-between h-100">
            <!-- Imagen izquierda -->
            <div v-if="!isMobile || (!hasRight && hasLeft)" :class="isMobile ? 'col-12' : 'col-8'" class="h-100">
                <ImageUploadSlot
                    campo="header_img_left"
                    :imageUrl="getImageUrl('header_img_left')"
                    :hasImage="hasLeft"
                    :isEditMode="isEditMode"
                    tooltip="Imagen izquierda"
                    @image-selected="handleImageSelected"
                />
            </div>

            <!-- Imagen derecha -->
            <div v-if="!isMobile || hasRight" :class="isMobile ? 'col-12' : 'col-2'" class="h-100">
                <ImageUploadSlot
                    campo="header_img_right"
                    :imageUrl="getImageUrl('header_img_right')"
                    :hasImage="hasRight"
                    :isEditMode="isEditMode"
                    tooltip="Imagen derecha"
                    @image-selected="handleImageSelected"
                />
            </div>
        </div>
    </div>
</template>

<script>
import { defineComponent, ref, onMounted, onUnmounted, computed } from 'vue';
import { DEV_BASE_URL } from "@/../axios-config.js";
import ImageUploadSlot from '@/components/Inputs/ImageUploadSlot.vue';

export default defineComponent({
    name: 'EncuestaHeaderBanner',
    components: {
        ImageUploadSlot
    },
    props: {
        isEditMode: { type: Boolean, default: false },
        configData: { type: Object, required: true },
        previews: { type: Object, default: () => ({}) },
        headerMode: { type: String, default: 'split' },
        idModulo: { type: [Number, String], default: null },
        idTemplate: { type: [Number, String], default: null }
    },
    emits: ['image-selected'],
    setup(props, { emit }) {
        // Lógica responsiva
        const isMobile = ref(false);
        const updateMobile = () => {
            isMobile.value = window.innerWidth <= 768;
        };

        const hasLeft = computed(() => 
            !!(props.previews.header_img_left || (props.configData.header_img_left && props.configData.header_img_left.startsWith('.')))
        );
        const hasRight = computed(() => 
            !!(props.previews.header_img_right || (props.configData.header_img_right && props.configData.header_img_right.startsWith('.')))
        );
        const hasFull = computed(() => 
            !!(props.previews.header_img_full || (props.configData.header_img_full && props.configData.header_img_full.startsWith('.')))
        );

        onMounted(() => {
            updateMobile();
            window.addEventListener('resize', updateMobile);
        });

        onUnmounted(() => {
            window.removeEventListener('resize', updateMobile);
        });

        const handleImageSelected = (payload) => {
            emit('image-selected', payload);
        };

        const sessionTimestamp = new Date().getTime();

        const getImageUrl = (campo) => {
            // Si hay un preview local (blob), usarlo directamente
            const preview = props.previews[campo];
            if (preview) return preview;

            // El valor guardado en configData es la extensión (ej: '.jpeg') o null
            const ext = props.configData[campo];
            if (!ext || !ext.startsWith('.')) return '';

            // Reconstruir la ruta: modulo_{id_modulo}/images/{id_template}_{campo}{ext}
            const rel = `modulo_${props.idModulo}/images/${props.idTemplate}_${campo}${ext}`;
            const cacheBuster = `?t=${sessionTimestamp}`;
            return `${DEV_BASE_URL}media/templates/encuestas_publicas/${rel}${cacheBuster}`;
        };

        return {
            isMobile,
            hasLeft,
            hasRight,
            hasFull,
            getImageUrl,
            handleImageSelected
        };
    }
});
</script>

<style scoped>
    .encuesta-card-header {
        border-bottom: none;
        max-height: 60px;
        overflow: hidden;
        background-color: transparent;
        height: 60px;
    }
</style>
