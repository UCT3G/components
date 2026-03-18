<template>
  <thead>
    <tr>
      <th
        v-for="(columna, index) in json.columnas"
        :key="`columna-${index}`"
        :class="['col-12', { 'sticky-col-header': columnaFija.includes(index + 1) }]"
        :style="getEstilosColumna(index)"
      >
        <div class="d-flex TablaDinamica_nombreCampo">
          <p :title="columna.titulo">
            <span>{{ columna.titulo }}</span>
          </p>
        </div>

        <div class="TablaDinamica_contenedorFiltro col-12">
          <div class="position-relative TablaDinamica_orderable">
            <div v-if="columna.ordenable" class="">
              <DynamicSvgLoader
                title="vista edicion"
                @click="changeOrder(index)"
                :fileName="iconoRow(index)"
                width_icon="10px"
                :icon_active="true"
              ></DynamicSvgLoader>
            </div>
          </div>

          <div class="tablaDinamica-filtro-content">
            <div v-if="columna.filtro" class="d-flex">
              <input
                v-if="columna.type == 'texto'"
                @change="actualizarValor($event, index)"
                type="text"
                class="form-control"
                placeholder="..."
              />
              <input
                v-if="columna.type == 'number'"
                @change="actualizarValor($event, index)"
                type="number"
                class="form-control"
                placeholder="..."
              />
              <input
                v-if="columna.type == 'date'"
                @change="actualizarValor($event, index)"
                type="date"
                class="form-control"
                placeholder="..."
              />
              <select
                v-if="columna.type == 'select'"
                v-model="columna.valor"
                @change="actualizarValor($event, index)"
                class="form-select"
              >
                <option :value="''" selected>...</option>
                <option
                  v-for="opcion in columna.opciones"
                  :key="opcion.texto"
                  :value="opcion.valor"
                >
                  {{ opcion.texto }}
                </option>
              </select>
            </div>
          </div>
        </div>
      </th>
    </tr>
  </thead>
</template>

<script>
import { defineComponent, toRef } from "vue";
import DynamicSvgLoader from "@/components/LoaderSVG/LoaderSVG.vue";

export default defineComponent({
  name: "TablaHead",
  components: {
    DynamicSvgLoader,
  },
  props: {
    json: {
      type: Object,
      default: () => ({}),
    },
    columnaFija: {
      type: Array,
      default: () => [],
    },
    stickyOffsets: {
      type: Array,
      default: () => [],
    },
  },
  setup(props) {
    const json = toRef(props, "json");

    // Cambio aquí: iconoRow ahora es un método
    const iconoRow = (index) => {
      const columna = json.value.columnas[index]; // Accede directamente a la columna utilizando el índice
      switch (columna.bOrder) {
        case "asc":
          return "icons/UCT_ADMIN/miniRowDown";

        //return 'icons/UCT_ADMIN/miniRowUP';
        case "desc":
          return "icons/UCT_ADMIN/miniRowUp";
        default:
          return "icons/UCT_ADMIN/miniRowUpDown";
      }
    };

    const changeOrder = (index) => {
      // Obteniendo el orden actual de la columna seleccionada
      let ordenActual = json.value.columnas[index].bOrder;

      // Reiniciando el orden de todas las columnas a ''
      json.value.columnas.forEach((columna, idx) => {
        if (idx !== index) {
          columna.bOrder = "";
        }
      });

      // Cambiando el orden de la columna seleccionada basado en el estado actual
      switch (ordenActual) {
        case "":
          json.value.columnas[index].bOrder = "asc";
          break;
        case "asc":
          json.value.columnas[index].bOrder = "desc";
          break;
        default:
          json.value.columnas[index].bOrder = "";
          break;
      }
    };

    const actualizarValor = (event, index) => {
      json.value.columnas[index].valor = event.target.value;
      // emit('valorCambiado'); // Emitir un evento para notificar al componente padre
    };

    const getEstilosColumna = (index) => {
      const estilos = { width: json.value.columnas[index].width_col };
      
      if (props.columnaFija.includes(index + 1)) {
        estilos.position = 'sticky';
        estilos.zIndex = 11;
        
        if (props.stickyOffsets && props.stickyOffsets[index] !== undefined) {
          estilos.left = `${props.stickyOffsets[index]}px`;
        } else {
          // Backup fallback si no se ha calculado
          let left = 0;
          for (let i = 0; i < index; i++) {
            if (props.columnaFija.includes(i + 1)) {
              const widthStr = json.value.columnas[i].width_col || "150px";
              const widthVal = parseInt(widthStr) || 150;
              left += widthVal;
            }
          }
          estilos.left = `${left}px`;
        }
      }
      
      return estilos;
    };

    return {
      changeOrder,
      iconoRow,
      actualizarValor,
      getEstilosColumna,
    };
  },
});
</script>

<style scoped>
th p {
  margin: 0;
  padding: 0;
}
/* Estilos específicos para el componente */
th .loaderSVG-contend-selected {
  margin: 0;
  padding: 0;
}
.tablaDinamica-filtro-content {
  min-height: 20px;
}

.TablaDinamica_nombreCampo[data-v-74e73a92] {
  align-items: center;
  justify-content: center;
  padding-bottom: 15px !important;
}

.sticky-col-header {
  background-color: transparent !important;
}

.sticky-col-header::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: var(--purple-sb);
  z-index: -1;
}

/* Redondear esquina solo si es la primera columna fija */
th.sticky-col-header:first-child::before {
  border-radius: var(--border-radius-large) 0 0 0;
}
</style>
