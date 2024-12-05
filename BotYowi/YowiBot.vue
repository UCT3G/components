<template>
  <div class="contenedor_yowiBot">
    <!-- Transición para el chat bubble -->
    <transition name="fade" appear @leave="onLeave">
      <div class="chat-bubble BotYowiAvatar" 
        :class="{ 'centered-chat': isChatOpen }"
        v-if="chatVisible">
        <div class="bubble-icon">
            <video ref="videoRef" autoplay muted playsinline :src="yowi" @ended="handleVideoEnd">
              Tu navegador no soporta video HTML5.
            </video>
        </div>
      </div>
    </transition>

    <!-- Transición para el mensaje con video -->
    <transition name="fade" appear @leave="onLeave">
      <div v-if="showMessage" class="background-overlay">

        <div class="EncuestasPublicas-contenedormsg">

          <div class="col-md-6 EncuestasPublicas-cardmsg mt-4">
            <div>
              <div class="modalCompetencia-iconos">
                <DynamicSvgLoader @click="closePopup" class="d-block p-0 pop-up-close" fileName="icons/CERRAR-04" width_icon="20px"></DynamicSvgLoader>
              </div>
            </div>

            

            <div class="EncuestasPublicasContent-msgAvatar"> 
              <div class="ComicBallonMSGBot-contenedor">  
                <div>
                  <div class="EncuestasPublicas-avatar">
                    <video ref="messageVideoRef" autoplay muted playsinline :src="yowi" style="width: 100%; object-fit: cover;">
                      Tu navegador no soporta video HTML5.
                    </video>
                  </div>
                </div>

                <div class="EncuestasPublicas-msgAvatar" v-if="messageText != null" v-html="messageText"></div>
                <ComicBallon v-else                  
                    :config="{ borde: 'left', y: 50 }"
                    :texto="textoAnimado"                
                  />
              </div>

              <slot name="contenidoextra"></slot>
            </div>

          </div>

        </div><!-- Fin de EncuestasPublicas-contenedormsg -->

      </div><!-- Fin de background-overlay -->
    </transition>
  </div>
</template>
  
<script>
  import yowi from '@/assets/video/pensando.mp4';
  import DynamicSvgLoader from '@/components/LoaderSVG/LoaderSVG.vue';
  import ComicBallon from '@/components/ComicBallon/ComicBallon.vue';
 
  export default {
    data() {
      return {
        isChatOpen: false,
        inputMessage: '',
        messages: []
      };
    },
    components: {
        DynamicSvgLoader,
        ComicBallon
    },
    props:{
        showMessage:{
            type: Boolean,
            required: false
        },
        chatVisible:{
          type: Boolean,
          required: false
        },
        messageText:{
          type: String,
          required: false,
         
        },
        showbutton:{
          type: Boolean,
          default: false
        },
        textoAnimado:{
          type: String,
          required: false,
          
        }
    },
    methods: {
      closePopup() {
            this.$emit('closePopupYowi', false);
            this.$emit('update:showMessage', false);
        },
      toggleChat() {
        this.isChatOpen = !this.isChatOpen;
      },
      showChat() {
        this.isChatOpen = true;
      },
      hideChat() {
        this.isChatOpen = false;
      },
      sendMessage() {
        if (this.inputMessage.trim() !== '') {
          this.messages.push(this.inputMessage);
          this.inputMessage = '';
        }
      },
      onLeave(el) {
        // Asegurarse de que el elemento se mantenga visible durante el fade out
        el.style.transitionDuration = '0.5s';
      }
    },
    setup() {
      return {
        yowi
      };
    }
  };
</script>
  
