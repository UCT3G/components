<template>
  <div :class="ClasesTablaDinamica" :id="tabla_nombre">
    <div class="TablaDinamicabtn-filtrar" :class="{ 'flex-shrink-0': fullHeight }">
      <BotonIconoPrimary
        width_icon="13px"
        iconName="FILTRAR.svg"
        @clickPrimary="mostrarFiltros = !mostrarFiltros"
        >Filtros</BotonIconoPrimary
      >
    </div>

    <div class="TablaDinamica_iconEditor_container" v-if="perfilUsuario == 1 || perfilUsuario == 20">
      <DynamicSvgLoader
        class="TablaDinamica_iconEditor"
        title="vista edicion"
        @click="turnOnEditable"
        fileName="icons/UCT_ADMIN/COMPETENCIAS-13"
        width_icon="20px"
        :icon_active="true"
      ></DynamicSvgLoader>
    </div>

    <div v-if="BtnImprimir" class="TablaDinamica_printControls" :class="{ 'flex-shrink-0': fullHeight }">
      <BotonIconoPrimary iconName="BUSQUEDA MF.svg" width_icon="25px" @clickPrimary="Imprimir">
        Imprimir
      </BotonIconoPrimary>
      <select v-model="selectedLimit" id="limit-select">
          <option value="5" >5</option>
          <option value="50">50</option>
          <option value="100">100</option>
          <option value="Todos">Todos</option>
      </select>
    </div>
    <div class="TablaDinamica_scrollContainer" :class="{ 'flex-grow-1 overflow-auto': fullHeight }">
      <table class="table table-light" v-if="json" ref="tablaRef">
        <TablaHead
          :json="json"
          :columnaFija="columnaFija"
          :stickyOffsets="stickyOffsets"
          @orderChanged="handleOrderChange"
          :class="{ showHead: mostrarFiltros, hideHead: !mostrarFiltros }"
        ></TablaHead>
        <FilasCargando
          v-if="cargando"
          :columnas="json.filas.length"
        ></FilasCargando>
        <TablaBody
          v-else
          :json="json"
          :data_table="data_table"
          :columnaFija="columnaFija"
          :stickyOffsets="stickyOffsets"
          @button_evento="button_evento_hijo"
          @turnOnFormularioCRUD="ShowFormularioCRUD"
          @fila_click="handleFilaClick"
          :Indicadores="Indicadores"
        ></TablaBody>
      </table>
    </div>
    <TablaFooter :json="json" @cambiarPagina="CambiarPagina" :class="{ 'flex-shrink-0': fullHeight }"></TablaFooter>
  </div>

  <PopUpSolido
    :visible="visible_editor_tabla"
    @update:visible="visible_editor_tabla = $event"
    size="large"
    titulo="Tabla DinÃ¡mica Propiedades"
    ref="modalEditar"
    :fullScreenHeight="false"
  >
    <TablaDinamicaEditor
      :tabla_nombre="tabla_nombre"
      :tablaBase="tablaBase"
      @CerrarEditor="CerrarEditor"
    ></TablaDinamicaEditor>
  </PopUpSolido>

  <PopUpSolido
    :visible="visibleFormCRUD"
    size="large"
    @update:visible="cerrarFormCrud"
    titulo="Modifica la informaciÃ³n"
    :fullScreenHeight="false"
    ><!--JALA MALDITA SEA-->
    <div v-if="formularioBaseFilas != null"></div>
  </PopUpSolido>
</template>

<script>
import axios from '@/../axios-config.js';
import {
  defineComponent,
  ref,
  onMounted,
  watch,
  toRefs,
  computed,
  onUnmounted,
  nextTick,
} from "vue";
import TablaDinamicaEditor from "./TablaDinamicaEditor.vue";
import PopUpSolido from "@/components/Modal/ModalSolid.vue";
import DynamicSvgLoader from "@/components/LoaderSVG/LoaderSVG.vue";

import TablaHead from "@/components/TablaDinamica/TablaHead.vue";
import TablaBody from "@/components/TablaDinamica/TablaBody.vue";
import TablaFooter from "@/components/TablaDinamica/TablaFooter.vue";

import { inputs_catalogoSistema } from "@/store/ReporteadorReactive/FormularioDinamicoADM";
// import FormD_CapaTablaDinamica from "@/screens/UCT_Admin/FormD_ADM/CapasImplementacion/FormD_CapaTablaDinamica.vue";

import { TablaBase } from "@/store/ReporteadorReactive/TablaDinamica.js";
import { useStore } from "vuex";
import FilasCargando from "./FilasLoader.vue";

import BotonIconoPrimary from "@/components/ButtonWithIcon/ButtonPrimary.vue";

