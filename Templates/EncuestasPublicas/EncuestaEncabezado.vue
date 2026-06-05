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
        headerMode: { type: String, default: 'split' }
    },
    emits: ['image-selected'],
    setup(props, { emit }) {
        // Lógica responsiva
        const isMobile = ref(false);
        const updateMobile = () => {
            isMobile.value = window.innerWidth <= 768;
        };

        const hasLeft = computed(() => 
            !!(props.previews.header_img_left || props.configData.header_img_left)
        );
        const hasRight = computed(() => 
            !!(props.previews.header_img_right || props.configData.header_img_right)
        );
        const hasFull = computed(() => 
            !!(props.previews.header_img_full || props.configData.header_img_full)
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
            const val = props.previews[campo] || props.configData[campo];
            if (!val) return '';
            if (val.startsWith('blob:') || val.startsWith('http')) return val;

            const cacheBuster = `?t=${sessionTimestamp}`;
            if (val.startsWith('media')) return `${val}${cacheBuster}`;
            if (val.includes('/')) return `${DEV_BASE_URL}media/Templates/EncuestasPublicas/${val}${cacheBuster}`;
            return `${DEV_BASE_URL}media/Templates/EncuestasPublicas/templateBienvenida/images/${val}${cacheBuster}`;
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
