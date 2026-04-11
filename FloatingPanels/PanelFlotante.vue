<template>
    <!-- Contenedor de Ajustes Flotante dinámico -->
    <div :class="['contenedor-panel-flotante', `pos-${posicion}`]">
        
        <div class="d-flex gap-2 align-items-center mb-0" :class="{ 'flex-row-reverse': isLeft }">
            <!-- Espacio para botones adicionales (ej: Guardar) -->
            <slot name="extra"></slot>

            <BotonCircular 
                :active="showConfig"
                :iconName="showConfig ? iconNameActive : iconName"
                @clickPrimary="showConfig = !showConfig"
                :title="showConfig ? titleClose : titleOpen"
            />
        </div>

        <!-- Panel -->
        <transition name="panel-fade">
            <div v-if="showConfig" :class="['panel-contenido-flotante', isBottom ? 'mb-2' : 'mt-2']">
                <div v-if="titulo" class="panel-header-generico mb-3">
                    <span class="panel-titulo-generico text-uppercase">{{ titulo }}</span>
                </div>
                <div class="panel-body-generico">
                    <slot></slot>
                </div>
            </div>
        </transition>
    </div>
</template>

<script>
import { ref, defineComponent, computed } from 'vue';
import BotonCircular from '@/components/Buttons/BotonCircular.vue';

export default defineComponent({
    name: 'PanelFlotante',
    components: {
        BotonCircular
    },
    props: {
        titulo: { type: String, default: '' },
        posicion: { 
            type: String, 
            default: 'top-right',
            validator: (v) => ['top-right', 'top-left', 'bottom-right', 'bottom-left'].includes(v)
        },
        iconName: { type: String, default: 'icons/ADMIN-04.svg' },
        iconNameActive: { type: String, default: 'icons/CERRAR.svg' },
        titleOpen: { type: String, default: 'Abrir ajustes' },
        titleClose: { type: String, default: 'Cerrar ajustes' }
    },
    setup(props) {
        const showConfig = ref(false);

        const isBottom = computed(() => props.posicion.includes('bottom'));
        const isLeft = computed(() => props.posicion.includes('left'));

        return { 
            showConfig,
            isBottom,
            isLeft
        };
    }
});
</script>

<style scoped>
    .contenedor-panel-flotante {
        position: absolute;
        z-index: 100;
        display: flex;
        flex-direction: column;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }

    /* Modificadores de posición */
    .pos-top-right {
        top: 14px;
        right: 14px;
        align-items: flex-end;
    }

    .pos-top-left {
        top: 14px;
        left: 14px;
        align-items: flex-start;
    }

    .pos-bottom-right {
        bottom: 14px;
        right: 14px;
        align-items: flex-end;
        flex-direction: column-reverse;
    }

    .pos-bottom-left {
        bottom: 14px;
        left: 14px;
        align-items: flex-start;
        flex-direction: column-reverse;
    }

    .panel-contenido-flotante {
        background: color-mix(in srgb, var(--bluelight-sb), transparent 40%);
        backdrop-filter: blur(8px);
        -webkit-backdrop-filter: blur(8px);
        padding: 12px 16px;
        border-radius: 12px;
        min-width: 200px;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
    }

    .panel-header-generico {
        border-bottom: 1px solid rgba(255, 255, 255, 0.137);
        padding-bottom: 6px;
    }

    .panel-titulo-generico {
        color: var(--bs-gray-400);
        font-size: 12px;
        font-weight: 800;
        letter-spacing: 1px;
    }

    /* Animación del Panel */
    .panel-fade-enter-active, .panel-fade-leave-active {
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }
    
    .panel-fade-enter-from, .panel-fade-leave-to {
        opacity: 0;
        transform: translateY(10px) scale(0.95);
    }

    /* Si es arriba el panel sale hacia abajo */
    .pos-top-right .panel-fade-enter-from, 
    .pos-top-right .panel-fade-leave-to,
    .pos-top-left .panel-fade-enter-from,
    .pos-top-left .panel-fade-leave-to {
        transform: translateY(-10px) scale(0.95);
    }
</style>