export default defineComponent({
  name: "TablaDinamica",
  components: {
    PopUpSolido,
    TablaDinamicaEditor,
    DynamicSvgLoader,
    TablaHead,
    TablaBody,
    FilasCargando,
    // Form_dinamic,
    // FormD_CapaTablaDinamica,
    TablaFooter,
    BotonIconoPrimary,
  },
  props: {
    tabla_nombre: {
      type: String,
      default: null,
    },
    BtnImprimir: {
      type: Boolean,
      default: false,
    },
    tablaBase: {
      type: Object,
      default: TablaBase,
    },
    consultar_registros: {
      type: Boolean,
      default: true,
    },
    url_formulario: {
      type: Object,
      default: () => ({ url: null, url_submit: null }),
    },
    breakpoint: {
      type: String,
      default: "lg", // Valor por defecto
    },
    Indicadores: {
      type: Boolean,
      default: false,
    },
    liberarAncho: {
      type: Boolean,
      default: false,
    },
    columnaFija: {
      type: Array,
      default: () => [],
    },
    fullHeight: {
      type: Boolean,
      default: false,
    },
  },
  emits: [
    "button_evento",
    "update:consultar_registros",
    "finalizarRenderBody",
    "visibleFormCRUD",
    "TBDestruida",
    "filaSeleccionada",
    "filtroTotal"
  ],
  setup(props, { emit }) {
    const selectedLimit = ref(5);
    const visibleFormCRUD = ref(false);
    const store = useStore();
    const json = ref(JSON.parse(props.tablaBase.json_tabla));
    const { consultar_registros } = toRefs(props);
    const formularioBaseFilas = ref({ titulo_formulario: "", filas: [] });
    const cargando = ref(true);
    const data_table = ref([]);
    const idGenerales = ref([]);
    const descargaData = ref(false);
    const getFormularioPorNombre = (nombre) =>
      store.getters["reporteador/getFormularioPorNombre"](nombre);

    const mostrarFiltros = ref(false);  
    const visible_editor_tabla = ref(false);
    const modalEditar = ref(null);
    const token = store.state.user.token;
    const user_rol = store.state.user.user_rol;
    const perfilUsuario = computed(() => store.state.user.userProfile?.id_perfil_fk);

    // Novedades para stickyColumns
    const tablaRef = ref(null);
    const stickyOffsets = ref([]);
    let resizeObserver = null;

    const calculateOffsets = () => {
      if (!tablaRef.value || !props.columnaFija.length) {
        stickyOffsets.value = [];
        return;
      }
      const ths = tablaRef.value.querySelectorAll("thead th");
      let currentLeft = 0;
      const newOffsets = [];
      ths.forEach((th, index) => {
        newOffsets.push(currentLeft);
        if (props.columnaFija.includes(index + 1)) {
          // Usamos getBoundingClientRect para precisiÃ³n decimal con paddings y bordes
          currentLeft += th.getBoundingClientRect().width;
        }
      });
      stickyOffsets.value = newOffsets;
    };

    onMounted(async () => {
      if (consultar_registros.value) {
        filtrar();
      }
      cargarFormularioBase();

      // Usar ResizeObserver para recalcular si el contenido de la tabla cambia de tamaÃ±o
      if (window.ResizeObserver) {
        resizeObserver = new ResizeObserver(() => {
          calculateOffsets();
        });
        if (tablaRef.value) {
          resizeObserver.observe(tablaRef.value);
        }
      }
    });

    onUnmounted(() => {
      if (resizeObserver) {
        resizeObserver.disconnect();
      }
    });

    watch(
      () => props.columnaFija,
      () => {
        nextTick(calculateOffsets);
      },
      { deep: true }
    );
    
    watch(
      json, // Watching the ref directly
      () => {
        nextTick(() => {
          if (resizeObserver && tablaRef.value) {
            resizeObserver.observe(tablaRef.value);
          }
          calculateOffsets();
        });
      },
      { deep: true }
    );

    const ClasesTablaDinamica = computed(() => {
      let baseClases = "TablaDinamica col-12";
      if (props.liberarAncho) {
        baseClases += " liberar-ancho";
      }
      
      if (props.fullHeight) {
        baseClases += " d-flex flex-column h-100 overflow-hidden";
      }

      switch (props.breakpoint) {
        case "sm":
          return `${baseClases} break-sm`;
        case "md":
          return `${baseClases} break-md`;
        case "lg":
          return `${baseClases} break-lg`;
        case "unset":
          return baseClases;
        default:
          return `${baseClases} break-movil`;
      }
    });

    const tablaStyles = computed(() => {
      return {
        "--tabla-dinamica-breakpoints": `${props.breakpoint}`,
      };
    });

    const turnOnEditable = () => {
      visible_editor_tabla.value = true;
    };

    async function cargarFormularioBase() {
      formularioBaseFilas.value = await getFormularioPorNombre(
        props.tabla_nombre + "_form"
      );
    }

    watch(
      () => props.tablaBase.json_tabla,
      (newValue, oldValue) => {
        if (newValue != oldValue) {
          json.value = JSON.parse(newValue);
        }
      }
    );

    // El onMounted fue movido arriba y combinado con el ResizeObserver

    //Cambia el orden con el que se mostraran los datos
    const handleOrderChange = (index) => {
      let bOrder = json.value.columnas[index].bOrder;
      switch (bOrder) {
        case "":
          bOrder = "asc";
          break;
        case "asc":
          bOrder = "desc";
          break;
        case "desc":
          bOrder = "";
          break;
      }
      json.value.columnas[index].bOrder = bOrder;
    };

    const ShowFormularioCRUD = (data) => {
      visibleFormCRUD.value = true;
      idGenerales.value = data.idGenerales_;
      descargaData.value = true;
    };

   const filtrar = async () => {
      try {
        let tbase = props.tablaBase;
        tbase.json_tabla = JSON.stringify(json.value);

        if (typeof tbase.id_tabla === "object") {
          return false;
        }

        const res = await store.dispatch("reporteador/CargarDataTable", {
          token: store.state.user.token,
          tablaBase: tbase,
        });

        data_table.value = {
          valor: res.data.data_table.registros,
          idGenerales: res.data.data_table.idGenerales,
          propiedades: res.data.propiedades,
        };

        store.dispatch("reporteador/agregarRegistrosTabla", {
          nombreTabla: tbase.nombre_tabla,
          registros: data_table.value.valor,
        });

        json.value.registros_total = res.data.data_table.registros_total;
        json.value.registros_filtrados =  res.data.data_table.registros_filtrados;
        json.value.filas = res.data.data_table.json_actualizado.filas;
        cargando.value = false; // Actualiza el estado cuando los datos estÃ¡n cargados
        emit("finalizarRenderBody");
        emit("filtroTotal", json.value.registros_filtrados);
      } catch (error) {
        console.error("OcurriÃ³ un error en filtrar:", error);
        // Manejar el error adecuadamente aquÃ­
        cargando.value = false; // Asegurarse de que la indicaciÃ³n de carga se detenga en caso de error
        alert("Error al filtrar los datos. Por favor, intÃ©ntelo de nuevo.");
      }
    };

    watch(consultar_registros, (newValue) => {
      //Cuando cambia el valor de consultar_registros, se ejecuta la funciÃ³n filtrar
      if (newValue === true) {
        filtrar();
        emit("update:consultar_registros", false);
      }
    });

    watch(selectedLimit, async(newVal, oldVal) => {
      if(newVal != oldVal){
        let mostrar = newVal;
        if(newVal == 'Todos'){
          mostrar = json.value.registros_filtrados;
        }
        json.value.paginaActual = 1;
        json.value.fin = mostrar;
        json.value.inicio = 0;
        filtrar();
      }
    });

    watch(
      () => json.value.columnas.map((columna) => columna.valor),
      (nuevosValores, viejosValores) => {
        // FunciÃ³n para verificar si todos los valores son nulos, vacÃ­os o espacios en blanco
        const todosSonNulosOVacios = (valores) =>
          valores.every((valor) => valor === null || valor === '' || valor.trim?.() === '');

        // Si ambos conjuntos (nuevos y viejos valores) son nulos/vacÃ­os, no ejecuta filtrar()
        if (todosSonNulosOVacios(nuevosValores) && todosSonNulosOVacios(viejosValores)) {
          return; // No hacer nada
        }

        // Verificar si hubo algÃºn cambio significativo
        const cambioSignificativo = nuevosValores.some(
          (valor, idx) => valor !== viejosValores[idx]
        );
        if (cambioSignificativo) {
          json.value.paginaActual = 1;
          json.value.fin = json.value.no_filas;
          json.value.inicio = 0;
          filtrar();
        }
      },
      {
        deep: true, // Importante para observar cambios dentro de objetos/arrays
        immediate: false, // Si deseas que se ejecute inmediatamente despuÃ©s del montaje, cambia a true
      }
    );

    watch(
      () => json.value.columnas.map((columna) => columna.bOrder),
      (nuevosValores, viejosValores) => {
        if(nuevosValores.length != viejosValores.length){
          return;
        }
        const cambioSignificativo = nuevosValores.some(
          (valor, idx) => valor !== viejosValores[idx]
        );
        if (cambioSignificativo) {
          json.value.paginaActual = 1;
          json.value.fin = json.value.no_filas;
          json.value.inicio = 0;
          filtrar();
        }
      },
      {
        deep: true, // Importante para observar cambios dentro de objetos/arrays
        immediate: false, // Si deseas que se ejecute inmediatamente despuÃ©s del montaje, cambia a true
      }
    );

    watch(
      () => json.value.fin,
      () => {
        //filtrar();
      },
      {
        deep: true, // Importante para observar cambios dentro de objetos/arrays
        immediate: false, // Si deseas que se ejecute inmediatamente despuÃ©s del montaje, cambia a true
      }
    );

    const button_evento_hijo = ({ fila_data, index, index_componente }) => {
      //console.log(fila_data, index, index_componente)
      emit("button_evento", { fila_data, json, index, index_componente });
    };

    const formularioBaseFilasSuccess = ({ estado }) => {
      //console.log(estado)
      if (estado) {
        filtrar();
      }
    };

    const CambiarPagina = (pagina) => {
      json.value.paginaActual = pagina;
      filtrar();
    };

    const cerrarFormCrud = () => {
      visibleFormCRUD.value = false;
      emit("visibleFormCRUD", false);
    };

    const CerrarEditor = () => {
      visible_editor_tabla.value = false;
      //emit("visible_editor_tabla", false);
    };

    const handleFilaClick = ({ fila, index }) => {
      console.log("Fila seleccionada:", fila, "Ãndice:", index);
      // Puedes emitir el evento hacia el padre o realizar alguna acciÃ³n
      emit("filaSeleccionada", { fila, index });
    };

    const Imprimir = async () => {
      let tbase = JSON.parse(JSON.stringify(props.tablaBase));
      let jsonTabla = JSON.parse(tbase.json_tabla);

      let limit = selectedLimit.value;
      if(limit == 'Todos'){
        limit = json.value.registros_filtrados;
      }
      
      tbase.fin = limit;
      tbase.no_filas = limit;
      jsonTabla.no_filas = limit;
      jsonTabla.fin = limit;
      tbase.json_tabla = JSON.stringify(jsonTabla);

      const res = await store.dispatch("reporteador/CargarDataTable", {
        token: store.state.user.token,
        tablaBase: tbase
      });

      const response = await axios.post("/Imprimibles/crear_excel", {
          columnas: json.value.columnas,
          datos: res.data.data_table.registros,
      }, {
          responseType: 'blob'
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'ReporteSucursal.xlsx');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      recalcular();
    };

    const recalcular = async() => {
      json.value.paginaActual = 1;
      json.value.fin = 10;
      json.value.inicio = 0;
      selectedLimit.value = 5; // Reset selector
      filtrar();
    };
    onUnmounted(() => {
      if (!store.getters["reporteador/getTablaPorNombre"](props.tabla_nombre)) {
        return;
      }
      // Limpiar todas las propiedades valor de json.value.columnas.valor
      json.value.columnas.forEach((columna) => {
        columna.valor = "";
      });
      store.getters["reporteador/getTablaPorNombre"](
        props.tabla_nombre
      ).json_tabla = JSON.stringify(json.value);

      emit("TBDestruida", { mensaje: "El componente ha sido destruido." });
    });

    return {
      visible_editor_tabla,
      turnOnEditable,
      handleOrderChange,
      json,
      formularioBaseFilas,
      visibleFormCRUD,
      ShowFormularioCRUD,
      cargando,
      data_table,
      inputs_catalogoSistema,
      idGenerales,
      descargaData,
      button_evento_hijo,
      formularioBaseFilasSuccess,
      CambiarPagina,
      mostrarFiltros,
      tablaStyles,
      ClasesTablaDinamica,
      cerrarFormCrud,
      CerrarEditor,
      handleFilaClick,
      tablaRef,
      stickyOffsets,
      perfilUsuario,
      Imprimir,
      selectedLimit,
    };
  },
});
</script>

<style>
.TablaDinamica {
  position: relative;
}

.TablaDinamica .TablaDinamicabtn-filtrar {
  display: none;
}

.TablaDinamica_iconEditor_container {
  position: absolute;
  right: 13px;
  top: 40px;
  z-index: 10;
}

.TablaDinamica_iconEditor {
  cursor: pointer;
  fill: var(--acceso0);
  background-color: var(--blueBerryPastel);
  border-radius: 50%;
}

.TablaDinamica_iconEditor:hover {
  cursor: pointer;
  transform: scale(1.1);
  transition: transform 0.3s ease-in-out;
  fill: var(--acceso0);
  background-color: var(--input);
  border-radius: 50%;
}

.TablaDinamica_printControls {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
}

#limit-select {
  padding: 0.3rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  min-width: 100px;
}

