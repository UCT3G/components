<template>
    <transition name="fade">
        <div class="modal-wrapper">
            <div class="card pop-up w-100 p-2 m-0 position-fixed top-0 start-0 Popup-cont" @keyup.esc="handleEscKey"
                v-if="visible">
                <div class="col-12 d-flex justify-content-center p-0 modal-haze">
                    <div class="card pop-up mt-4 col-11 col-sm-8 col-md-6">
                        <img :src="require('@/assets/images/Yowis/yowi_arriba.png')" class="modal-image image-modal"
                            alt="Yowi arriba" />
                        <div class="card-header">
                            <div class="d-flex justify-content-end w-100">
                                <DynamicSvgLoader @click="closePopup" class="d-block p-0 pop-up-close"
                                    fileName="icons/CERRAR-04" width_icon="20px" :icon_active="true"></DynamicSvgLoader>
                            </div>
                        </div>
                        <div class="card-body pop-up-inner">
                            <div class="card-body-area m-1">
                                <slot name="body"></slot>
                            </div>
                        </div>
                        <div class="card-footer d-flex justify-content-center">
                            <slot name="footer"></slot>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </transition>
</template>

<script>
import DynamicSvgLoader from "@/components/LoaderSVG/LoaderSVG.vue";

export default {
    name: "PopUpSolido",
    components: {
        DynamicSvgLoader,
    },
    props: {
        visible: {
            type: Boolean,
            required: true,
        },
        modalName: {
            type: String,
            default: "YowiModal",
        },
    },
    watch: {
        visible(newVal) {
            let modalData = {
                name: this.modalName,
                closeCallback: this.closePopup,
            };

            if (newVal) {
                this.$store.dispatch("registerModal", modalData);
                // Activar el listener solo para este modal
                this.setActiveModalListener();
            } else {
                this.removeEscListener(); // Remover listener al cerrar
            }
        },
    },
    methods: {
        async closePopup() {

            this.$emit("closePopup", false);
            this.$emit("update:visible", false);
            // Cierra el modal activo
            this.$store.dispatch("closeLastModal");
            // Actualizar el modal activo después de cerrar
            await this.setActiveModalListener();
        },
        async confirmAction() {
            if (this.confirmFunction != null) {
                await this.confirmFunction();
                this.$emit("update:visible", false);
            } else {
                this.$emit("update:visible", false);
            }
        },
        async cancelAction() {
            await this.cancelFunction();
            this.$emit("update:visible", false);
        },
        handleEscKey(event) {
            // Solo cerrar si el modal es el activo
            if (event.key === "Escape" && this.isActiveModal()) {
                this.closePopup();
            }
        },
        isActiveModal() {
            return this.$store.state.ControlModales.activeModal === this.modalName;
        },
        setActiveModalListener() {
            // Si este modal es el activo, activar el listener
            if (this.isActiveModal()) {
                this.addEscListener();
            } else {
                this.removeEscListener();
            }
        },
        addEscListener() {
            if (!this.escListenerAdded) {
                document.addEventListener("keyup", this.handleEscKey);
                this.escListenerAdded = true;
            }
        },
        removeEscListener() {
            if (this.escListenerAdded) {
                document.removeEventListener("keyup", this.handleEscKey);
                this.escListenerAdded = false;
            }
        },
    },
    beforeUnmount() {
        this.removeEscListener();
    },
    data() {
        return {
            escListenerAdded: false,
        };
    },
};
</script>

<style scoped>
.Popup-cont {
    z-index: 100;
    border: unset;
    backdrop-filter: blur(5px);
    /* height: calc(100vh);     */
    border-radius: 0 !important;
}

.pop-up {
    height: fit-content;
    z-index: 500;
    border: unset;
    overflow: visible;
    /**ESTO ES LO QUE OCULTA */
    /*box-shadow:  rgba(50, 50, 93, 0.25) 0px 6px 12px -2px, rgba(0, 0, 0, 0.3) 0px 3px 7px -3px !important;
        /*border:solid 1px rgba(255, 255, 255,.5); */
    background: rgba(255, 99, 71, 0) !important;
    border: unset !important;
    box-shadow: unset;
    position: relative;
    box-shadow: rgba(0, 0, 0, 0.15) -4px 4.4px 3.2px !important;
}

.pop-up-inner {
    background-color: #ffffff;
    background-image:
        /* Mancha Violeta/Lavanda */
        radial-gradient(at 20% 40%, var(--blueBerryPastel), transparent 50%),
        /* Mancha Azul Claro */
        radial-gradient(at 80% 40%, var(--bluePerryPastel), transparent 50%);
    border-radius: 0 !important;
    max-height: 88vh;
    padding: 10px;
}

.card-header {
    background-color: #ffffff !important;
    border-radius: 1rem 1rem 0 0 !important;
    border-bottom: none !important;
}

.pop-up-inner .card-body-area {
    min-height: 100px;
    overflow-y: auto;
    overflow-x: auto;
    position: relative;
    height: auto;
    scrollbar-width: none;
}

.card-footer {
    border-top: none !important;
    background-color: var(--blanco) !important;
    border-radius: 0 0 1rem 1rem !important;
}

/**Estilos solo full */
.full-uct-modal-cont {
    height: 100vh;
}

.full-uct-modal {
    height: fit-content;
}

.full-uct-modal .card-body {
    max-height: 93vh;
}

.modal-haze {
    height: 100vh;
    border-radius: unset;
    align-items: center;
    padding-top: 20px;
    /* evita que el modal quede pegado arriba en pantallas pequeñas */
}

/**ESTILOS MODAL POPUP */

.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.5s;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}

.pop-up-close {
    padding: unset;
    fill: var(--close);
}

.pop-up-close:hover {
    fill: var(--close-hover);
}

/**PDLT */
.UCT-PDLT-SELECTED .ModalLuces_1 {
    background-color: var(--left-upper-bubble);
}

.UCT-PDLT-SELECTED .ModalLuces_2 {
    background-color: var(--right-bubble);
}

.UCT-PDLT-SELECTED .ModalLuces_3 {
    background-color: var(--left-bubble);
}

/**3G */
.UCT-TRESGUERRAS-SELECTED .ModalLuces_1 {
    background-color: var(--left-upper-bubble);
}

.UCT-TRESGUERRAS-SELECTED .ModalLuces_2 {
    background-color: var(--right-bubble);
}

.UCT-TRESGUERRAS-SELECTED .ModalLuces_3 {
    background-color: var(--left-bubble);
}

@keyframes drift {

    0%,
    100% {
        transform: translate(0px, 0px);
    }

    25% {
        transform: translate(20px, 30px);
    }

    50% {
        transform: translate(-20px, -35px);
    }

    75% {
        transform: translate(80px, 20px);
    }
}

.sistema-modal .card-body {
    padding: 0;
    /*max-height: calc(100vh - 40px);*/
}

.sistema-modal .card-body .card-body-area {
    max-height: calc(100vh - 70px);
    margin: 0 !important;
    padding: 0;
}

.modal-image {
    position: absolute;
    top: 0;
    left: 50%;
    transform: translate(-50%, -100%);
    z-index: 10;
}

.image-modal {
    width: 185px;
    height: auto;
}
</style>