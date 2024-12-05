<template>
    <div :class="activateBTNClass" @click="emitirCambio">
        <div class="btnSistema-bg"></div>        
        <DynamicSvgLoader :icon_active="btn_activo" :fileName="icono_sistema" width_icon="30px"></DynamicSvgLoader>
    </div>
    
</template>

<script>
import { computed, defineComponent } from 'vue';
import DynamicSvgLoader from '@/components/LoaderSVG/LoaderSVG.vue';

export default defineComponent({
    name: 'BtnSistema',
    components: {
        DynamicSvgLoader
    },
    props: {
        sistema_activo: {
            type: String,
            default: 'UCT COMPETENCIAS'
        },
        name_sistema: {
            type: String,
            default: ''
        },
        icono_sistema: {
            type: String,
            default: ''
        }
    },
    setup(props, { emit }) {
        // Crear una propiedad computada para determinar si el botón está activo
        const btn_activo = computed(() => {
            return props.sistema_activo === props.name_sistema;
        });

        // Crear una propiedad computada para determinar la clase basada en btn_activo
        const activateBTNClass = computed(() => {
            return btn_activo.value ? 'mt-1 btnSistema-container btnSistema-active' : 'mt-1 btnSistema-container';
        });

        const emitirCambio = () => {
            emit('cambiarSistema', props.name_sistema);
        };

        return {
            activateBTNClass,
            emitirCambio,
            btn_activo
        }
    }
});
</script>


<style scoped>
.btnSistema-container {
    height: 3.8rem;
    display: flex;
    justify-content: end;
    align-items: center;
    position: relative;
    width: 100%;
    overflow: hidden;
}
.btnSistema-bg {
    background-color: var(--babyBlue);
    width: 0%;
    height: 100%;
    position: absolute;
    z-index: 0;    
    /*transition: .5s;*/
    right: -2px;
}
.btnSistema-container.btnSistema-active .btnSistema-bg {
    width: 90%;    
    border-radius: 35px 0 0 35px;
}

</style>
