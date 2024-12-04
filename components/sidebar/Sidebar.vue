<template>
  <div class="d-flex flex-column flex-shrink-0 justify-content-center uctSidebar-content">
    <div class="Sidebar-btnShow d-md-none" @click="MostrarSidebar">
      <DynamicSvgLoader class="sidebar-svg" :icon_active="btn_trespuntosActivo" width_icon="12px" fileName="icons/ellipsis-vertical"></DynamicSvgLoader>      
    </div>
    
    <div :class="class_uctSidebar">
      <div v-for="(modulo, index) in modulos_sistema" :key="index">     
          <BtnSistema 
            :sistema_activo="sistema_activo" 
            :name_sistema="modulo.sistema" 
            :pantallas="modulo.modulos"
            :icono_sistema="getIconoUrl(modulo.sistema)"
            @cambiarSistema="cambiarSistema">
          </BtnSistema>        
      </div>
    </div>
  </div>
</template>

<script>
import { defineComponent, ref, onMounted, watch} from 'vue';
import BtnSistema from './BtnSistema.vue';
import DynamicSvgLoader from '@/components/LoaderSVG/LoaderSVG.vue';
import { useStore } from 'vuex'; 

export default defineComponent({
  name: 'UCTSidebar',
  components: {
    BtnSistema,
    DynamicSvgLoader
  },
  props: {
    modulos_sistema: {
      type: Array,
      default: () => []
    }
  },
  setup(props,{emit}) {
    const store = useStore();
    const btn_trespuntosActivo = ref(false);
    const sistema_activo = ref('UCT COMPETENCIAS');
    const class_uctSidebar = ref('uctSidebar');
    

    const iconos_sistema = [
      { sistema: 'UCT ADMIN', url: 'icons/ADMIN-04' },
      { sistema: 'UCT COMPETENCIAS', url: 'icons/COMPETENCIAS-24' },
      { sistema: 'UCT FACULTADES', url: 'icons/FACULTADES-04' },
      { sistema: 'TRESGUERRAS', url: 'icons/RAFAGA-23' },
      { sistema: 'PDLT', url: 'icons/PDLT-23' },
    ];

    // Función para actualizar el tema basado en el sistema activo v3
    const actualizarTema = (sistema) => {
      store.dispatch('tema/actualizarTema', sistema);
      store.dispatch('user/setModuloActivo', {
          modulo_nombre:null,
          id_modulo:null,
          sistema:null,
          sistemaClic: sistema
      })     
    };
    
    // Watcher para sistema_activo
    watch(sistema_activo, (nuevoValor) => {  
      actualizarTema(nuevoValor);
    }, { immediate: true }); // La opción { immediate: true } asegura que se ejecute al montar


    onMounted(() => {
      actualizarTema(sistema_activo.value);
      CargarSistema(); // Esto asegura que se ejecute la lógica de carga al montar el componente      
    });

    const getIconoUrl = (nombreSistema) => {
      const icono = iconos_sistema.find(icon => icon.sistema === nombreSistema);
      return icono ? icono.url : null;
    };

    const cambiarSistema = (nuevoSistema) => {
      sistema_activo.value = nuevoSistema;      
      CargarSistema()      
    };

    const CargarSistema = ()=>{
      //Aqui cargamos componentes de forma dinamica
      emit('cambioSistema', sistema_activo.value);
    }

    const MostrarSidebar = () => {
      btn_trespuntosActivo.value = !btn_trespuntosActivo.value;
      class_uctSidebar.value = class_uctSidebar.value === 'uctSidebar' ? 'uctSidebar uctSidebar-show' : 'uctSidebar';
    };

    return {
      sistema_activo,
      getIconoUrl,
      cambiarSistema,
      MostrarSidebar,
      btn_trespuntosActivo,
      class_uctSidebar
    };
  }
})
</script>

<style>
.uctSidebard svg{
  fill: var(--babyBlue);
}
.btnSistema-actived svg{
  fill: var(--black);
}
</style>
<style scoped>
/* Tus estilos CSS específicos para el sidebar van aquí */

.uctSidebar-content {  
  position: fixed;  
  min-height: 80vh;
  width: 3rem;
  margin: 0;
  padding: 0;
  z-index: 100; 
  overflow: hidden;   
}
.uctSidebar {
  background-color: var(--blueBerry);  
  width: 0rem;
  height: 0vh;
  border-radius: 0px 30px 30px 0;
  padding: 30px 0px;
  max-height: 450px;  
  /*transition:  .8s;*/
  position: absolute;
  left: -5rem;
  z-index: 100;
  transition: 1s;
}

.uctSidebar-show{
  left: 0rem;
  width: 3rem;
  height: 55vh;
}
.Sidebar-btnShow{  
  top: 20px;
  position: absolute;
  left: 0px;  
}

@media (min-width: 768px){
  .uctSidebar {
    left: 0rem;
    width: 3rem;
    height: 55vh;
  }

  
}
</style>
