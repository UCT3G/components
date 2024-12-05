<template>
    <transition name="fade">
        <div class=" w-100 h-100 p-0 m-0 position-fixed top-0 start-0 Popup-cont" @keyup.esc="handleEscKey()" v-if="visible">
            <div class="col-12 d-flex justify-content-center p-0 modal-haze">
                <div :class="modalSizeClass">
                    <div class="card-header d-flex p-0">
                        <div class="col-2 text-start modal-t1 m-0 card-header-color">
                            <div class="modal-calificacion-content">
                                <DynamicSvgLoader 
                                    @click="AccionIcono" 
                                    class="d-block p-0 pop-up-icono m-1 d-none d-md-block" 
                                    :fileName="`icons/CALIFICACIÓN-24`" 
                                    width_icon="20px" 
                                    :icon_active="true">
                                </DynamicSvgLoader>
                                <span>{{ calificacion }}</span>
                            </div>
                            
                        </div>
                        <div class="col-10 Popup-cont-btnclose m-0">
                            <div class="modalCompetencia-titulo subtitulo">{{titulo}}</div>
                            <div class="modalCompetencia-iconos">
                                <template v-if="icono_name != ''">
                                    <div @click="AccionIcono" class="modalCompetencia-titulo subtitulo textIcon">{{textIcon}}</div>
                                    <DynamicSvgLoader 
                                        @click="AccionIcono" 
                                        class="d-block p-0 pop-up-icono" 
                                        :fileName="`icons/${icono_name}`" 
                                        width_icon="25px" 
                                        :icon_active="true">
                                    </DynamicSvgLoader>
                                </template>
                                <template v-else>
                                    <div class="empty-icon-space"></div>
                                </template>
                                <slot name="iconos_extra"></slot>
                                <DynamicSvgLoader 
                                    @click="closePopup" 
                                    class="d-block p-0 pop-up-close" 
                                    fileName="icons/CERRAR-04" 
                                    width_icon="20px" 
                                    :icon_active="true">
                                </DynamicSvgLoader>
                            </div>
                        </div>
                    </div>
                    <div class="card-header d-flex p-0">
                        <p class="migajas text-start w-100 m-0">{{ migajas }}</p>
                    </div>
                    
                    <div class="card-body pop-up-inner">
                        <div class="card-body-area">
                            <slot></slot>
                        </div>
                    </div>
                    
                    <div class="card-footer d-flex justify-content-end" v-if="confirm">
                        <button class="btn btn-primary m-1" @click="confirmAction">Confirmar</button>
                        <button class="btn btn-secondary m-1" @click="cancelAction">Cancelar</button>
                    </div>
                </div>
            </div>
        </div>
    </transition>
</template>

<script>
import DynamicSvgLoader from '@/components/LoaderSVG/LoaderSVG.vue'

export default {
    name: "PopUpCompetencias",
    components: {
        DynamicSvgLoader
    },
    computed: {
        modalSizeClass() {
            const sizeMap = {
                small: 'mt-4 col-11 col-sm-6 col-md-4',
                medium: 'mt-4 col-11 col-sm-8 col-md-6',
                large: 'mt-4 col-11 col-sm-8 col-md-10',
                fulls: 'mt-1 col-12',
                fullscreen: 'fullscreen-modal', // Añadir esta línea
            };

            return `card pop-up ${sizeMap[this.size] || sizeMap.medium}`
        }
    },
    props: {
        visible: {
            type: Boolean,
            required: true
        },
        confirm: {
            type: Boolean,
            default: false
        },
        confirmFunction: {
            type: Function,
            default: null
        },
        size: {
            type: String,
            default: 'medium', // small, medium, large, fulls
        },
        titulo: {
            type: String,
            default: 'Sin titulo'
        },
        icono_name: {
            type: String,
            default: ''
        },
        showIcon: {
            type: Boolean,
            default: false
        },
        tipoRecurso: {
            type: String,
            default: ''
        },
        orden:{
            type: Number,
            default: 0
        },
        migajas:{
            type: String,
            default: ''
        },
        textIcon:{
            type: String,
            default:''
        },
        calificacion:{
            type: Number,
            default:0
        },
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
            this.$emit('update:visible', false);

            this.$store.dispatch("closeLastModal");
            this.setActiveModalListener();
        },
        confirmAction() {
            if (this.confirmFunction != null) {
                this.confirmFunction()
            }
            this.$emit('update:visible', false);
        },
        cancelAction() {
            this.$emit('update:visible', false);
        },
        AccionIcono() {
            this.$emit('AccionIcono', false);
        },
        AccionAtras(){
            this.$emit('AccionAtras', false);
        },
        AccionAdelante(){
            this.$emit('AccionAdelante', false);
        },
        handleEscKey(event) {
            console.log("HOOLAAA");
            // Solo cerrar si el modal es el activo
            if (event.key === 'Escape' && this.isActiveModal()) {
                this.closePopup();
            }
        },
        isActiveModal() {
            return this.$store.state.ControlModales.activeModal === (this.titulo || this.titulo_b);
        },
        addEscListener() {
            if (!this.escListenerAdded) {
                document.addEventListener('keyup', this.handleEscKey);
                this.escListenerAdded = true;
            }
        },
        setActiveModalListener() {
        // Si este modal es el activo, activar el listener
        if (this.isActiveModal()) {
            this.addEscListener();
        } else {
            this.removeEscListener();
        }
        },
        removeEscListener() {
            if (this.escListenerAdded) {
                document.removeEventListener('keyup', this.handleEscKey);
                this.escListenerAdded = false;
            }
        }
        
    }
};
</script>

