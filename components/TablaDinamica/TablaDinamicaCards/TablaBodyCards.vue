<template>
    <tbody class=""><!--Corresponde al tbody-->
      <tr>
        <td :colspan="json.filas.length" class="mb-3">

          <div class="mb-3 d-flex justify-content-center flex-wrap">
            <div class="card m-2 shadow" v-for="(fila_data, nofila) in data_table.valor" :key="`fila-${nofila}`">
              <div class="card-body">
                <div v-for="(valor, campo) in filaDataAsArray(fila_data)" :key="`campo-${campo}-${nofila}`" class="m-1">
                  <!--<div v-for="(fila_estrutura, index) in json.filas" :key="`fila-${nofila}-columna-${index}`" class="">-->
                    <!-- Verifica el tipo de contenido de la fila -->
                    <div v-if="json && json.filas && json.filas[campo] && json.filas[campo].type">
                      <div v-if="json.filas[campo].type === 'label'">
                        
                          <!-- Muestra el nombre del campo y el valor -->
                          <div class="TablaBodyCards-texto">
                            <span class="TablaBodyCards-tituloCampo subtitulo">{{ valor[0].toUpperCase() }}:</span>
                            <br> {{ valor[1] }}
                          </div>
                        
                      </div>
                      <!-- Maneja contenido compuesto con botones y otros componentes -->
                      <div v-if="CambiarMayuscula(json.filas[campo].type) === 'COMPUESTO'" class="d-flex flex-column card-footer text-muted">
                        <template v-for="(elemento, index_componente) in json.filas[campo].componente" :key="`elemento-${index_componente}`">
                          <div v-if="CambiarMayuscula(elemento.nombre) === 'FORMULARIO'" class="mt-1">
                            <button @click="turnOnFormularioCRUD(nofila, data_table.idGenerales)" class="btn btn-primary">Editar</button>
                          </div>
                          <div v-if="CambiarMayuscula(elemento.nombre) === 'NEW_TAB'" class="mt-1">
                            <button @click="AbrirPestaña(fila_data, index, index_componente, elemento.path)" class="btn btn-secondary">Link</button>
                          </div>
                          <div v-if="CambiarMayuscula(elemento.nombre) === 'BUTTON'" class="mt-1">
                            <button @click="button_evento(fila_data, index, index_componente)" class="btn btn-success">{{ elemento.titulo }}</button>
                          </div>
                          <div v-if="CambiarMayuscula(elemento.nombre) === 'COMPONENTE'" class="mt-1">
                            <template v-if="fila_data['col-'+index][0][0].valor">
                              <component :is="getComponent(fila_data['col-'+index][0][0].nombre_componente)" v-bind="fila_data['col-'+index][0][0].valor"></component>
                            </template>
                          </div>
                        </template>
                      </div>
                    </div>
                
                </div>              
              </div>
            </div>
          </div>

        </td>
      </tr>   
    </tbody>
  </template>
  
  <script>
  import { defineComponent, onMounted, defineAsyncComponent } from 'vue';  
  
  export default defineComponent({
    name: 'TablaBody',
    components: {
      
    },
    props: {
      json: {
        type: Object,
        default: () => ({})
      },
      data_table: {
        type: Object,
        default: () => (
          {
            valor:[[1,'nombre test','descripcion',5,'Activo','']],
            propiedades:{
              id_formulario:14,
              modulos:[1,2]
            }
          }
        )
      }
    },
    setup(props,context) {
      const getComponent = (nombre_componente) => {
     
        
        switch (nombre_componente) {
          case 'ListaDesplegableSimpleSTR':
            return defineAsyncComponent(() => import('@/components/ListaDesplegable/ListaDesplegableSimpleSTR.vue')); 
          case 'InputSwitch':
            return defineAsyncComponent(() => import('@/components/Inputs/InputSwitch.vue'));         
          
        
          default:
            return defineAsyncComponent(() => import('@/components/TablaDinamica/componenteUndefined')); 
           
        }
        
      };

      const button_evento = (fila_data, index, index_componente) => {        
        context.emit('button_evento',{fila_data, index, index_componente})
      }

      const turnOnFormularioCRUD =(index, idGenerales)=>{           
          context.emit('turnOnFormularioCRUD',{no_columna:index,idGenerales_:idGenerales[index]})
      }

      const AbrirPestaña =(fila_data, index, index_componente, path)=>{
        let data = filaDataAsArray(fila_data)[index][index_componente]
        //el data esta compuesto por objetos con los campos name_campo, valor que sedeveran agregar a la url
        let url = path
        data.forEach(element => {           
          url = url.includes('?')?url+'&':url+'?'
          url += `${element.name_campo}=${element.valor}`
        });
        //Se abre nueva pestaña
        window.open(url, '_blank');          
      }

      const filaDataAsArray = (fila_data)=> {
        return Object.entries(fila_data); 
      }

      const CambiarMayuscula = (cadena)=>{
        let cadena_regreso = cadena != null || cadena != ''?cadena.toUpperCase():''
        return cadena_regreso
      }      

      const validarEstructuraJSON = () => {
        if (!Array.isArray(props.json.filas)) {
          alert('La estructura del JSON falta o está mal: se esperaba "filas" como un array.');
          return false;
        }

        for (const fila of props.json.filas) {
          if (typeof fila.type !== 'string') {
            alert('Cada fila debe tener una propiedad "type" de tipo string.');
            return false;
          }

          if (fila.type === 'compuesto') {
            if (!Array.isArray(fila.componente)) {
              alert('Para las filas de tipo "compuesto", "componente" debe ser un array.');
              return false;
            }

            for (const componente of fila.componente) {
              if (typeof componente.nombre !== 'string') {
                alert('Cada componente dentro de "componente" debe tener una propiedad "nombre" de tipo string.');
                return false;
              }

              if (componente.nombre === 'new_tab') {
                if (!Array.isArray(componente.data) || typeof componente.path !== 'string' || componente.data.some(d => typeof d.name_campo !== 'string')) {
                  alert('Para los componentes de tipo "new_tab", "data" debe ser un array y cada elemento debe tener las propiedades "name_campo" y "path" de tipo string.');
                  return false;
                }
              } else if (componente.nombre === 'COMPONENTE') {
                if (typeof componente.path !== 'string') {
                  alert('Para los componentes de tipo "COMPONENTE", "path" debe ser una cadena que represente la ruta al componente.');
                  return false;
                }
              }
            }
          }
        }

        return true; // La estructura JSON es correcta
      };

      onMounted(() => {
        validarEstructuraJSON();
      });

      return {
        getComponent,
        turnOnFormularioCRUD,
        filaDataAsArray,
        AbrirPestaña,
        CambiarMayuscula,
        button_evento
      };
    }
  });


  </script>
  
  <style scoped>
    .card {
      margin-top: 20px;
      width: 270px;
    }
  </style>
  