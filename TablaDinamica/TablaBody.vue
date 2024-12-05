<template>
 
  <tbody>
    <tr v-for="(fila_data,nofila) in data_table.valor" :key="`fila-${nofila}`" @click="filaClick(fila_data, nofila)">      
      <td v-for="(fila_estrutura, index) in json.filas" :key="`fila-${nofila}-columna-${index}`" :class="getIndicadorClass(fila_data)">
        <!-- Verifica el tipo de contenido de la fila -->
        <div v-if="fila_estrutura.type == 'label' && filaDataAsArray(fila_data)[index] != null" :class="Indicadores ? 'conBordeCentrado' : 'conBorde'" :title="filaDataAsArray(fila_data)[index]">          
            <span v-if = "filaDataAsArray(fila_data)[index] != null" class="td-titulo">{{ obtenerNombreColumna(json,index) }}: </span>{{ filaDataAsArray(fila_data)[index] }} 
        </div>        
        <div v-else-if="fila_estrutura.type == 'teleport'" class="conBorde">
          <span :name="`fila_estrutura-${nofila}-${index}`" :index="index"></span>
        </div>
        <!-- Cuando es el un formulario dinamico es un boton aqui -->
        <div v-else-if="CambiarMayuscula(fila_estrutura.type) === 'COMPUESTO'"
          class="d-flex sinBorde">
            <template v-for="(elemento, index_componente) in fila_estrutura.componente" :key="`elemento-${index_componente}`">
              <div v-if="CambiarMayuscula(elemento.nombre) =='FORMULARIO'" class="m-1">
                <!-- ABRE FORMULARIO ASOCIADO A LA TABLA --> 
                <button @click="turnOnFormularioCRUD(nofila,data_table.idGenerales)" class="btn btn-primary">Editar</button>
              </div>
              <div v-if="CambiarMayuscula(elemento.nombre) =='NEW_TAB'" class="m-1">  
                <!-- ABRE NUEVA PESTAÑA -->                 
                <button @click="AbrirPestaña(fila_data, index, index_componente, elemento.path)" class="btn btn-primary">Link</button>
              </div>
              <div v-if="CambiarMayuscula(elemento.nombre) =='BUTTON'" class="m-1">  
                <!-- BOTON QUE MODIFICA EL JSON-->                 
                <button @click="button_evento(fila_data, index, index_componente)" class="btn btn-primary">{{elemento.titulo}}</button>
              </div>
              <div v-if="CambiarMayuscula(elemento.nombre) =='COMPONENTE'" class="m-1">                  
                <!-- COMPONENTES PERSONALIZADOS -->   

                <template v-if="fila_data['col-'+index][0][0].valor">
                  <component :is="getComponent(fila_data['col-'+index][0][0].nombre_componente)" 
                  v-bind="fila_data['col-'+index][0][0].valor" ></component>
                </template>
                  
              </div>
            </template> 
        </div>
        <!-- Carga dinámicamente el componente si el tipo es 'componente' -->
        <!--<component v-else-if="fila_estrutura.type === 'componente'" :is="getComponent(fila_estrutura.componente)" :data="fila_estrutura.data"></component>-->
        <div v-else class="conBorde controles" :title="filaDataAsArray(fila_data)[index]"> 
            <span ></span>  
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
      },
      Indicadores: {
        type: Boolean,
        default: false
      }
    },
    emits: ['button_evento', 'turnOnFormularioCRUD', 'fila_click'],
    setup(props,context) {

      const getIndicadorClass = (fila_data) => {
        if (!props.Indicadores || !fila_data.indicador) {
          return ''; // Si Indicadores es false o no hay indicador, no aplica ninguna clase
        }

        const indicador = fila_data.indicador;

        if (indicador >= 99.98) {
          return 'azul'; // Aplica clase azul si el indicador es mayor o igual a 99.98
        } else if (indicador > 98 && indicador <= 99.97) {
          return 'verde'; // Aplica clase verde si el indicador está entre 98 y 99.97
        } else if (indicador < 97.99) {
          return 'rojo'; // Aplica clase rojo si el indicador es menor a 97.99
        }

        return ''; // Si no entra en ninguna condición, no aplica ninguna clase
      };


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
        // console.log(fila_data);
        return Object.values(fila_data);
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

      const obtenerNombreColumna = (json,index) => {
        return json.columnas[index].titulo
      }

      const filaClick = (fila, index) => {
        console.log("SE DIO CLICK");
        // emit('fila_click', {fila, index});
        context.emit('fila_click',{fila, index});
      }

      return {
        getComponent,
        turnOnFormularioCRUD,
        filaDataAsArray,
        AbrirPestaña,
        CambiarMayuscula,
        button_evento,
        obtenerNombreColumna,
        filaClick,
        getIndicadorClass
      };
    }
  });


  </script>
  
  <style scoped>
  /* Estilos específicos para el componente */
  .azul {
    color: #018FC7;
  }

  .verde {
    color: #5DC460;
  }

  .rojo {
    color:  #E26a2C;
  }

  </style>
  