<style scoped>
.Popup-cont {
    background: var(--bluelight-sb-70);
}
.Popup-cont .ModalBonito {
    background: var(--haze);
    z-index: 100;
    border: unset;
    background-color: var(--bluelight-sb-70);
}

.pop-up {
    max-height: 90vh;
    z-index: 500;
    border: unset;
    overflow: hidden; /** Esto oculta el contenido desbordado */

    background: rgba(255, 99, 71, 0.0) !important;
    border: solid 1px rgba(255, 255, 255, .5);
    box-shadow: unset;

    position: relative;
    box-shadow: rgba(0, 0, 0, 0.15) -4px 4.4px 3.2px!important;
    /* backdrop-filter: blur(5px);
    background: var(--babyBlue) !important;
    max-height: 90vh; * Altura máxima para evitar que el modal se salga de la pantalla */
}

.fade-enter-active, .fade-leave-active {
    transition: opacity 0.5s;
}
.fade-enter-from, .fade-leave-to {
    opacity: 0;
}

.modal-calificacion-content{
    width: 100%;
    display: flex;
    justify-content: center!important;
}

.modal-calificacion-content .pop-up-icono{
    margin: 0 5px;
    fill: var(--babyBlue_7);
}
#Capa_1{
    margin: 0 5px;
    fill: var(--babyBlue_7)!important;
}

.modal-calificacion-content span {
    font-size: 1.6rem;
    font-family: 'MonserratBoldItalic';
    color: var(--babyBlue_7);
    display: flex;
    justify-content: center;
    align-items: center;
    padding-top: 2px;
}

@media (max-width: 568px) {
    .modal-calificacion-content span {
        font-size: 1rem;
    }
}

.card-header {
    background-color: white;
    border: unset !important;
    display: flex;
    justify-content: space-around;
}

.textIcon{
    cursor: pointer;
}

.card-header div {
    display: flex;
    justify-content: space-between;
    position: relative !important;
    align-items: center;
    padding: 2px 10px 2px 0;
}

.card-header-color {
    background-image: linear-gradient(90deg, var(--purple-sb) 0%, var(--bluelight-sb) 60%);
    min-height: 45px;
    border-radius: 0 0 50px 0;
}

.card-header h2 {
    padding: .2rem;
    margin: 0;
}

.modalCompetencia-iconos {
    display: flex;
    justify-content: flex-start; /* Alinea el contenido a la izquierda */
    align-items: center; /* Centra verticalmente los elementos */
}

.empty-icon-space {
    width: 25px; /* Ancho del icono para mantener el espacio reservado */
}

.modalCompetencia-iconos .pop-up-icono {
    padding: 0;
    fill: var(--blueBerry);
    margin-right: 10px; /* Espacio entre el icono opcional y el icono de cerrar */
}

.pop-up-close {
    padding: unset;
    fill: var(--close);
}
.pop-up-close:hover {
    fill: var(--close-hover);
}

.Popup-cont-btnclose h2 {
    width: inherit;
    text-align: center;
    background-color: var(--babyBlue);
    background-image: linear-gradient(90deg, var(--purple-sb) 0%, var(--bluelight-sb) 100%);
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent !important; /* Hace el texto transparente para mostrar el fondo */
    display: inline-block; /* o 'block' según sea necesario, para asegurar que el degradado se aplique correctamente */
}

/* ES EL TAMAÑO DE TODO EL CONTENEDOR */
.card-body {
    background-color: var(--blanco);
    max-height: 100vh; /* Ajusta esto según sea necesario */
    overflow-y: hidden; /* Oculta el desplazamiento vertical */
    overflow-x: hidden; /* Oculta el desbordamiento horizontal */
    display: flex; /* Añadir flexbox */
    flex-direction: column; /* Para apilar el contenido verticalmente */
    justify-content: stretch; /* Asegurar que se estire */
}

.pop-up-inner .card-body-area {
    flex-grow: 1; /* Esto hará que el contenedor ocupe todo el espacio disponible */
    overflow-x: hidden;
    overflow-y: auto; /* Si hay mucho contenido, se habilitará el scroll vertical */
}

.fullscreen-modal {
  width: 96vw; /* Ajusta el ancho para dejar un pequeño margen */
  height: 96vh; /* Ajusta la altura para dejar un pequeño margen */
  max-width: 96vw; 
  max-height: 96vh; 
  margin: 0 auto; /* Centra el modal */
  padding: 0;
  border: 2px solid rgba(255, 255, 255, 0.8); /* Añade un borde como marco */
  border-radius: 10px; /* Opcional: redondea las esquinas */
  overflow: hidden;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3); /* Añade una sombra para un efecto visual */
}

@media (max-width: 768px) {
  .fullscreen-modal {
    width: 95vw;
    height: 95vh;
  }
}

@media (max-width: 576px) {
  .fullscreen-modal {
    width: 90vw;
    height: 90vh;
  }
}

@media (max-width: 400px) {
  .fullscreen-modal {
    width: 85vw;
    height: 85vh;
  }
}

.migajas{
    margin: 0px;
    padding-top: 5px;
    padding-left: 10px;
    text-align: left;
    font-size: 12px;
}

.TextoIcon {
    margin-right: 10px; /* Espacio entre el texto y el ícono */
    line-height: 25px; /* Ajusta esto según el tamaño de tu ícono */
}
</style>