@media (min-width: 993px) {
  .TablaDinamica.liberar-ancho .TablaDinamica_scrollContainer {
    overflow-x: auto;
    padding-bottom: 20px;
    background:
      linear-gradient(to right, white 30%, rgba(255, 255, 255, 0)),
      linear-gradient(to right, rgba(255, 255, 255, 0), white 70%) 100% 0,
      radial-gradient(farthest-side at 0 50%, rgba(0, 0, 0, .2), rgba(0, 0, 0, 0)),
      radial-gradient(farthest-side at 100% 50%, rgba(0, 0, 0, .2), rgba(0, 0, 0, 0)) 100% 0;
    background-repeat: no-repeat;
    background-color: white;
    background-size: 40px 100%, 40px 100%, 14px 100%, 14px 100%;
    background-attachment: local, local, scroll, scroll;
  }

  .TablaDinamica.liberar-ancho .TablaDinamica_scrollContainer table {
    width: max-content;
    min-width: 100%;
  }

  .TablaDinamica.liberar-ancho .TablaDinamica_scrollContainer table thead tr th .TablaDinamica_nombreCampo {
    max-width: 250px !important;
    justify-content: flex-start !important;
    padding-left: 5px;
  }

  .TablaDinamica.liberar-ancho .TablaDinamica_scrollContainer table thead tr th .TablaDinamica_nombreCampo p {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    min-width: 0;
    width: 100%;
    text-align: left;
    margin: 0;
  }

  .TablaDinamica.liberar-ancho .TablaDinamica_scrollContainer table tbody tr td .conBorde,
  .TablaDinamica.liberar-ancho .TablaDinamica_scrollContainer table tbody tr td .conBordeCentrado {
    white-space: nowrap;
    max-width: 250px !important;
    display: block !important;
    overflow: hidden !important;
    text-overflow: ellipsis !important;
    text-align: left !important;
    padding-left: 5px;
    padding-right: 5px;
  }

  .TablaDinamica.liberar-ancho table thead tr {
    position: sticky;
    top: 0;
    z-index: 10;
  }

  .TablaDinamica.liberar-ancho table thead tr th {
    white-space: nowrap;
    background-color: var(--input-bg);
  }

  .TablaDinamica.liberar-ancho table thead tr::after {
    z-index: 2;
  }

  .TablaDinamica.h-100 .TablaDinamica_scrollContainer table thead {
    z-index: 20;
  }

  .TablaDinamica.h-100 .TablaDinamica_scrollContainer table thead tr th {
    background-color: var(--input-bg);
  }
}

