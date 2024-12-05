<template>
  <div>
    <!-- Navbar -->
    <NavBarPaginasUCT :elementos_dropdown="false">
      <template #elementos_dropdown>
      </template>
      <template #elementos_opcionales>
      </template>
    </NavBarPaginasUCT>

    <!-- Contenedor principal con dos áreas -->
    <div class="GaleriaClasificarPsicometricos row">
      <!-- areaB estará en la parte superior en pantallas medianas o más pequeñas -->
      <div class="col-md-12 col-lg-3 areaB">
        <h5 class="titulo">Reconocimiento OCR</h5>
        <!-- DropZone centrado -->
        <DropZone          
          :paramName="'file'"
          :url_api="url_api"
          :maxFiles="3"
          :other_data="otherData"
          :acceptedFiles="'.jpg,.png,.jpeg,.webp,.pdf,.doc,.docx,.zip'"
          @uploadStart="uploadStart"
          @uploadSuccess="onFileUpload"
          @uploadEnd="EstadoUpload(false)"
          class="dropzone-container"
        />
      </div>

      <!-- areaA cambia a columna en pantallas medianas o más pequeñas -->
      <div class="col-md-12 col-lg-8 areaA">
        <div class="row">
          <CardGraficas
            v-for="(usuario, index) in usuarios_archivos"
            :key="index"
            :class="['card-grafica', { fullscreen: usuario.enPantallaCompleta }]"
          >
            <template #HeadTitulo><span class="texto-caja-titulo">{{ usuario.nombre }} {{ usuario.periodo }}-{{ usuario.ejercicio }}</span></template>
            <template #BodyContenido>
              <div v-if="usuario.archivo" class="texto-caja-body">
                <!-- Mostrar miniatura del archivo PDF -->
                <iframe 
                  :src="`${DEV_BASE_URL}${usuario.archivo}`" 
                  type="application/pdf" 
                  class="pdf-thumbnail">
                </iframe>
              </div>
              <div v-else class="texto-caja-body">
                <!-- Mostrar DropZone si usuario.archivo es null -->
                <DropZone
                  :paramName="'file'"
                  :url_api="url_api_one"
                  :maxFiles="1"
                  :other_data="[{ name: 'usuario', value: JSON.stringify(usuario) }]"
                  :acceptedFiles="'.pdf'"
                  @uploadSuccess="(data) => onFileUpload()"
                  class="dropzone-container"
                />
              </div>
            </template>
            <template #Foother>
              <div v-if="usuario.archivo" class="galeriaClasificar-footer">
                <ButtonPrimary
                  iconName="TRASH.svg"
                  width_icon="16px"
                  @click="EliminarDocumento(usuario)"
                ></ButtonPrimary>

                <ButtonPrimary
                  iconName="recurso-pdf.svg"
                  width_icon="16px"
                  @click="VerDocumento(usuario)"
                ></ButtonPrimary>                
              </div>
              <div v-else class="galeriaClasificar-footer">
              </div>
            </template>
          </CardGraficas>
        </div>
      </div>
    </div>
  </div>
 
 <!-- Loading Completo -->
 <LoadingUCT
        :blockFullScreem="true"
        class="position-fixed top-0 start-0"
        v-if="Pantallacargando"
      />
</template>

<script>
import { ref, computed, defineComponent, onMounted } from 'vue';
import NavBarPaginasUCT from '@/components/NavBar/NavBarPaginasUCT.vue';
import DropZone from '@/components/DropZone/DropZone.vue';
import CardGraficas from '@/components/Cards/CardGraficas.vue';
import axios,{DEV_BASE_URL} from '@/../axios-config.js';
import { useStore } from 'vuex';
import ButtonPrimary from '../ButtonWithIcon/ButtonPrimary.vue';
import LoadingUCT from '@/components/Loading/Loading.vue';