<style scoped>
  /* Definir la animación para el fade */
  .fade-enter-active, .fade-leave-active, .fade-appear-active {
    transition: opacity 0.2s;
  }
  .fade-enter, .fade-leave-to, .fade-appear {
    opacity: 0;
  }
  .chat-bubble {
    position: fixed;
    bottom: 20px;
    right: 20px;
    z-index: 1000;
  }
  
  .bubble-icon {
    background-color: #007bff;
    border-radius: 50%;
    overflow: hidden;
    cursor: pointer;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
    width: 60px;
    height: 60px;
    display: flex;
    justify-content: center;
    align-items: center;
    box-shadow: rgba(0, 0, 0, 0.25) 0px 54px 55px, rgba(0, 0, 0, 0.12) 0px -12px 30px, rgba(0, 0, 0, 0.12) 0px 4px 6px, rgba(0, 0, 0, 0.17) 0px 12px 13px, rgba(0, 0, 0, 0.09) 0px -3px 5px;
  }
  
  .bubble-icon video {
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: 50%;
    
    
  }
  
  .chat-window {
    width: 300px;
    height: 400px;
    background-color: white;
    border-radius: 10px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
    display: flex;
    flex-direction: column;
  }
  
  .chat-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px;
    background-color: #007bff;
    color: white;
    border-radius: 10px 10px 0 0;
  }
  
  .chat-content {
    flex-grow: 1;
    padding: 10px;
    overflow-y: auto;
  }
  
  .centered-chat {
    bottom: auto;
    right: auto;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  }

  .EncuestasPublicas-contenedormsg {
    position: fixed;
    top: 50%;
    left: 50%;
    /* background: linear-gradient(50deg, rgba(164, 160, 239), rgba(166, 211, 242)); */    
    background: linear-gradient(50deg, var(--bluelight-sb), var(--purple-sb));
    transform: translate(-50%, -50%);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
    max-width: 1000%; /* Esto asegura que no se exceda el tamaño de la pantalla */
    max-height: 1000%;
    border-radius: 15px;
    opacity: 1;
    box-shadow: rgba(0, 0, 0, 0.25) 0px 54px 55px, rgba(0, 0, 0, 0.12) 0px -12px 30px, rgba(0, 0, 0, 0.12) 0px 4px 6px, rgba(0, 0, 0, 0.17) 0px 12px 13px, rgba(0, 0, 0, 0.09) 0px -3px 5px;
    backdrop-filter: blur(20px);
}

.background-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  
  background-color: var(--bs-border-color-translucent);
  z-index: 999; /* Debe estar por debajo del mensaje */
  border-radius: 20px;
  /*background: linear-gradient(90deg, var(--babyBlue) 0%, var(--blueBerryGlass) 20%, var(--babyBlue_7) 100%);
  backdrop-filter: blur(10px);*/
}

.EncuestasPublicas-cardmsg {
  display: flex;
  flex-direction: column !important;
  justify-content: center;
  align-items: center;
  flex-grow: 1;
  min-width: 300px;
  padding: 10px;
}


  @media (min-width: 768px) { 
      .EncuestasPublicas-cardmsg{
          flex-direction: row;
      }
  }

  .EncuestasPublicas-avatar{
      width: 80px;
      height: 80px;
      border-radius: 50%;            
      padding: 10px;
      overflow: hidden;
      position: relative;
      margin: 30px 20px 10px 20px;              
      box-shadow: rgba(0, 0, 0, 0.25) 0px 54px 55px,
        var(--blueBerryLight) 0px -12px 30px,
        var(--blueBerryLight) 0px 4px 6px,
        var(--blueBerryLight) 0px 12px 13px,
        var(--blueBerryLight) 0px -3px 5px; 
       /*box-shadow: var(--bluePerry) 2px 9px 10px;  */
  }

    .EncuestasPublicas-avatar video{
        width: 400px;
        position: absolute;
        top: -5px;
        left: 0px;
    }

    @media (max-width: 768px) { 
      .EncuestasPublicas-avatar{
          width: 50px;
          height: 50px;
          display: block;
          margin: 50% 0;
          background-color: tomato;
      }
    }

    .EncuestasPublicas-msgAvatar{
        max-height: 250px;
        overflow-y: auto;
        padding: 20px;
        border-radius: 20px;
        margin: 10px 0;
        margin-right: 5px;
        color: white;
    }
    .EncuestasPublicasContent-msgAvatar{   
      max-width: 100%;
    }

    .modalCompetencia-iconos {
        display: flex;
        justify-content: flex-end;
        align-items: center;   
        position: absolute;
        top: 10px;    
        right: 10px;
    }

    .pop-up-close {
      padding: unset;
      fill: var(--close);
    }
    .pop-up-close:hover {
        fill: var(--close-hover);
    }
    .contenedor_yowiBot{
      
    }

    .ComicBallonMSGBot-contenedor{
      display: flex;
      width: 92%;
    }

  

   
  
  </style>
  