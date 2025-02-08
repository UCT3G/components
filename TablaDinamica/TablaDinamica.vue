<template>
  <div :class="ClasesTablaDinamica" :id="tabla_nombre">
    <div class="TablaDinamicabtn-filtrar">
      <BotonIconoPrimary
        width_icon="13px"
        iconName="FILTRAR.svg"
        @click="mostrarFiltros = !mostrarFiltros"
        >Filtros</BotonIconoPrimary
      >
    </div>

    <DynamicSvgLoader
      class="TablaDinamica_iconEditor"
      title="vista edicion"
      @click="turnOnEditable"
      fileName="icons/UCT_ADMIN/COMPETENCIAS-13"
      width_icon="20px"
      :icon_active="true"
    ></DynamicSvgLoader>
    <table class="table table-light" v-if="json">
      <TablaHead
        :json="json"
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
        @button_evento="button_evento_hijo"
        @turnOnFormularioCRUD="ShowFormularioCRUD"
        @fila_click="handleFilaClick"
        :Indicadores="Indicadores"
      ></TablaBody>
    </table>
    <TablaFooter :json="json" @cambiarPagina="CambiarPagina"></TablaFooter>
  </div>

  <PopUpSolido
    :visible="visible_editor_tabla"
    @update:visible="visible_editor_tabla = $event"
    size="large"
    titulo="Tabla Dinámica Propiedades"
    ref="modalEditar"
    :fullScreenHeight="false"
  >
    <TablaDinamicaEditor 
      :tabla_nombre="tabla_nombre"
      :tablaBase="tablaBase"
      @CerrarEditor = "CerrarEditor"
    ></TablaDinamicaEditor>
  </PopUpSolido>

  <PopUpSolido
    :visible="visibleFormCRUD"
    size="large"
    @update:visible="cerrarFormCrud"
    titulo="Modifica la información"
    :fullScreenHeight="false"
  >
    <div v-if="formularioBaseFilas != null">
      <FormD_CapaTablaDinamica
        :urls="url_formulario"
        :formularioBase="formularioBaseFilas"
        :inputs_catalogo="inputs_catalogoSistema"
        :idGenerales="idGenerales"
        :descargaData="descargaData"
        @submitSuccess="formularioBaseFilasSuccess"
      ></FormD_CapaTablaDinamica>
    </div>
  </PopUpSolido>
</template>