.TablaDinamica table {
  border-collapse: collapse;
  border-spacing: 0;
  border-radius: var(--border-radius-large);
  box-shadow: 0px 4px 20px rgba(0, 0, 0, 0.10), 0px 1px 4px rgba(0, 0, 0, 0.08);
}

.TablaDinamica table thead {
  overflow: hidden;
  position: relative;
  z-index: 1;
}

.TablaDinamica table thead tr th {
  position: relative;
  z-index: 3;
  background-color: unset;
  color: var(--txt-table-title);
  font-family: "MonserratBoldItalic";
  padding: 0;
  border-bottom: none !important;
}

.TablaDinamica table thead tr th:first-child {
  border-radius: var(--border-radius-small) 0px 0px 0px;
}

.TablaDinamica table thead tr th:last-child {
  border-radius: 0px var(--border-radius-large) 0px 0px;
}

.TablaDinamica .TablaDinamica_nombreCampo {
  z-index: 3;
  position: relative;
  min-height: 28px;
  margin: 5px 12.5px;
  text-align: center;
  font-size: 13.5px;
  margin-top: 8px;
  height: 30px;
  overflow-y: hidden;
  padding: 5px 0px;
}

.TablaDinamica table thead tr::after {
  content: "";
  width: 100%;
  height: 31px;
  font-size: 12px;
  position: absolute;
  border-radius: var(--border-radius-large) var(--border-radius-large) 0px 0px;
  left: 0;
  top: 0;
  background: linear-gradient(
    90deg,
    var(--purple-sb) 0%,
    var(--bluelight-sb) 100%
  );
  color: var(--babyBlue);
  z-index: 2;
}

