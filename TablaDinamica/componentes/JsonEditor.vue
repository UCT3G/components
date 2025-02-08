<template>
    <div class="d-flex col-11">
      <div class="col-6 tablaDinamicaEditor-json" v-if="mostrarEditorJson">       
        <p>Estructura JSON de la tabla</p>
        <Vue3JsonEditor
          v-model="localJson"
          :show-btns="true"
          :mode="'code'"
          :expandedOnStart="true"
          @json-change="onJsonChange"
          @json-save="saveJson"
          @has-error="jsonError"
        />            
      </div>
      <div class="col-6 ms-2 position-relative tablaDinamicoEditor-contenedor">  
        <p>Previsualizador</p>              
        <div :style="{ zoom: zoomLevel }">
          <table class="table table-bordered table-light">
            <TablaHead :json="localJson" @orderChanged="handleOrderChange"></TablaHead>                        
          </table>            
        </div>
        <input class="position-absolute bottom-0 start-0" type="range" min="0.5" max="2" step="0.1" v-model="zoomLevel">
        <div>
          <textarea class="form-input w-100" rows="5" v-model="consultaSQL"></textarea>
          <button @click="GuardarConsulta" class="btn btn-primary">Generar JSON</button>
        </div>
      </div>
    </div>   
  </template>
  
  <script>
  import { defineComponent, ref, watch, onMounted } from 'vue';
  import { Vue3JsonEditor } from 'vue3-json-editor';
  import TablaHead from '@/components/TablaDinamica/TablaHead.vue';
  import { useStore } from 'vuex';
  import axios from '@/../axios-config.js';
  
  export default defineComponent({
    name: 'JsonEditorInternal',
    components: {
      Vue3JsonEditor,
      TablaHead,
    },
    props: {
      json: {
        type: Object,
        required: true,
        default: () => ({}),
      },
    },
    setup(props, { emit }) {
        const store = useStore();
        const localJson = ref(JSON.parse(JSON.stringify(props.json)) || {});
        const mostrarEditorJson = ref(true);
        const zoomLevel = ref(0.5);
        const consultaSQL = ref('');
  
      watch(() => props.json, (newVal) => {
        localJson.value = JSON.parse(JSON.stringify(newVal));
      });

      onMounted(() => {
        // Código para ejecutar después de montar el componente
        if (!localJson.value.columnas) {
          localJson.value = {
          "paginaActual": 1,
          "inicio": 0,
          "fin": 10,
          "no_filas": 10,
          "data": [],
          "where": "",
          "idGenerales": [
            {
              "name": "id_formulario",
              "value": null,
              "tabla_bd": "formulario_dinamico",
              "descripcion": "Esta relacionado con los valores de la tabla y que se muestran en el formulario para su actualizacion, una id por cada tabla del formulario"
            }
          ],
          "registros_total": 10,
          "registros_filtrados": 10,
          "columnas": [
            {
              "titulo": "id",
              "filtro": true,
              "valor": null,
              "control": "texto",
              "type": "texto",
              "width_col": "20%",
              "ordenable": true,
              "bOrder": "asc",
              "campo_nombre": "t.id_test",
              "opciones": null,
              "componentes": null
            }
          ],
          "filas": [
            {
              "type": "label",
              "componente": null,
              "data": null
            }
          ]
        }
        }
      });
  
      const onJsonChange = () => {
        // Código para manejar cambios en el JSON
      };
  
      const saveJson = async (valor)=> {
        localJson.value = valor;
        emit('update:json', localJson.value);
      };
  
      const jsonError = (error) => {
        console.log(error);
      };
  
      const handleOrderChange = (index) => {
        let bOrder = localJson.value.columnas[index].bOrder;
        switch (bOrder) {
          case '':
            bOrder = 'asc';
            break;
          case 'asc':
            bOrder = 'desc';
            break;
          case 'desc':
            bOrder = '';
            break;
        }
        localJson.value.columnas[index].bOrder = bOrder;
      };

      const getCredenciales = () => {
                const token = store.state.user.token; // Ajusta según la estructura de tu store
                return {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                };
            };
  
      const GuardarConsulta = async()=>{
                const headers = getCredenciales(); 

                try {
                    mostrarEditorJson.value = false
                    const response = await axios.post('http://localhost:8000/FormularioDinamico/GuardarConsultaSQL', { id_tabla: 0, consultaSQL:consultaSQL.value }, headers);                    
                    //se combierte la cadena de texto en un objeto json
                    //const data = JSON.parse(response.data.json)                    
                    localJson.value.columnas = response.data.json.columnas
                    localJson.value.filas = response.data.json.filas 
                    mostrarEditorJson.value = true                         
                        
                } catch (error) {
                console.error("Error al cargar el formulario:", error);
                }
        }
  
      return {
        localJson,
        onJsonChange,
        saveJson,
        jsonError,
        mostrarEditorJson,
        zoomLevel,
        handleOrderChange,
        GuardarConsulta,
        consultaSQL,
      };
    },
  });
  </script>
  
  <style>
  .tablaDinamicaEditor-json .jsoneditor-vue {
    height: 500px;
  }
  .tablaDinamicaEditor-json .editor {
    height: 500px !important;
  }
  .tablaDinamicoEditor-contenedor {
    overflow-x: hidden;
    height: 540px;
  }
  </style>
  