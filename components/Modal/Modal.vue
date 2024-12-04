<template>
    <transition name="fade">        
        <div class="row vh-100 w-100 m-0 position-fixed top-0 start-0 Popup-cont" @keyup.esc="handleEscKey" v-if="visible">
            
            <div class="col-12 d-flex justify-content-center p-0">
                <div :class="modalSizeClass">
                <div class="card-header d-flex p-0">
                    <h2 class="col-4 text-start modal-t1 m-0">{{titulo}}</h2>
                    <div class="col-8 Popup-cont-btnclose m-0">
                        <h2>{{ titulo_b }}</h2>                    
                        <DynamicSvgLoader @click="closePopup" class="d-block p-0 pop-up-close" fileName="icons/CERRAR-04" width_icon="20px" :icon_active="true"></DynamicSvgLoader>
                    </div>
                    
                </div>
                <div class="card-body pop-up-inner">
                    <!-- Aquí definimos el slot -->
                        <slot></slot>
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
    name: "PopUp",
    components: {
        DynamicSvgLoader
    },
    computed: {        
        modalSizeClass() {
            const sizeMap = {
                small: 'mt-4 col-11 col-sm-6 col-md-4',
                medium: 'mt-4 col-11 col-sm-8 col-md-6',
                large: 'mt-4 col-11 col-sm-8 col-md-10',
                fulls: 'mt-1 col-12 ',
            };        
            
            return `card shadow pop-up ${sizeMap[this.size] || sizeMap.medium}`
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
        confirmFunction:{
            type: Function,
            default: null
        },
        size: {
            type: String,
            default: 'medium', // small, medium, large, fulls
        },
        titulo:{
            type: String,
            default:''
        },
        titulo_b:{
            type: String,
            default:'Busqueda' 
        }
    },    
    methods: {
        closePopup() {
            console.log("cerrar tarjeta");
            this.$emit('update:visible', false);
        },   
        confirmAction(){
            if(this.confirmFunction != null){
                this.confirmFunction()
            }
            this.$emit('update:visible', false);
        },
        cancelAction() {
            this.$emit('update:visible', false);
        }    
    }
  };
</script>
  
  <style scoped>

    .Popup-cont{
        background: var(--haze);
        z-index: 100;
        border:unset;
        /*backdrop-filter:blur(5px);*/
        background-color: var(--bluelight-sb);
        background-color: rgba(166,211,242,.5);
    }
    
    .pop-up {
        background: unset  !important;
        position: relative;
        backdrop-filter: blur(5px);
        height: fit-content;
        z-index: 500;
        border:unset;  
        overflow:hidden; /**ESTO ES LO QUE OCULTA */  
        box-shadow:  rgba(50, 50, 93, 0.25) 0px 6px 12px -2px, rgba(0, 0, 0, 0.3) 0px 3px 7px -3px !important;
        border:solid 1px rgba(255, 255, 255,.5); 
        background: linear-gradient(90deg, var(--purple-sb-70) 0%, var(--bluelight-sb-70) 100%)!important;
        
    }

    .fade-enter-active, .fade-leave-active {
        transition: opacity 0.5s;
    }
    .fade-enter-from, .fade-leave-to {
        opacity: 0;
    }

    .card-header{
        background-color: unset!important;
        border: unset!important;
        display: flex;
        justify-content: space-around;
    }

    .card-header div{       
        display: flex;
        justify-content: space-between;
        position: relative!important;
        align-items: center;
        padding: 2px 10px 2px 0;
        
    }

    .card-header h2{
        padding:.2rem;
        margin:0;
    }

    .Popup-cont-btnclose{
        display: flex;
        justify-content: space-between;
        position: relative!important;
        align-items: center;
        padding: 2px 10px 2px 0;
        background:var(--babyBlue);
        border-radius: 0 1.2rem  0 1.2rem!important;
    }

    .pop-up-close{
        padding: unset;
        fill: var(--blueBerry);
    }
    .pop-up-close:hover {
        fill: var(--close-hover);
    }

    .Popup-cont-btnclose h2{
        width: inherit;
        text-align: center;
        background-color: var(--babyBlue);
        background-image: linear-gradient(90deg, var(--purple-sb) 0%, var(--bluelight-sb) 100%);
        -webkit-background-clip: text;
        background-clip: text;
        color: transparent !important; /* Hace el texto transparente para mostrar el fondo */
        display: inline-block; /* o 'block' según sea necesario, para asegurar que el degradado se aplique correctamente */
    }

    .card-body {
        min-height:150px;
    }
    .modal-t1{
        
    }

    /**ESTYLOS MODAL POPUP */
    .card-header h2,
    .card-header div h2{
    font-family: 'MonserratBoldItalic', sans-serif;
    font-weight: bold;
    font-size: 1.2rem; /* o su equivalente en px, em, etc. */
    line-height: 1.3;
    }

    .card-header div h2 {
    color: var(--babyBlue);
    }

  </style>


 