.TablaDinamica .TablaDinamica_contenedorFiltro {
  position: relative;
  background-color: unset;
  z-index: 3;
  min-height: 45px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.TablaDinamica .TablaDinamica_contenedorFiltro .TablaDinamica_orderable div,
.TablaDinamica .TablaDinamica_contenedorFiltro .TablaDinamica_iconfiltro div {
  background-color: var(--input);
  z-index: 3;
  width: 24px;
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 32px;
  margin-left: 15px;
  border-radius: 10px 0px 0px 10px;
}

.TablaDinamica .TablaDinamica_contenedorFiltro .TablaDinamica_orderable svg,
.TablaDinamica .TablaDinamica_contenedorFiltro .TablaDinamica_iconfiltro svg {
  fill: var(--icon_color_table);
  width: 12px;
  font-size: 12px;
}

.TablaDinamica .TablaDinamica_contenedorFiltro .tablaDinamica-filtro-content {
  position: relative;
  z-index: 3;
  background-color: unset;
  min-width: 55px;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 90%;
}

.TablaDinamica
  .TablaDinamica_contenedorFiltro
  .tablaDinamica-filtro-content
  div {
  width: 100%;
}

.TablaDinamica
  .TablaDinamica_contenedorFiltro
  .tablaDinamica-filtro-content
  input,
.TablaDinamica
  .TablaDinamica_contenedorFiltro
  .tablaDinamica-filtro-content
  select {
  width: 90%;
  height: 32px;
  border-radius: 0px 10px 10px 0px;
  padding: 0 10px;
  margin: 5px 0;
  font-size: 12px;
  color: var(--txt-table);
  border: unset;
  background-color: var(--input);
}

.TablaDinamica table thead .TablaDinamica_contenedorFiltro::before {
  content: "";
  width: 100%;
  height: 45px;
  position: absolute;
  left: 0;
  bottom: 0;
  color: var(--babyBlue);
  z-index: 2;
  background-color: var(--input-bg);
  box-shadow: 0px 8px 12px -6px rgba(0,0,0,0.15);
}

.TablaDinamica .TablaDinamica_orderable {
  min-height: 24px;
}

.TablaDinamica table tbody tr td {
  padding: 0px 16px;
  padding-top: 2px;
  border: unset;
  font-size: 12px;
  background-color: var(--bg-table);
  color: var(--txt-table);
  font-family: "MonserratSemiBold";
  border-bottom: 1.5px solid var(--blueBerryPastel);
}

.TablaDinamica table tbody tr td .conBorde {
  min-height: 35px;
  max-height: 50px;
  display: flex;
  align-items: start;
  overflow: hidden;
  position: relative;
  height: 50px;
  padding: 10px 0px 0px 0px;
}

.TablaDinamica table tbody tr td .conBordeCentrado {
  min-height: 35px;
  max-height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  position: relative;
  height: 50px;
  padding: 10px 0px 0px 0px;
}

.TablaDinamica table tbody tr td .conBorde::before {
  content: "";
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 20px;
  pointer-events: none;
}

.TablaDinamica table tbody tr td .conBorde.controles {
  all: unset;
}

.TablaDinamica table tbody tr:hover td {
  background: var(--bg-table-hover);
}

.TablaDinamica table tbody tr .td-titulo {
  display: none;
}

.TablaDinamica table tbody tr td:last-child {
  border-right: unset;
}

.TablaDinamica table tbody tr:last-child td {
  border-bottom: unset;
}

.TablaDinamica table tbody :last-child td:first-child {
  border-radius: 0px 0px 0px var(--border-radius-small);
}

.TablaDinamica table tbody :last-child td:last-child {
  border-radius: 0px 0px var(--border-radius-small) 0px;
}

.TablaDinamicaFooter {
  background: var(--blanco);
}

.TablaDinamica .TablaDinamicaFooter_pagination nav .pagination {
  background: linear-gradient(
    90deg,
    var(--purple-sb-70) 0%,
    var(--bluelight-sb-70) 100%
  );
  width: fit-content;
  border-radius: 10px;
  background: var(--bluelight-sb-70);
}

.TablaDinamica .TablaDinamicaFooter_pagination nav .pagination .active a {
  color: var(--purple-sb);
  border: unset;
}

.TablaDinamica .TablaDinamicaFooter_pagination nav .pagination li a {
  background-color: var(--bg-table);
  color: var(--footer-table-txt);
  font-family: "MonserratSemiBold";
  font-size: 14px;
  border: var(--footer-table-bg);
  transition: all .2s ease;
}

.TablaDinamica .TablaDinamicaFooter_pagination nav .pagination li a:hover {
  transform: translateY(-1px);
  opacity: .9;
}

@media (max-width: 576px) {
  .TablaDinamica table tbody tr td .conBorde::before,
  .TablaDinamica.break-sm .TablaDinamicabtn-filtrar {
    display: inline-block;
  }
  .TablaDinamica.break-sm table {
    display: block;
    position: relative;
  }
  .TablaDinamica.break-sm table thead {
    background-color: var(--blueBerry);
    border-radius: var(--border-radius-large) var(--border-radius-large) 0px 0px;
    position: relative;
    width: 100%;
    display: block;
    max-height: 0px;
    transition: max-height 0.5s ease;
  }
  .TablaDinamica.break-sm table .showHead {
    max-height: 2000px;
  }
  .TablaDinamica.break-sm table thead tr {
    display: flex;
    flex-direction: column;
    width: 100%;
    position: relative;
  }
  .TablaDinamica.break-sm table thead tr th {
    border-radius: unset;
    background: unset;
    width: 100% !important;
    position: relative;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    border: unset;
  }
  .TablaDinamica.break-sm .TablaDinamica_nombreCampo {
    font-family: "MonserratSemiBold";
    font-size: 0.8rem;
  }
  .TablaDinamica.break-sm table thead .TablaDinamica_contenedorFiltro {
    width: 60%;
    display: flex;
    justify-content: end;
    padding: 0 15px;
    background: unset;
  }
  .TablaDinamica.break-sm .tablaDinamica-filtro-content select {
    min-width: 200px;
  }
  .TablaDinamica.break-sm .tablaDinamica-filtro-content input {
    width: 100%;
  }
  .TablaDinamica.break-sm .TablaDinamica_iconEditor_container {
    top: 5px;
  }
  .TablaDinamica.break-sm .TablaDinamica_iconEditor {
    background-color: var(--blueBerry);
    border-radius: 50%;
    z-index: 10;
    box-shadow: rgba(50, 50, 93, 0.25) 0px 6px 12px -2px,
      rgba(0, 0, 0, 0.3) 0px 3px 7px -3px;
  }
  .TablaDinamica.break-sm tbody {
    display: flex;
    width: 100%;
    position: relative;
    flex-wrap: wrap;
    justify-content: center;
  }
  .TablaDinamica.break-sm tbody tr {
    display: flex;
    flex-direction: column;
    width: 100%;
    position: relative;
    margin: 10px;
    padding: 0px !important;
    border-radius: 20px;
    border: unset;
    box-shadow: rgba(0, 0, 0, 0.16) 0px 3px 6px, rgba(0, 0, 0, 0.23) 0px 3px 6px;
  }
  .TablaDinamica.break-sm tbody tr td {
    background-color: unset;
    border-right: unset !important;
    border-bottom: unset !important;
    width: calc(100% - 20px);
    min-height: 30px;
    font-size: 12px;
    padding: 10px;
  }
  .TablaDinamica.break-sm table tbody tr .td-titulo {
    display: inline-block;
    background: var(--blueBerryPastel);
    width: 30%;
    min-width: 100px;
    text-align: end;
    padding: 0 10px 0px 5px;
    margin: 0 5px 0px 0px;
  }
  .TablaDinamica.break-sm tbody tr td .conBorde {
    border-bottom: solid 1px var(--blueBerryPastel);
  }
  .TablaDinamica.break-sm tbody tr td:nth-child(1) .td-titulo,
  .TablaDinamica.break-sm tbody tr td:nth-child(1) .conBorde {
    background: unset !important;
    border-bottom: unset;
    width: auto;
    font-size: 1rem;
    color: var(--babyBlue);
    margin: 0;
    padding: 0;
    font-family: "MonserratSemiBoldItalic";
  }
  .TablaDinamica.break-sm tbody tr td:nth-child(1) {
    position: relative;
    background: linear-gradient(
      90deg,
      var(--purple-sb-70) 0%,
      var(--bluelight-sb-70) 100%
    );
    border-bottom: unset;
    border-radius: 15px 15px 0px 0px;
    width: 100%;
    top: 0;
    left: 0;
  }
  .TablaDinamica.break-sm table {
    border-collapse: collapse;
    border-spacing: 0;
    box-shadow: unset;
    border-radius: 20px;
  }
  .TablaDinamica.break-sm table .DropDownTrespuntos {
    position: absolute;
    right: 10px;
    top: 0;
    color: var(--babyBlue);
  }
  .TablaDinamica.break-sm table .DropDownTrespuntos .icon {
    fill: var(--babyBlue);
  }
  .TablaDinamica.break-sm table .dropstart .dropdown-toggle::before {
    color: var(--babyBlue);
  }
}

@media (max-width: 768px) {
  .TablaDinamica table tbody tr td .conBorde::before,
  .TablaDinamica.break-md .TablaDinamicabtn-filtrar {
    display: inline-block;
  }
  .TablaDinamica.break-md table {
    display: block;
    position: relative;
  }
  .TablaDinamica.break-md table thead {
    background-color: var(--blueBerry);
    position: relative;
    width: 100%;
    display: block;
    max-height: 0px;
    transition: max-height 0.5s ease;
    border-radius: var(--border-radius-large) var(--border-radius-large) 0px 0px;
  }
  .TablaDinamica.break-md table .showHead {
    max-height: 2000px;
  }
  .TablaDinamica.break-md table thead tr {
    display: flex;
    flex-direction: column;
    width: 100%;
    position: relative;
  }
  .TablaDinamica.break-md table thead tr th {
    border-radius: unset;
    background: unset;
    width: 100% !important;
    position: relative;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    border: unset;
  }
  .TablaDinamica.break-md .TablaDinamica_nombreCampo {
    font-family: "MonserratSemiBold";
    font-size: 0.8rem;
  }
  .TablaDinamica.break-md table thead .TablaDinamica_contenedorFiltro {
    width: 60%;
    display: flex;
    justify-content: end;
    padding: 0 15px;
    background: unset;
  }
  .TablaDinamica.break-md .tablaDinamica-filtro-content select {
    min-width: 200px;
  }
  .TablaDinamica.break-md .tablaDinamica-filtro-content input {
    width: 100%;
  }
  .TablaDinamica.break-md .TablaDinamica_iconEditor_container {
    top: 5px;
  }
  .TablaDinamica.break-md .TablaDinamica_iconEditor {
    background-color: var(--blueBerry);
    border-radius: 50%;
    z-index: 10;
    box-shadow: rgba(50, 50, 93, 0.25) 0px 6px 12px -2px,
      rgba(0, 0, 0, 0.3) 0px 3px 7px -3px;
  }
  .TablaDinamica.break-md tbody {
    display: flex;
    width: 100%;
    position: relative;
    flex-wrap: wrap;
    justify-content: center;
  }
  .TablaDinamica.break-md tbody tr {
    display: flex;
    flex-direction: column;
    width: 100%;
    position: relative;
    margin: 10px;
    padding: 0px !important;
    border-radius: 20px;
    border: unset;
    box-shadow: rgba(0, 0, 0, 0.16) 0px 3px 6px, rgba(0, 0, 0, 0.23) 0px 3px 6px;
  }
  .TablaDinamica.break-md tbody tr td {
    background-color: unset;
    border-right: unset !important;
    border-bottom: unset !important;
    width: calc(100% - 20px);
    min-height: 30px;
    font-size: 12px;
    padding: 10px;
  }
  .TablaDinamica.break-md table tbody tr .td-titulo {
    display: inline-block;
    background: var(--blueBerryPastel);
    width: 30%;
    min-width: 100px;
    text-align: end;
    padding: 0 10px 0px 5px;
    margin: 0 5px 0px 0px;
  }
  .TablaDinamica.break-md tbody tr td .conBorde {
    border-bottom: solid 1px var(--blueBerryPastel);
  }
  .TablaDinamica.break-md tbody tr td:nth-child(1) .td-titulo,
  .TablaDinamica.break-md tbody tr td:nth-child(1) .conBorde {
    background: unset !important;
    border-bottom: unset;
    width: auto;
    font-size: 1rem;
    color: var(--babyBlue);
    margin: 0;
    padding: 0;
    font-family: "MonserratSemiBoldItalic";
  }
  .TablaDinamica.break-md tbody tr td:nth-child(1) {
    position: relative;
    background: linear-gradient(
      90deg,
      var(--purple-sb-70) 0%,
      var(--bluelight-sb-70) 100%
    );
    border-bottom: unset;
    border-radius: 15px 15px 0px 0px;
    width: 100%;
    top: 0;
    left: 0;
  }
  .TablaDinamica.break-md table {
    border-collapse: collapse;
    border-spacing: 0;
    box-shadow: unset;
    border-radius: 20px;
  }
  .TablaDinamica.break-md table .DropDownTrespuntos {
    position: absolute;
    right: 10px;
    top: 0;
    color: var(--babyBlue);
  }
  .TablaDinamica.break-md table .DropDownTrespuntos .icon {
    fill: var(--babyBlue);
  }
  .TablaDinamica.break-md table .dropstart .dropdown-toggle::before {
    color: var(--babyBlue);
  }
}

@media (max-width: 992px) {
  .TablaDinamica table tbody tr td .conBorde::before,
  .TablaDinamica table tbody tr:hover td {
    background: unset;
    background-color: unset;
  }
  .TablaDinamica.break-lg .TablaDinamicabtn-filtrar {
    display: inline-block;
  }
  .TablaDinamica.break-lg table {
    display: block;
    position: relative;
  }
  .TablaDinamica.break-lg table thead {
    background-color: var(--blueBerry);
    border-radius: var(--border-radius-large) var(--border-radius-large) 0px 0px;
    position: relative;
    width: 100%;
    display: block;
    max-height: 0px;
    transition: max-height 0.5s ease;
  }
  .TablaDinamica.break-lg table .showHead {
    max-height: 2000px;
  }
  .TablaDinamica.break-lg table thead tr {
    display: flex;
    flex-direction: column;
    width: 100%;
    position: relative;
  }
  .TablaDinamica.break-lg table thead tr th {
    border-radius: unset;
    background: unset;
    width: 100% !important;
    position: relative;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    border: unset;
  }
  .TablaDinamica.break-lg table thead tr::after {
    display: none;
  }
  .TablaDinamica.break-lg .TablaDinamica_nombreCampo {
    font-family: "MonserratSemiBold";
    font-size: 0.8rem;
  }
  .TablaDinamica.break-lg table thead .TablaDinamica_contenedorFiltro {
    width: 60%;
    display: flex;
    justify-content: end;
    padding: 0 15px;
    background: unset;
  }
  .TablaDinamica.break-lg table thead .TablaDinamica_contenedorFiltro::before {
    display: none;
  }
  .TablaDinamica.break-lg .tablaDinamica-filtro-content select {
    min-width: 200px;
  }
  .TablaDinamica.break-lg .tablaDinamica-filtro-content input {
    width: 100%;
  }
  .TablaDinamica.break-lg .TablaDinamica_iconEditor_container {
    top: 5px;
  }
  .TablaDinamica.break-lg .TablaDinamica_iconEditor {
    background-color: var(--blueBerry);
    border-radius: 50%;
    z-index: 10;
    box-shadow: rgba(50, 50, 93, 0.25) 0px 6px 12px -2px,
      rgba(0, 0, 0, 0.3) 0px 3px 7px -3px;
  }
  .TablaDinamica.break-lg tbody {
    display: flex;
    width: 100%;
    position: relative;
    flex-wrap: wrap;
    justify-content: center;
  }
  .TablaDinamica.break-lg tbody tr {
    display: flex;
    flex-direction: column;
    width: 100%;
    position: relative;
    margin: 10px;
    padding: 0px !important;
    border-radius: 20px;
    border: unset;
    box-shadow: rgba(0, 0, 0, 0.16) 0px 3px 6px, rgba(0, 0, 0, 0.23) 0px 3px 6px;
  }
  .TablaDinamica.break-lg tbody tr td {
    background-color: unset;
    border-right: unset !important;
    border-bottom: unset !important;
    width: calc(100% - 20px);
    min-height: 30px;
    font-size: 12px;
    padding: 10px;
  }
  .TablaDinamica.break-lg table tbody tr .td-titulo {
    display: inline-block;
    background: var(--blueBerryPastel);
    width: 30%;
    min-width: 100px;
    text-align: end;
    padding: 0 10px 0px 5px;
    margin: 0 5px 0px 0px;
  }
  .TablaDinamica.break-lg tbody tr td .conBorde {
    border-bottom: solid 1px var(--blueBerryPastel);
  }
  .TablaDinamica.break-lg tbody tr td:nth-child(1) .td-titulo,
  .TablaDinamica.break-lg tbody tr td:nth-child(1) .conBorde {
    background: unset !important;
    border-bottom: unset;
    width: auto;
    font-size: 1rem;
    color: var(--babyBlue);
    margin: 0;
    padding: 0;
    font-family: "MonserratSemiBoldItalic";
  }
  .TablaDinamica.break-lg tbody tr td:nth-child(1) {
    position: relative;
    background: linear-gradient(
      90deg,
      var(--purple-sb-70) 0%,
      var(--bluelight-sb-70) 100%
    );
    border-bottom: unset;
    border-radius: 15px 15px 0px 0px;
    width: 100%;
    top: 0;
    left: 0;
  }
  .TablaDinamica.break-lg table {
    border-collapse: collapse;
    border-spacing: 0;
    box-shadow: unset;
    border-radius: 20px;
  }
  .TablaDinamica.break-lg table .DropDownTrespuntos {
    position: absolute;
    right: 10px;
    top: 0;
    color: var(--babyBlue);
  }
  .TablaDinamica.break-lg table .DropDownTrespuntos .icon {
    fill: var(--babyBlue);
  }
  .TablaDinamica.break-lg table .dropstart .dropdown-toggle::before {
    color: var(--babyBlue);
  }
}
</style>
