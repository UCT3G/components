<template>
    <div class="row d-flex justify-content-start">
        <!-- Itera sobre cada módulo para crear una card -->
        <div class="col-11 col-lg-4 mt-1" v-for="(modulo, index) in modulos_mostrar" :key="index">
            <div :class="backgroun_lvl(modulo.nivel)" @click="loadModulo(modulo)">
                <div :class="['card-body d-flex', addReflejoClass(modulo.id_modulo, Yowimodulos)]"><!-- Agregar clase reflejo-animado si el módulo está marcado -->
                    <div class="col-3">
                        <slot></slot>
                    </div>
                    <div class="col-7">
                        <h5 class="card-title subtitulo titulo-modulo">{{ modulo.nombre }}</h5>
                        <p class="card-text texto-caja">{{ modulo.descripcion }}</p>
                    </div>
                </div>
                <div :class="getModulosOptionsclass(modulo.nivel)">
                    <p v-if="modulo.nivel == 1" class="titulo modulOpcion-word-lvl1">U</p>
                    <p v-if="modulo.nivel == 2" class="titulo modulOpcion-word-lvl2">C</p>
                    <p v-if="modulo.nivel == 3" class="titulo modulOpcion-word-lvl3">T</p>
                </div>
                <div class="card-footer p-1 ps-3">
                    lvl-{{ modulo.nivel }}
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import { defineComponent, watch, ref } from 'vue';
import { useStore } from 'vuex';

export default defineComponent({
    name: 'ModulosOptions',
    props: {
        modulos_mostrar: {
            type: Array,
            default: () => []
        }
    },
    setup(props, { emit }) {
        const store = useStore();

        //const modulosMarcados = store.getters['YowiBotMSG/GETmodulosMarcados'];
        //const otrosModulos = store.getters['YowiBotMSG/GETOtrosModulos'];
        const Yowimodulos = ref([]);

        // Función para verificar si el módulo está marcado
        const addReflejoClass = (id_modulo, Yowimodulos) => {
           
            const moduloYowi = Yowimodulos.some(modulo => modulo.id_modulo === id_modulo);
            return (moduloYowi) ? 'reflejo-animado' : '';
        };

        const backgroun_lvl = (lvl) => {
            switch (lvl) {
                case 1:
                    return 'card ModuloOption ModuloOption-lvl0';
                case 2:
                    return 'card ModuloOption ModuloOption-lvl1';
                case 3:
                    return 'card ModuloOption ModuloOption-lvl2';
                default:
                    return '';
            }
        };

        const loadModulo = (modulo) => {
            let nameModulo = modulo.nombre;
            let id_modulo = modulo.id_modulo;
            //cambio Ramon
            store.dispatch('user/setModuloActivo', {
                modulo_nombre: nameModulo,
                id_modulo: id_modulo,
                sistema: modulo.sistema,
                sistemaClic: modulo.sistema
            });

            if (id_modulo) {
                emit('cambioSistema', modulo);
            } else {
                console.warn('Módulo no encontrado:', nameModulo);
            }
        };

        const getModulosOptionsclass = (lvl) => {
            switch (lvl) {
                case 1:
                    return 'ModulosOptions-icon1 position-absolute';
                case 2:
                    return 'ModulosOptions-icon2 position-absolute';
                case 3:
                    return 'ModulosOptions-icon3 position-absolute';
                default:
                    return '';
            }
        };

        // Usamos watch para observar los cambios en modulosMarcados y otrosModulos
        watch(
            () => store.getters['YowiBotMSG/GETmodulosMarcados'],
            (newVal) => {
                // Acción a tomar cuando cambie el valor de modulosMarcados
                console.log('modulosMarcados cambió:', newVal);
                //juntar en Yowimodulos sin repetir newVal
                Yowimodulos.value = [...newVal,...store.getters['YowiBotMSG/GETOtrosModulos']];
            }
        );

        watch(
            () => store.getters['YowiBotMSG/GETOtrosModulos'],
            (newVal) => {
                // Acción a tomar cuando cambie el valor de otrosModulos
                console.log('otrosModulos cambió:', newVal);
                //juntar en Yowimodulos sin repetir newVal
                Yowimodulos.value = [...newVal,...store.getters['YowiBotMSG/GETmodulosMarcados']];
            }
        );

        return {
            backgroun_lvl,
            loadModulo,
            getModulosOptionsclass,
            addReflejoClass,
            Yowimodulos
        };
    }
});
</script>


<style scoped>
/* Estilos del componente */
.ModuloOption {
    min-height: 200px;
    cursor: pointer;
    border-radius: 20px;
    color: var(--black);
    background-color: unset;
    border: unset;
    overflow: hidden;
}

.titulo-modulo {
    color: var(--card-title-color);
    text-align: start;
}

.texto-caja {
    text-align: start;
    font-size: 16px;
}

.ModuloOption .card-body {
    border: unset !important;
    border-radius: 1.3rem 1.3rem 1.3rem 0 !important;
    background-color: var(--babyBlue);
    transition: .5s;
}

.ModuloOption .card-body:hover {
    background-color: var(--titleBlue);
    color: var(--babyBlue);
}

.ModuloOption-lvl0 .card-footer {
    background: var(--acceso0);
}

.ModuloOption-lvl1 .card-footer {
    background: var(--acceso1);
}

.ModuloOption-lvl2 .card-footer {
    background: var(--acceso2);
}

.ModuloOption .card-footer {
    font-size: .8rem;
    width: 70%;
    color: var(--babyBlue);
}

.ModulosOptions-icon1 {
    opacity: .5;
    z-index: 0;
    top: -4.5rem;
    left: -4.2rem;
    color: var(--acceso0);
}

.ModulosOptions-icon2 {
    opacity: .5;
    z-index: 0;
    top: -4.5rem;
    left: -4.2rem;
    color: var(--acceso1);
}

.ModulosOptions-icon3 {
    opacity: .5;
    z-index: 0;
    transform: rotate(15deg);
    top: -4.5rem;
    left: -3.1rem;
    color: var(--acceso2);
}

.ModulosOptions-icon1 p,
.ModulosOptions-icon2 p,
.ModulosOptions-icon3 p {
    font-size: 12rem !important;
    font-family: 'MonserratBoldItalic', sans-serif;
}


</style>