export default defineComponent({
  name: 'GaleriaClasificarPsicometricos',
  components: {
    NavBarPaginasUCT,
    ButtonPrimary,
    DropZone,
    CardGraficas,
    LoadingUCT,
  },
  props: {
    usuariosSelected: {
      type: Array,
      default: () => [],
    },
    psicometrico: {
      type: String,
      default: 'Psicometrico',
    },
    url_api: {
      type: String,
      default: '/direccion/SubirvariosArchivos',
    },
    url_api_one: {
      type: String,
      default: '/direccion/SubirUnArchivo',
    },
    url_api_eliminar: {
      type: String,
      default: '/direccion/EliminarDocumento',
    },
    url_api_consultar: {
      type: String,
      default: '/direccion/Consultardocumentos',
    },
  },
  setup(props) {
    const store = useStore();
    // Reactive state
    const uploadedFiles = ref([]);
    const usuarios_archivos = ref([]);
    const Pantallacargando = ref(false);

    // Computed property to handle other data for DropZone
    const otherData = computed(() => [
      { name: 'usuariosSelected', value: JSON.stringify(props.usuariosSelected) },
      { name: 'psicometrico', value: props.psicometrico },
    ]);

    // Methods
    const onFileUpload = (file) => {
      try {
        if (uploadedFiles.value.length < props.usuariosSelected.length) {
          uploadedFiles.value.push(file);
        } else {
          console.warn('Se alcanzó el límite máximo de archivos permitidos.');
        }
        ConsultarPDFS();
      } catch (error) {
        console.error('Error al subir archivo:', error);
      }
    }; 

    const ConsultarPDFS = async () => {
      if (!store.state.user.token) {
        console.error("Token no disponible. Por favor inicie sesión.");
        return;
      }
      try {
        let headers = {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${store.state.user.token}`,
        };

        const response = await axios.post(props.url_api_consultar, { usuariosSelected: props.usuariosSelected }, { headers: headers });
        if (response.data.usuariosSelected && response.data.usuariosSelected.length > 0) {
          usuarios_archivos.value = response.data.usuariosSelected;
        }
      } catch (error) {
        console.error("Error al consultar el endpoint:", error);
      }
    };

    const VerDocumento = (usuario) => {
      usuario.enPantallaCompleta = !usuario.enPantallaCompleta;
    };

    const EliminarDocumento = async (usuario) => {
      if (!store.state.user.token) {
        console.error("Token no disponible. Por favor inicie sesión.");
        return;
      }
      try {
        let headers = {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${store.state.user.token}`,
        };
        //const response = await axios.delete(`${props.eliminar_documento}/${usuario.id}`, { headers: headers });
        const response = await axios.post(props.url_api_eliminar, {usuario}, { headers: headers });
        if (response.status === 200) {
          console.log("Documento eliminado con éxito");
          ConsultarPDFS();
        }        
      } catch (error) {
        console.error("Error al eliminar el documento:", error);
      }
    };

    onMounted(() => {
      ConsultarPDFS();
    });

    const uploadStart = () => {
      Pantallacargando.value = true
    };

    const EstadoUpload = (estado) => {
      console.log("Estado upload", estado);
      if (!estado){
        Pantallacargando.value = estado;
      }
      
    };

    return {
      uploadedFiles,
      otherData,
      onFileUpload,
      usuarios_archivos,
      VerDocumento,
      EliminarDocumento,
      ConsultarPDFS,
      DEV_BASE_URL,
      uploadStart,
      Pantallacargando,
      EstadoUpload
    };
  },
});
</script>

<style scoped>
.GaleriaClasificarPsicometricos {
  gap: 20px;
  display: flex;
  justify-content: center;  
  height: calc(100vh - 150px);
}
.areaA {
  padding: 20px;
  display: flex;
  align-items: start;
  justify-content: start;
  margin-top: 10px;
  border-radius: 15px;
  flex-wrap: wrap;
}
.areaB {
  background-color: var(--bs-border-color);
  padding: 20px;
  display: flex;
  align-items: start;
  justify-content: start;
  align-items: center;
  flex-direction: column;
  margin-top: 10px;
  border-radius: 15px;
}
.dropzone-container {
  border: 2px dashed #ddd;
  padding: 20px;
  width: 100%;
  max-width: 300px;
  text-align: center;
  background-color: white;
  cursor: pointer;
}
.card-grafica {
  width: 290px;
  margin: 15px;
  transition: all 0.3s ease;
}
.pdf-thumbnail {
  width: 100%;
  height: 280px;
  border: none;  
}
.card-grafica.fullscreen {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 80vh;
  z-index: 1000;
  background-color: unset;
}
.card-grafica.fullscreen .pdf-thumbnail {
  width: 100%;
  height: 69vh;
  border: none; 
}
.texto-caja-titulo {
  font-size: .8rem;
  font-weight: bold;
  min-height: 24px;
}
.texto-caja-body {
  min-height: 280px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.galeriaClasificar-footer {
  display: flex;
  justify-content: center;
  min-height: 38px;
}


@media (max-width: 768px) {
  .GaleriaClasificarPsicometricos {
    flex-direction: column;
  }
}
</style>
