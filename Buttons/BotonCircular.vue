<template>
    <button 
        class="btn-circular shadow-sm"
        :class="{ 'active': active }"
        :title="title"
        @click="handleClick"
        type="button"
    >
        <DynamicSvgLoader 
            :fileName="cleanIconName"
            :width_icon="width_icon"
            :height_icon="height_icon"
        />
    </button>
</template>

<script>
import { defineComponent, computed } from 'vue';
import DynamicSvgLoader from '@/components/LoaderSVG/LoaderSVG.vue';

export default defineComponent({
    name: 'BotonCircular',
    components: {
        DynamicSvgLoader
    },
    props: {
        title: { type: String, default: '' },
        active: { type: Boolean, default: false },
        iconName: { type: String, required: true },
        width_icon: { type: String, default: '20px' },
        height_icon: { type: String, default: '20px' }
    },
    emits: ['clickPrimary'],
    setup(props, { emit }) {
        const handleClick = (event) => {
            emit('clickPrimary', event);
        };

        const cleanIconName = computed(() => {
            return props.iconName ? props.iconName.replace('.svg', '') : '';
        });

        return { handleClick, cleanIconName };
    }
});
</script>

<style scoped>
    .btn-circular {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        color: white;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: all 0.3s ease;
        font-size: 18px;
        border: none;
        background: var(--bluelight-sb);
        backdrop-filter: blur(8px);
        -webkit-backdrop-filter: blur(8px);
    }

    .btn-circular:hover {
        background: var(--purple-sb);
        transform: scale(1.1);
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.4);
    }

    /* Ajuste para que el loader no herede el padding de 10px por defecto */
    :deep(.loaderSVG-contend) {
        padding: 0 !important;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .btn-circular.active {
        background: var(--bluelight-sb); 
        border-color: transparent;
        transform: rotate(90deg);
    }

    .btn-circular.active:hover {
        background: var(--purple-sb);
        transform: rotate(90deg) scale(1.1);
    }
</style>