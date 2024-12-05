<template>
  <transition name="fade">
    <div :class="modalSizeClassCont" @keyup.esc="handleEscKey" v-if="visible">
      <div class="col-12 d-flex justify-content-center p-0 modal-haze">
        <div :class="modalSizeClass">
          <div class="card-header-popup d-flex p-0">
            <div class="col-9 Popup-htitulo">
              <h2 class="d-none d-sm-block text-center modal-t1">
                {{ capitalizedTitulo }}
              </h2>
              <h2 class="d-block d-sm-none text-center modal-t1">
                {{ capitalizedTitulo }}...
              </h2>
              <div>
                <DynamicSvgLoader @click="closePopup" class="d-block p-0 pop-up-close" fileName="icons/CERRAR-04"
                  width_icon="20px" :icon_active="true"></DynamicSvgLoader>
              </div>
            </div>
            <div class="col-3 Popup-htransparente"></div>
          </div>
          <div :class="confirm
              ? 'card-body pop-up-inner-confirm'
              : 'card-body pop-up-inner'
            ">
            <div class="card-body-area m-1" :style="estiloModalSolid">
              <slot></slot>
            </div>
          </div>
          <div class="card-footer d-flex justify-content-center" v-if="confirm">
            <button class="btn btn-primary m-1 d-flex" @click="confirmAction">
              <DynamicSvgLoader class="d-block p-0 pop-up-close me-2" fileName="icons/save" width_icon="20px"
                :icon_active="false"></DynamicSvgLoader>
              Guardar
            </button>
            <button class="btn btn-secondary m-1" @click="cancelAction">
              Cancelar
            </button>
          </div>
        </div>
      </div>

      <div class="ModalLuces_content">
        <div class="ModalLuces_1"></div>
        <div class="ModalLuces_2"></div>
        <div class="ModalLuces_3"></div>
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
  computed: {
    modalSizeClass() {
      const sizeMap = {
        small: "mt-4 col-11 col-sm-6 col-md-4",
        medium: "mt-4 col-11 col-sm-8 col-md-6",
        large: "mt-4 col-11 col-sm-8 col-md-10",
        fulls: "mt-1 col-12 full-uct-modal",
      };
      return `card pop-up ${sizeMap[this.size] || sizeMap.medium}`;
    },
    modalSizeClassCont() {
      const sizeMap = {
        small: " w-100 p-2 m-0 position-fixed top-0 start-0 Popup-cont",
        medium: " w-100 p-2 m-0 position-fixed top-0 start-0 Popup-cont",
        large: " w-100 p-2 m-0 position-fixed top-0 start-0 Popup-cont",
        fulls:
          " w-100 p-2 m-0 position-fixed top-0 start-0 Popup-cont full-uct-modal-cont",
      };
      return `card pop-up ${sizeMap[this.size] || sizeMap.medium}`;
    },
    estiloModalSolid() {
      if ((this.confirm && (this.size === 'medium' || this.size === 'small')) ||
        (this.size === 'medium' || this.size === 'small')) {
        return { height: 'auto', minHeight: '100px' };
      } else if (this.confirm) {
        return { maxHeight: 'calc(100vh - 170px)' };
      } else {
        return this.fullScreenHeight ? { height: "100vh" } : { height: "auto" };
      }
    },
    capitalizedTitulo() {
      return this.titulo.toUpperCase();
      //return this.titulo.charAt(0).toUpperCase() + this.titulo.slice(1);
    },
  },
  props: {
    visible: {
      type: Boolean,
      required: true,
    },
    confirm: {
      type: Boolean,
      default: false,
    },
    confirmFunction: {
      type: Function,
      default: null,
    },
    size: {
      type: String,
      default: "medium", // small, medium, large, fulls
    },
    titulo: {
      type: String,
      default: "HOLA",
    },
    titulo_b: {
      type: String,
      default: "",
    },
    fullScreenHeight: {
      type: Boolean,
      default: true
    }
  },
  watch: {
    visible(newVal) {
      let modalData = {
        name: this.titulo || this.titulo_b,
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
    closePopup() {
      this.$emit("closePopup", false);
      this.$emit("update:visible", false);
      // Cierra el modal activo
      this.$store.dispatch("closeLastModal");
      //console.log(this.titulo + ' CERRAR');
      // Actualizar el modal activo después de cerrar
      this.setActiveModalListener();
    },
    async confirmAction() {
      if (this.confirmFunction != null) {
        await this.confirmFunction();
        this.$emit("update:visible", false);
      } else {
        this.$emit("update:visible", false);
      }
    },
    cancelAction() {
      this.$emit("update:visible", false);
      //console.log(this.titulo + ' CERRAR2');
    },
    handleEscKey(event) {
      // Solo cerrar si el modal es el activo
      if (event.key === "Escape" && this.isActiveModal()) {
        this.closePopup();
      }
    },
    isActiveModal() {
      return (
        this.$store.state.ControlModales.activeModal ===
        (this.titulo || this.titulo_b)
      );
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
  overflow: hidden;
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
  background-color: var(--blanco) !important;
  border-radius: 0 1.2rem 1.2rem 1.2rem !important;
  max-height: 88vh;
  padding: 10px;
}

.pop-up-inner .card-body-area {
  max-height: calc(100vh - 100px);
  overflow-y: auto;
  overflow-x: auto;
  position: relative;
  height: 100vh;
  scrollbar-width: none;
}

.pop-up-inner-confirm {
  background-color: var(--blanco) !important;
  border-radius: 0 1.2rem 0rem 0rem !important;
  max-height: 80vh;
  padding: 10px;
}

.card-footer {
  background-color: var(--blanco) !important;
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
}

/**ESTYLOS MODAL POPUP */
.card-header-popup h2,
.card-header-popup div h2 {
  font-family: "MonserratBoldItalic", sans-serif;
  font-weight: bold;
  font-size: 1.2rem;
  /* o su equivalente en px, em, etc. */
  line-height: 1.3;
}

.card-header-popup .Popup-htitulo {
  background: linear-gradient(90deg,
      var(--purple-sb) 0%,
      var(--bluelight-sb) 100%);
  border-radius: 1.2rem 1.2rem 0 0;
  color: var(--babyBlue);
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 2px 10px 2px 10px;
  box-shadow: -4px 0px 4px rgba(0, 0, 0, 0.09), 4px 0px 4px rgba(0, 0, 0, 0.09);
  position: relative;
}

.card-header-popup .Popup-htransparente {
  display: flex;
  justify-content: space-between;
  position: relative !important;
  align-items: center;
  padding: 2px 10px 2px 0;
  background-color: rgba(255, 99, 71, 0);
  height: 35px;
}

.card-header-popup h2 {
  padding: 0.2rem;
  margin: 0;
}

/**Por debajo de 768px */
@media (max-width: 768px) {
  .card-header-popup h2 {
    padding: 0.4rem;
    margin: 0;
    font-size: 1rem !important;
    overflow: hidden;
    width: 100%;
    height: 30px;
  }
}

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
  fill: var(--babyBlue);
}

.pop-up-close:hover {
  fill: var(--close-hover);
}

/*ESTILOS LUCES*/
.ModalLuces_content {
  position: absolute;
  top: 0px;
  left: 0px;
  width: calc(100vw);
  height: calc(100vh);
  pointer-events: none;
  background: var(--haze);
  z-index: 10;
}

.ModalLuces_1,
.ModalLuces_2,
.ModalLuces_3 {
  position: absolute;
  border-radius: 50%;
  animation: drift 20s infinite linear;
}

.ModalLuces_1 {
  width: 50vw;
  height: 50vw;
  background-color: var(--blueBerry);
  top: 0%;
  left: 0%;
  filter: blur(80px);
  z-index: 0;
}

.ModalLuces_2 {
  width: 35vw;
  height: 35vw;
  background-color: var(--purple-sb);
  top: 80%;
  left: 65%;
  filter: blur(60px);
}

.ModalLuces_3 {
  width: 90vw;
  height: 90vw;
  background-color: var(--bluelight-sb);
  top: 50%;
  left: -10%;
  filter: blur(100px);
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
</style>
