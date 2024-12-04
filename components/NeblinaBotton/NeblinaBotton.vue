<template>
  <div v-if="ScrollBoton" class="botton-neblina-contendor">
    <DynamicSvgLoader  
    class="botton-neblina position-absolute botton-0 end-0" 
    @click="scrollToTop"
    fileName="icons/UCT_ADMIN/barUp" width_icon="25px" :icon_active="true"></DynamicSvgLoader>
  </div>
  <div class="NeblinaBotton " :style="{ bottom: bottomMargin + 'px', zIndex: zIndexProp }">
    <div class="icono-informacion">
      <!-- Puedes usar Font Awesome o cualquier biblioteca de iconos para este propósito -->
      <i class="fas fa-info-circle"></i>
      <!-- Mensaje indicativo -->
      <p></p>
    </div>   
  </div>
</template>

<script>
import { defineComponent } from 'vue'; 
import DynamicSvgLoader from '@/components/LoaderSVG/LoaderSVG.vue'

export default defineComponent( {
  name: "NeblinaBotton",
  components: {
    DynamicSvgLoader,
  },
  props: {
    bottomMargin: {
      type: Number,
      default: 0,
    },
    zIndexProp: {
      type: Number,
      default: 50,
    },
    ScrollBoton: {
      type: Boolean,
      default: true,
    },
    scrollToTop: {
      type: Function,
      default: () => {
        window.scrollTo({
          top: 0,
          behavior: "smooth",
        });
      },
    },
    
  },
  setup() {
    //Emite el evento para volver al inicio


    return {
      
    };
  },
 
});
</script>

<style scoped>
.NeblinaBotton {
  position: fixed;
  
  left: 0;
  width: 100%;
  text-align: center;
  padding: 20px;
  /*background-color: tomato;*/
  /* Ajusta según sea necesario */
}

.NeblinaBotton::after {
    content: '';
    position: absolute;
    display: block;
    margin: auto;
    width: 50%;
    height: 150px;
    bottom: -30px;
    left: calc(50vw - 25%);
    border-radius: 50%;
    max-width: 1320px;
    background: rgb(255,255,255);
    background: linear-gradient(0deg, rgba(255,255,255,1) 58%, rgba(253,45,45,.0) 100%);
 
    z-index: -1;
}

.icono-informacion {
  /* Estilos para el ícono y el mensaje */
}
.botton-neblina{
  z-index: 100000;
}
.botton-neblina-contendor{
  position: fixed;
  bottom: 90px;
  right: 0;
  z-index: 100000;
}
</style>