<script>
import { defineComponent, ref, onMounted, watch, toRefs, computed, onUnmounted } from "vue";
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
    // FormD_CapaTablaDinamica,
    TablaFooter,
    BotonIconoPrimary,
  },
  props: {
    tabla_nombre: {
      type: String,
      default: null,
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
      default: false
    }
  },
  emits: [
    "button_evento",
    "update:consultar_registros",
    "finalizarRenderBody",
    "visibleFormCRUD",
    "TBDestruida",
  ],
  setup(props, { emit }) {
    const visibleFormCRUD = ref(false);
    const visible_editor_tabla = ref(false);
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

    const ClasesTablaDinamica = computed(() => {
      switch (props.breakpoint) {
        case "sm":
          return "TablaDinamica col-12 break-sm";
        case "md":
          return "TablaDinamica col-12 break-md";
        case "lg":
          return "TablaDinamica col-12 break-lg";
        case "unset":
          return "TablaDinamica col-12";
        default:
          return "TablaDinamica col-12 break-movil";
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

    onMounted(async () => {
      if (consultar_registros.value) {
        filtrar();
      }
      cargarFormularioBase();
    });

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
        json.value.registros_filtrados =
          res.data.data_table.registros_filtrados;
        json.value.filas = res.data.data_table.json_actualizado.filas;
        console.log("AQUIIII SE RECUPERAN LOS DATOS");
        console.log(json.value);
        cargando.value = false; // Actualiza el estado cuando los datos están cargados
        //console.log(data_table.value);
        emit("finalizarRenderBody");
      } catch (error) {
        console.error("Ocurrió un error en filtrar:", error);
        // Manejar el error adecuadamente aquí
        cargando.value = false; // Asegurarse de que la indicación de carga se detenga en caso de error
        alert("Error al filtrar los datos. Por favor, inténtelo de nuevo.");
      }
    };

    watch(consultar_registros, (newValue) => {
      //Cuando cambia el valor de consultar_registros, se ejecuta la función filtrar
      if (newValue === true) {
        filtrar();
        emit("update:consultar_registros", false);
      }
    });

    watch(
      () => json.value.columnas.map((columna) => columna.valor),
      (nuevosValores, viejosValores) => {
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
        immediate: false, // Si deseas que se ejecute inmediatamente después del montaje, cambia a true
      }
    );

    watch(
      () => json.value.columnas.map((columna) => columna.bOrder),
      (nuevosValores, viejosValores) => {
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
        immediate: false, // Si deseas que se ejecute inmediatamente después del montaje, cambia a true
      }
    );

    watch(
      () => json.value.fin,
      () => {
        //filtrar();
      },
      {
        deep: true, // Importante para observar cambios dentro de objetos/arrays
        immediate: false, // Si deseas que se ejecute inmediatamente después del montaje, cambia a true
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
    }

    const handleFilaClick = ({ fila, index }) => {
      console.log("Fila seleccionada:", fila, "Índice:", index);
      // Puedes emitir el evento hacia el padre o realizar alguna acción
      emit("filaSeleccionada", { fila, index });
    };
    onUnmounted(() => {
      if (!store.getters['reporteador/getTablaPorNombre'](props.tabla_nombre)){
        return;
      }
      // Limpiar todas las propiedades valor de json.value.columnas.valor
      json.value.columnas.forEach((columna) => {
        columna.valor = "";
      });
      store.getters['reporteador/getTablaPorNombre'](props.tabla_nombre).json_tabla = JSON.stringify(json.value);
      
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
      handleFilaClick
    };
  },
});
</script>

<style>
:root {
  --border-radius-small: 15px;
  --border-radius-large: 15px;
}

.TablaDinamica {
  position: relative;
  
}
.TablaDinamica .TablaDinamicabtn-filtrar {
  display: none;
}
.TablaDinamica_iconEditor {
  position: absolute;
  right: 0;
  top: 50px;
  z-index: 10;
  cursor: pointer;
  fill: var(--babyBlue);
  background-color: var(--blueBerryPastel);
  border-radius: 50%;
}
.TablaDinamica table {
  border-collapse: collapse;
  border-spacing: 0; /* Esto es equivalente a cellspacing="0" en HTML */
  box-shadow: rgba(0, 0, 0, 0.16) 0px 3px 6px, rgba(0, 0, 0, 0.23) 0px 3px 6px;
  border-radius: var(--border-radius-large);
}
.TablaDinamica table thead {
  overflow: hidden;
  position: relative;
  z-index: 0; /* Base z-index para asegurar contexto */
}
.TablaDinamica table thead tr th {
  position: relative;
  z-index: 3;
  background-color: unset;
  color: var(--babyBlue);
  font-family: "MonserratBoldItalic";
  padding: 0;
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
  margin: 5px 16px;
  text-align: center;
  font-size: 14px;
  margin-top: 8px;
  height: 30px;
  overflow-y: hidden;
  padding: 5px 0px;
}
.TablaDinamica table thead tr::after {
  content: "";
  width: 100%;
  height: 35px;
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
  min-height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.TablaDinamica .TablaDinamica_contenedorFiltro .TablaDinamica_orderable div,
.TablaDinamica .TablaDinamica_contenedorFiltro .TablaDinamica_iconfiltro div {
  background-color: white;
  z-index: 3;
  width: 24px;
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 38px;
  margin-left: 15px;
  border-radius: 10px 0px 0px 10px;
}
.TablaDinamica .TablaDinamica_contenedorFiltro .TablaDinamica_orderable svg,
.TablaDinamica .TablaDinamica_contenedorFiltro .TablaDinamica_iconfiltro svg {
  fill: var(--black);
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
  height: 38px;
  border-radius: 0px 10px 10px 0px;
  padding: 0 10px;
  margin: 5px 0;
  font-size: 14px;
  color: var(--black);
  border: unset;
}

.TablaDinamica table thead .TablaDinamica_contenedorFiltro::before {
  content: "";
  width: 100%;
  height: 60px;
  position: absolute;
  left: 0;
  bottom: 0;
  color: var(--babyBlue);
  z-index: 2;
  background-color: var(--blueBerryPastel);
}

.TablaDinamica .TablaDinamica_orderable {
  min-height: 24px;
}

.TablaDinamica table tbody tr td {
  padding: 0px 5px;
  border: unset;
  font-size: 13px;
  /*color: var(--black);*/
  font-family: "MonserratSemiBold";
  border-right: 4px solid var(--blueBerry);
  border-bottom: 2px solid var(--blueBerryPastel);  
  
}

.TablaDinamica table tbody tr td .conBorde {/* Neblina en la parte inferior de la celda */
    min-height: 35px;
    max-height: 50px;
    display: flex;
    align-items: start;
    overflow: hidden;
    position: relative;
    height: 50px;
    padding: 10px 0px 0px 0px;   
    position: relative;
  } 

  .TablaDinamica table tbody tr td .conBordeCentrado {
    min-height: 35px;
    max-height: 50px;
    display: flex;
    align-items: center; /* Centrar verticalmente */
    justify-content: center; /* Centrar horizontalmente */
    overflow: hidden;
    position: relative;
    height: 50px;
    padding: 10px 0px 0px 0px;   
    position: relative;
}

  .TablaDinamica table tbody tr td .conBorde::before {
    content: "";/* Neblina en la parte inferior de la celda */
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 20px; /* Altura de la neblina */
    background: linear-gradient(to bottom, rgba(255, 255, 255, 0) 0%, var(--babyBlue) 100%);
    pointer-events: none;
  }

  .TablaDinamica table tbody tr td .conBorde.controles{
    /* Sobrescribe los estilos o deja vacío para que no se apliquen */
    all: unset; /* Esto desactiva cualquier estilo que se haya aplicado */
  }

  .TablaDinamica table tbody tr:hover td {
    background: linear-gradient(to bottom, var(--babyBlue) 0%, var(--blueBerryPastel) 70%, rgba(255, 255, 255, 0.3) 100%);
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

.TablaDinamicaFooter{
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
  background-color: var(--purple-sb);
  color: var(--babyBlue);
  border: unset;
  /*border-radius: 10px;*/
  background-image: linear-gradient(
    90deg,
    var(--purple-sb-70) 0%,
    var(--bluelight-sb-70) 100%
  );
}
.TablaDinamica .TablaDinamicaFooter_pagination nav .pagination li a {
  background-color: unset;
  color: var(--babyBlue);
  font-family: "MonserratSemiBold";
}

/*estilos de a¿la tabla que aplican de 768px hacia abajo */
@media (max-width: 576px) {
  .TablaDinamica table tbody tr td .conBorde::before 
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
    max-height: 2000px; /* ajustar según sea necesario */
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
  .TablaDinamica.break-sm .TablaDinamica_iconEditor {
    background-color: var(--blueBerry);
    border-radius: 50%;
    top: 5px;
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
    width: 100%;/**Ancho de la fila */
    position: relative;
    margin: 10px;
    padding: 0px !important;
    border-radius: 20px;
    border: unset;
    box-shadow: rgba(0, 0, 0, 0.16) 0px 3px 6px, rgba(0, 0, 0, 0.23) 0px 3px 6px;
  }
   /**Cancelar Hover en tr */
  /* .TablaDinamica.break-sm tbody tr:hover {
    background: unset;
    background-color: unset;
  } */

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
    width: 30%;/**Ancho de la columna Titulo*/
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
    border-spacing: 0; /* Equivalente a cellspacing="0" en HTML */
    box-shadow: unset;
    border-radius: 20px;
  }

  /**SOLO PARA DropDownTrespuntos */
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
    max-height: 2000px; /* ajustar según sea necesario */
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
  .TablaDinamica.break-md .TablaDinamica_iconEditor {
    background-color: var(--blueBerry);
    border-radius: 50%;
    top: 5px;
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
    width: 100%;/**Ancho de la fila */
    position: relative;
    margin: 10px;
    padding: 0px !important;
    border-radius: 20px;
    border: unset;
    box-shadow: rgba(0, 0, 0, 0.16) 0px 3px 6px, rgba(0, 0, 0, 0.23) 0px 3px 6px;
  }

  /**Cancelar Hover en tr */
  /* .TablaDinamica.break-md tbody tr:hover {
    background: unset;
    background-color: unset;
  } */

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
    width: 30%;/**Ancho de la columna Titulo*/
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
    border-spacing: 0; /* Esto es equivalente a cellspacing="0" en HTML */
    box-shadow: unset;
    border-radius: 20px;
  }
  /**SOLO PARA DropDownTrespuntos */
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
  .TablaDinamica table tbody tr:hover td{
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
    max-height: 2000px; /* o un valor adecuado */
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

  .TablaDinamica.break-lg .TablaDinamica_iconEditor {
    background-color: var(--blueBerry);
    border-radius: 50%;
    top: 5px;
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
    width: 100%;/**Ancho de la fila */
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
    width: 30%;/**Ancho de la columna Titulo*/
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
  }
  .TablaDinamica.break-lg tbody tr td:nth-child(1) {
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
    border-spacing: 0; /* Esto es equivalente a cellspacing="0" en HTML */
    box-shadow: unset;
    border-radius: 20px;
  }

  /**SOLO PARA DropDownTrespuntos */
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
