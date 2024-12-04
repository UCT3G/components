<template>
  <div class="p-3">
    <div class="row mb-2 d-flex align-items-center justify-content-center">
      <div class="col-10">
        <input type="text" class="form-control input-formulario text-center fs-6" v-model="nombreDNC" />
      </div>
      <div class="col-2">
        <IconBoton width_icon="13px" iconName="recurso-file.svg" @click="imprimirPDF">Imprimir
        </IconBoton>
      </div>
    </div>
    <div class="row mb-2">
      <div class="col-12 d-flex align-items-center justify-content-center">
        <h6 class="fw-bolder">DATOS DEL OBSERVADOR</h6>
      </div>
    </div>
    <div class="row mb-2">
      <label class="form-label col-3 label-formulario">Nombre del observador:
      </label>
      <div class="col-9">
        <input type="text" class="form-control input-formulario" v-model="nombreObservador" disabled="true" />
      </div>
    </div>
    <div class="row mb-2">
      <label class="form-label col-2 label-formulario">Correo: </label>
      <div class="col-10">
        <input type="text" class="form-control input-formulario" v-model="correoObservador" disabled="true" />
      </div>
    </div>
    <div class="row mb-2">
      <label class="form-label col-2 label-formulario">Área: </label>
      <div class="col-4">
        <input type="text" class="form-control input-formulario" v-model="claveArea" disabled="true" />
      </div>
      <label class="form-label col-2 label-formulario">Departamento: </label>
      <div class="col-4">
        <input type="text" class="form-control input-formulario" v-model="claveDepartamento" disabled="true" />
      </div>
    </div>
    <div class="row mb-2">
      <label class="form-label col-2 label-formulario">Puesto: </label>
      <div class="col-4">
        <input type="text" class="form-control input-formulario" v-model="nombrePuesto" disabled="true" />
      </div>
      <label class="form-label col-2 label-formulario">Sucursal: </label>
      <div class="col-4">
        <input type="text" class="form-control input-formulario" @click="mostrarSucursalTitular" v-model="sucursal" />
      </div>
    </div>
    <div class="row mb-2">
      <label class="form-label col-2 label-formulario">Fecha: </label>
      <div class="col-4">
        <input type="text" class="form-control input-formulario" v-model="fechaCreacion" disabled="true" />
      </div>
      <label class="form-label col-2 label-formulario">Extension: </label>
      <div class="col-4">
        <input type="text" class="form-control input-formulario" v-model="extension" />
      </div>
    </div>
    <div class="d-flex justify-content-center mb-2">
      <IconBoton width_icon="13px" iconName="UCT_Kanban/actualizar.svg" @click="actualizarDNC">Actualizar DNC
      </IconBoton>
    </div>
    <div class="row">
      <div class="col-12 d-flex align-items-center justify-content-center">
        <h6 class="fw-bolder">Necesidades detectadas</h6>
      </div>
    </div>
    <div class="row">
      <div class="col-11">
        <div v-if="dnc.necesidades">
          <button v-for="(necesidad, index) in dnc.necesidades" :key="necesidad.id_necesidad"
            class="btn btn-primary m-1" @click="seleccionarNecesidad(necesidad)" :disabled="necesidadSeleccionada.id_necesidad === necesidad.id_necesidad
              ">
            Necesidad {{ index + 1 }}
          </button>
        </div>
      </div>
      <div class="col-1">
        <div class="d-flex justify-content-end">
          <IconBoton width_icon="13px" iconName="AGREGAR-24.svg" @click="ventanaAgregarNecesidad = true">Agregar
          </IconBoton>
        </div>
      </div>
    </div>
    <DNC_Necesidad_Formulario v-if="necesidadSeleccionada.id_necesidad" :necesidad="necesidadSeleccionada"
      :key="necesidadSeleccionada.id_necesidad" @actualizar-necesidad="onActualizarNecesidad"
      @eliminar-necesidad="onEliminarNecesidad" />
    <div class="row my-2">
      <div class="col-12">
        <div class="label-container mb-2">
          <p class="label-title">
            ATENCIÓN: La siguiente sección solo deberá ser llenada si la
            necesidad antes mencionada NO PUEDE SER CUBIERTA DE MANERA INTERNA,
            por lo que se debe recurrir a cotizar con un externo. Es de suma
            importancia justificar dicha inversión si este es el caso.
          </p>
          <p class="label-description">
            Si ya cuenta con un curso sugerido, favor de enlistar al menos dos
            proveedores en los campo siguientes. Justifique debajo el por qué
            este curso debe ser impartido por un proveedor externo y no de
            manera interna:
          </p>
        </div>
        <textarea class="form-control input-formulario-textarea" v-model="justificacion" placeholder="Justificación..."
          @change="guardarJustificacion"></textarea>
      </div>
    </div>
    <div class="row my-2">
      <div class="col-12 d-flex align-items-center justify-content-center">
        <h6 class="fw-bolder">Proveedores externos</h6>
      </div>
    </div>
    <div class="row">
      <div class="col-11">
        <div v-if="dnc.proveedores">
          <button v-for="(proveedor, index) in dnc.proveedores" :key="proveedor.id_dnc_externo"
            class="btn btn-primary m-1" @click="seleccionarProveedor(proveedor)" :disabled="proveedorSeleccionado.id_dnc_externo === proveedor.id_dnc_externo
              ">
            Proveedor {{ index + 1 }}
          </button>
        </div>
      </div>
      <div class="col-1">
        <div class="d-flex justify-content-end">
          <IconBoton width_icon="13px" iconName="AGREGAR-24.svg" @click="ventanaAgregarProveedor = true">Agregar
          </IconBoton>
        </div>
      </div>
    </div>
    <hr />
    <DNC_Proveedor_Formulario v-if="proveedorSeleccionado.id_dnc_externo" :proveedor="proveedorSeleccionado"
      :key="proveedorSeleccionado.id_dnc_externo" @actualizar-proveedor="onActualizarProveedor"
      @eliminar-proveedor="onEliminarProveedor"></DNC_Proveedor_Formulario>
  </div>
  <PopupSolid :visible="modalSucursales" :size="'large'" @update:visible="modalSucursales = $event"
    :titulo="'Sucusales'" :fullScreenHeight="false">
    <TablaDinamica :consultar_registros="TB_SucursalTitularTH_Filtrar" :tablaBase="TB_SucursalTitularTH"
      :tabla_nombre="'TB_SucursalTitularTH'" @finalizarRenderBody="onFinalizarRenderBody_TB_SucursalTitularTH" />
    <template v-if="teleportSucursalTitularTH">
      <div>
        <template v-for="(registro, index) in TB_SucursalTitularTH.registros"
          :key="'dropdown-' + registro.id_sucursal_titular">
          <teleport :to="`#TB_SucursalTitularTH table tr:nth-child(${index + 1
            }) td:nth-child(5) div`">
            <div v-for="coordinador in registro.ignorar_coordinadores" :key="coordinador.id_usuario">
              {{ coordinador.coordinador }}
            </div>
          </teleport>
          <teleport :to="`#TB_SucursalTitularTH table tr:nth-child(${index + 1
            }) td:last-child div`">
            <DropDownTrespuntos @elementoSeleccionado="accionDropdown(registro, $event)" width_icon="34px"
              :iconName="'ellipsis-horizontal.svg'" :lista="['Seleccionar']" />
          </teleport>
        </template>
      </div>
    </template>
  </PopupSolid>
  <PopupSolid :visible="ventanaAgregarNecesidad" size="small" @update:visible="ventanaAgregarNecesidad = $event"
    :confirm="true" :confirmFunction="agregarNecesidad" titulo="Confirmar agregar necesidad">
    ¿Estas seguro de agregar una necesidad al DNC "{{ nombreDNC }}"?
  </PopupSolid>
  <PopupSolid :visible="ventanaAgregarProveedor" size="small" @update:visible="ventanaAgregarProveedor = $event"
    :confirm="true" :confirmFunction="agregarProveedor" titulo="Confirmar agregar proveedor">
    ¿Estas seguro de agregar un proveedor al DNC "{{ nombreDNC }}"?
  </PopupSolid>
  <LoadingUCT :blockFullScreem="true" class="position-fixed top-0 start-0" v-if="cargandoBloqueo" />
</template>

<script>
import {
  computed,
  defineComponent,
  nextTick,
  onMounted,
  ref,
  watch,
} from "vue";
import IconBoton from "@/components/ButtonWithIcon/ButtonPrimary.vue";
import PopupSolid from "@/components/Modal/ModalSolid.vue";
import TablaDinamica from "@/components/TablaDinamica/TablaDinamica.vue";
import DropDownTrespuntos from "@/components/ListaDesplegable/DropDownTrespuntos.vue";
import LoadingUCT from "@/components/Loading/Loading.vue";
import DNC_Necesidad_Formulario from "./DNC_Necesidad_Formulario.vue";
import DNC_Proveedor_Formulario from "./DNC_Proveedor_Formulario.vue";
import { useStore } from "vuex";
import axios from "@/../axios-config.js";

export default defineComponent({
  components: {
    IconBoton,
    PopupSolid,
    TablaDinamica,
    DropDownTrespuntos,
    LoadingUCT,
    DNC_Necesidad_Formulario,
    DNC_Proveedor_Formulario,
  },
  emits: ["actualizar-dnc"],
  setup(props, { emit }) {
    const store = useStore();
    const moduloActivo = computed(() => store.getters["user/getModuloActivo"]);
    const cargandoBloqueo = ref(false);
    const dnc = computed(() => store.getters["ADMCapacitacion/getDNC"]);
    const necesidadSeleccionada = ref(
      (dnc.value.necesidades && dnc.value.necesidades[0]) || {}
    );
    const justificacion = ref(dnc.value.justificacion || "");
    const proveedorSeleccionado = ref(
      (dnc.value.proveedores && dnc.value.proveedores[0]) || {}
    );
    const idDNC = ref(dnc.value.id_dnc || 0);
    const nombreDNC = ref(dnc.value.nombre || "");
    const nombreObservador = ref(dnc.value.nombre_observador || "");
    const correoObservador = ref(dnc.value.correo || "");
    const claveArea = ref(dnc.value.clave_empresa_area || "");
    const claveDepartamento = ref(dnc.value.clave_empresa_departamento || "");
    const nombrePuesto = ref(dnc.value.nombre_puesto || "");
    const fechaCreacion = ref(dnc.value.fecha_creacion || "");
    const modalSucursales = ref(false);
    const TB_SucursalTitularTH_Filtrar = ref(true);
    const teleportSucursalTitularTH = ref(false);
    const idSucursal = ref(dnc.value.id_sucursal_titular || "");
    const sucursal = ref(dnc.value.titulo || "");
    const extension = ref(dnc.value.extension || "");
    const ventanaAgregarNecesidad = ref(false);
    const ventanaAgregarProveedor = ref(false);
    const pdfUrl = ref(null);

    const TB_SucursalTitularTH = computed(() =>
      store.getters["reporteador/getTablaPorNombre"]("TB_SucursalTitularTH")
    );

    console.log(dnc.value);

    onMounted(async () => {
      await store.dispatch("reporteador/agregarDataReporteadorModulo", {
        modulo: moduloActivo.value.modulo_nombre,
        sistema: moduloActivo.value.sistema,
        token: store.state.user.token,
        tablas_nombres: [
          "TB_SucursalTitularTH",
          "TB_Publico_DNC",
          "TB_Oficinas_DNC",
          "TB_Areas_DNC",
          "TB_Departamentos_DNC",
          "TB_Puestos_DNC",
          "TB_Usuarios_DNC",
        ],
        formularios_nombres: [],
      });
    });

    const mostrarSucursalTitular = () => {
      modalSucursales.value = true;
    };

    const onFinalizarRenderBody_TB_SucursalTitularTH = () => {
      teleportSucursalTitularTH.value = false;
      nextTick(() => {
        if (document.getElementById("TB_SucursalTitularTH")) {
          teleportSucursalTitularTH.value = true;
        }
      });
      TB_SucursalTitularTH_Filtrar.value = false;
    };

    watch(modalSucursales, (newValue) => {
      if (!newValue) {
        TB_SucursalTitularTH_Filtrar.value = true;
        teleportSucursalTitularTH.value = false;
      }
    });

    const accionDropdown = (registro, { nombre }) => {
      switch (nombre) {
        case "Seleccionar":
          idSucursal.value = registro.ignorar_id_sucursal_titular;
          sucursal.value = registro.sucursal;
          modalSucursales.value = false;
          break;
      }
    };

    const actualizarDNC = async () => {
      cargandoBloqueo.value = true;
      let DNCActualizado = {
        id_dnc: idDNC.value,
        nombre: nombreDNC.value,
        id_sucursal_fk: idSucursal.value,
        sucursal: sucursal.value,
        extension: extension.value,
      };
      await store.dispatch("ADMCapacitacion/actualizarDNC", {
        DNCActualizado: DNCActualizado,
        token: store.state.user.token,
      });
      emit("actualizar-dnc");
      cargandoBloqueo.value = false;
    };

    const seleccionarNecesidad = (necesidad) => {
      necesidadSeleccionada.value = necesidad;
    };

    const agregarNecesidad = async () => {
      ventanaAgregarNecesidad.value = false;
      cargandoBloqueo.value = true;
      let nuevaNecesidad = {
        id_dnc: idDNC.value,
      };
      await store.dispatch("ADMCapacitacion/agregarNecesidad", {
        nuevaNecesidad: nuevaNecesidad,
        token: store.state.user.token,
      });
      emit("actualizar-dnc");
      necesidadSeleccionada.value = dnc.value.necesidades[0] || {};
      cargandoBloqueo.value = false;
    };

    const onActualizarNecesidad = () => {
      emit("actualizar-dnc");
    };

    const onEliminarNecesidad = (idNecesidad) => {
      const index = dnc.value.necesidades.findIndex(
        (n) => n.id_necesidad === idNecesidad
      );
      if (index !== -1) {
        dnc.value.necesidades.splice(index, 1);
      }
      necesidadSeleccionada.value = dnc.value.necesidades[0] || {};
      emit("actualizar-dnc");
    };

    const guardarJustificacion = async () => {
      let datosJustificacion = {
        id_dnc_fk: idDNC.value,
        justificacion: justificacion.value,
      };
      await store.dispatch("ADMCapacitacion/justificacion", {
        datosJustificacion: datosJustificacion,
        token: store.state.user.token,
      });
    };

    const seleccionarProveedor = (proveedor) => {
      proveedorSeleccionado.value = proveedor;
    };

    const agregarProveedor = async () => {
      ventanaAgregarProveedor.value = false;
      cargandoBloqueo.value = true;
      let nuevoProveedor = {
        id_dnc: idDNC.value,
      };
      await store.dispatch("ADMCapacitacion/agregarProveedor", {
        nuevoProveedor: nuevoProveedor,
        token: store.state.user.token,
      });
      emit("actualizar-dnc");
      proveedorSeleccionado.value = dnc.value.proveedores[0] || {};
      cargandoBloqueo.value = false;
    };

    const onActualizarProveedor = () => {
      emit("actualizar-dnc");
    };

    const onEliminarProveedor = (idDNCExterno) => {
      const index = dnc.value.proveedores.findIndex(
        (n) => n.id_dnc_externo === idDNCExterno
      );
      if (index !== -1) {
        dnc.value.proveedores.splice(index, 1);
      }
      proveedorSeleccionado.value = dnc.value.proveedores[0] || {};
      emit("actualizar-dnc");
    };

    const imprimirPDF = async () => {
      try {
        const response = await axios.get("/DNC/generarPdf", {
          responseType: "blob",
        });
        pdfUrl.value = URL.createObjectURL(response.data);
        window.open(pdfUrl.value, "_blank");
      } catch (error) {
        console.error("Error al obtener el PDF:", error);
      }
    };

    return {
      cargandoBloqueo,
      dnc,
      idDNC,
      nombreDNC,
      nombreObservador,
      correoObservador,
      claveArea,
      claveDepartamento,
      nombrePuesto,
      fechaCreacion,
      mostrarSucursalTitular,
      modalSucursales,
      TB_SucursalTitularTH,
      TB_SucursalTitularTH_Filtrar,
      onFinalizarRenderBody_TB_SucursalTitularTH,
      teleportSucursalTitularTH,
      accionDropdown,
      sucursal,
      extension,
      necesidadSeleccionada,
      seleccionarNecesidad,
      justificacion,
      seleccionarProveedor,
      proveedorSeleccionado,
      actualizarDNC,
      agregarNecesidad,
      onActualizarNecesidad,
      onEliminarNecesidad,
      ventanaAgregarNecesidad,
      guardarJustificacion,
      onActualizarProveedor,
      onEliminarProveedor,
      ventanaAgregarProveedor,
      agregarProveedor,
      imprimirPDF
    };
  },
});
</script>

<style scoped>
.label-formulario {
  font-size: 14px;
  color: var(--card-title-color);
  padding: 0;
  margin: 0;
  display: flex;
  align-items: center;
}

.input-formulario {
  border: none;
  border-bottom: 2px solid var(--purple-sb-70);
  background: transparent;
  padding: 0 5px;
  font-size: 12px;
}

hr {
  height: 2px;
  background-color: black;
  margin-bottom: 0;
}

.label-container {
  background-color: var(--blueBerry);
  padding: 10px;
  border-radius: 5px;
  text-align: center;
}

.label-title {
  font-weight: bold;
  margin: 0;
  font-size: 14px;
  color: var(--black);
}

.label-description {
  font-size: 13px;
  margin: 0;
  color: var(--bs-gray);
}

.input-formulario-textarea {
  border-color: var(--blueBerry);
}
</style>
