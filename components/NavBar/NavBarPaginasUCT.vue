<template>
    <nav class="navbar navbar-expand-lg NavbarUCT d-flex flex-column" :style="{ zIndex: zIndex }">
        <div class="container-fluid NavbartUCT-contendor">
            <ul class="navbar-nav">
                <li class="nav-item dropdown btn_dropdown" v-if="elementos_dropdown">
                    <button
                        class="btn NavbarUCT-button"
                        :data-bs-toggle="elementos_dropdown ? 'dropdown' : ''"
                        aria-expanded="false"
                    >
                        <DynamicSvgLoader
                            class="NavbarUCT-icono"
                            width_icon="20px"
                            fileName="icons/menú desplegable-08"
                        ></DynamicSvgLoader>
                    </button>
                    <ul class="dropdown-menu NavbarUCT-dropdown" v-if="elementos_dropdown">
                        <slot name="elementos_dropdown"></slot>
                    </ul>
                </li>
            </ul>

            <!-- Elementos opcionales visibles en pantallas medianas y grandes -->
            <div class="d-none d-md-block">
                <slot name="elementos_opcionales"></slot>
            </div>

            <!-- Botón para pantallas pequeñas -->
            <div class="d-block d-md-none">
                <button
                    class="btn NavbarUCT-button"
                    type="button"
                    data-bs-toggle="offcanvas"
                    :data-bs-target="'#' + offcanvasId"
                    aria-controls="offcanvasElementosOpcionales"
                >
                    <DynamicSvgLoader
                        class="NavbarUCT-icono"
                        width_icon="20px"
                        fileName="icons/ellipsis-horizontal"
                    ></DynamicSvgLoader>
                </button>
            </div>
        </div>

        <!-- Offcanvas para pantallas pequeñas -->
        <div
            class="offcanvas offcanvas-start d-md-none"
            :id="offcanvasId"
            tabindex="-1"
            aria-labelledby="offcanvasLabel"
            ref="offcanvasElement"
        >
            <div class="offcanvas-header">
                <h5 class="offcanvas-title" id="offcanvasLabel">Opciones</h5>
                <button
                    type="button"
                    class="btn-close text-reset"
                    data-bs-dismiss="offcanvas"
                    aria-label="Close"
                ></button>
            </div>
            <div class="offcanvas-body">
                <slot name="elementos_opcionales"></slot>
            </div>
        </div>

        <div class="navbar-subMenu" v-if="subHerramientas">
            <slot name="elementos_sub_opcionales"></slot>
        </div>
    </nav>
</template>

<script>
import { defineComponent, ref, onMounted, getCurrentInstance } from 'vue';
import DynamicSvgLoader from '../LoaderSVG/LoaderSVG.vue';
import { Offcanvas } from 'bootstrap';

export default defineComponent({
    components: {
        DynamicSvgLoader,
    },
    props: {
        elementos_dropdown: {
            type: Boolean,
            required: true,
            default: false,
        },
        zIndex: {
            type: Number,
            default: 11,
        },
        subHerramientas: {
            type: Boolean,
            default: false,
        },
    },
    setup() {
        const offcanvasElement = ref(null);

        // Obtener la instancia actual del componente
        const instance = getCurrentInstance();
        const uid = instance ? instance.uid : Math.random().toString(36).substr(2, 9);
        const offcanvasId = 'offcanvas_' + uid;

        onMounted(() => {
            if (offcanvasElement.value) {
                new Offcanvas(offcanvasElement.value);
            }
        });

        return {
            offcanvasElement,
            offcanvasId,
        };
    },
});
</script>

<style scoped>
.NavbarUCT {
    background: var(--blueBerryPastel);
    border-radius: 10px;
    padding: 0;
    margin: 0 10px 0 5px;
    box-shadow: rgba(0, 0, 0, 0.07) 0px 1px 1px,
        rgba(0, 0, 0, 0.07) 0px 2px 2px,
        rgba(0, 0, 0, 0.07) 0px 4px 4px,
        rgba(0, 0, 0, 0.07) 0px 8px 8px,
        rgba(0, 0, 0, 0.07) 0px 16px 16px;
    position: sticky;
    top: 0;
    transition: 0.2s;
    box-shadow: rgba(0, 0, 0, 0.16) 0px 3px 6px,
        rgba(0, 0, 0, 0.23) 0px 3px 6px;
}

.NavbarUCT-button:focus {
    border: none;
}

.NavbarUCT-button {
    border: none;
    padding: 0;
}

.NavbarUCT-icono {
    padding: 0;
}

.NavbarUCT-dropdown {
    background: var(--blueBerryPastel);
    border: 1px solid var(--highlighter);
    backdrop-filter: blur(5px);
    box-shadow: rgba(0, 0, 0, 0.24) 0px 3px 8px;
    height: fit-content;
}

/* Modificaciones para el dropdown-item */
.NavbarUCT-dropdown ::v-deep .dropdown-item {
    color: var(--blanco) !important;
    text-transform: uppercase;
    font-weight: bolder;    
   
}

.NavbarUCT-dropdown ::v-deep .dropdown-item:hover {
    background-color: var(--blueBerryLight);
}

@media (max-width: 768px) {
    .NavbarUCT-dropdown {
        margin-left: 290%;
        margin-top: 50%;
    }
    .NavbarUCT-dropdown ::v-deep .dropdown-item {        
        font-size: 12px; /* Reducir el tamaño de fuente a 10px */   
        white-space: normal; /* Permitir que el texto se ajuste */
        overflow-wrap: break-word; /* Ajustar palabras largas */
        word-wrap: break-word; /* Compatibilidad con navegadores antiguos */
    }
}

.navbar-subMenu {
    background-color: var(--babyBlue_7);
    border-radius: 10px;
    min-height: 38px;
    display: flex;
    justify-content: end;
    padding: 0 10px;
    margin: 5px;
    width: calc(100% - 20px);
}

.navbar select {
    --bs-form-select-bg-img: url('data:image/svg+xml,%3csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 16 16%27%3e%3cpath fill=%27none%27 stroke=%27%23343a40%27 stroke-linecap=%27round%27 stroke-linejoin=%27round%27 stroke-width=%272%27 d=%27m2 5 6 6 6-6%27/%3e%3c/svg%3e');
    display: block;
    width: 100%;
    padding: 0.375rem 2.25rem 0.375rem 0.75rem;
    font-size: 1rem;
    font-weight: 400;
    line-height: 1.5;
    background-color: rgba(0, 0, 0, 0);
    background-image: var(--bs-form-select-bg-img),
        var(--bs-form-select-bg-icon, none);
    background-repeat: no-repeat;
    background-position: right 0.75rem center;
    background-size: 16px 12px;
    border: unset;
    border-radius: var(--bs-border-radius);
}

.btn_dropdown {
    padding: 5px;
    background: var(--blueBerry);
    width: 45px;
    display: flex;
    justify-content: center;
    border-radius: 10px 0 0 10px;
    height: 41px;
    background: linear-gradient(
        90deg,
        var(--purple-sb) 0%,
        var(--bluelight-sb) 100%
    );
}

.NavbartUCT-contendor {
    padding: 0 10px 0px 0;
    height: 41px;
}
</style>