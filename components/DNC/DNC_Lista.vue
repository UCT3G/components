<template>
  <NavBarPaginasUCT>
    <template #elementos_opcionales>
      <IconBoton width_icon="13px" :iconName="'AGREGAR-24.svg'" @click="abrirDNC = true">Agregar DNC</IconBoton>
    </template>
  </NavBarPaginasUCT>
  <div v-if="cargandoDNC" class="p-3">
    <TablaCargando />
  </div>
  <div v-else class="p-3">
    <TablaDinamica :consultar_registros="TB_DNC_Filtrar" :tablaBase="TB_DNC" :tabla_nombre="'TB_DNC'"
      @finalizarRenderBody="onFinalizarRenderBody_TB_DNC" />
    <template v-if="teleportDNC">
      <div>
        <template v-for="(registro, index) in TB_DNC.registros" :key="'dropdown-' + registro.id">
          <teleport :to="`#TB_DNC table tr:nth-child(${index + 1}) td:last-child div`">
            <DropDownTrespuntos @elementoSeleccionado="accionDropdown(registro, $event)" width_icon="34px"
              :iconName="'ellipsis-horizontal.svg'" :lista="['Editar']" />
          </teleport>
        </template>
      </div>
    </template>
  </div>
  <PopupSolid :visible="modalDNC" :size="'medium'" @update:visible="modalDNC = $event"
    titulo="DETECCIÓN DE NECESIDADES DE CAPACITACIÓN">
    <DNC_Formulario @actualizar-dnc="onActualizarDnc"></DNC_Formulario>
  </PopupSolid>
  <PopupSolid :visible="abrirDNC" :size="'small'" @update:visible="abrirDNC = $event" titulo="Agregar DNC">
    <DNC @cerrar-agregar-dnc="onCerrarAgregarDNC" @cerrar-cancelar-dnc="onCerrarCancelarDNC"></DNC>
  </PopupSolid>
</template>

<script>
import { computed, defineComponent, nextTick, onMounted, ref } from "vue";
import NavBarPaginasUCT from "@/components/NavBar/NavBarPaginasUCT.vue";
import IconBoton from "@/components/ButtonWithIcon/ButtonPrimary.vue";
import TablaDinamica from "@/components/TablaDinamica/TablaDinamica.vue";
import DropDownTrespuntos from "@/components/ListaDesplegable/DropDownTrespuntos.vue";
import PopupSolid from "@/components/Modal/ModalSolid.vue";
import TablaCargando from "@/components/TablaDinamica/TablaLoader.vue";
import DNC from "./DNC.vue";
import DNC_Formulario from "./DNC_Formulario.vue";
import { useStore } from "vuex";

export default defineComponent({
  components: {
    NavBarPaginasUCT,
    IconBoton,
    TablaDinamica,
    DropDownTrespuntos,
    PopupSolid,
    DNC,
    DNC_Formulario,
    TablaCargando,
  },
  setup() {
    const store = useStore();
    const moduloActivo = computed(() => store.getters["user/getModuloActivo"]);
    const TB_DNC_Filtrar = ref(true);
    const cargandoDNC = ref(true);
    const teleportDNC = ref(false);
    const modalDNC = ref(false);
    const abrirDNC = ref(false);

    const TB_DNC = computed(() =>
      store.getters["reporteador/getTablaPorNombre"]("TB_DNC")
    );

    onMounted(async () => {
      await store.dispatch("reporteador/agregarDataReporteadorModulo", {
        modulo: moduloActivo.value.modulo_nombre,
        sistema: moduloActivo.value.sistema,
        token: store.state.user.token,
        tablas_nombres: ["TB_DNC"],
        formularios_nombres: [],
      }).then(() => {
        cargandoDNC.value = false;
        let jsonTabla = JSON.parse(TB_DNC.value.json_tabla);
        jsonTabla.data = [store.state.user.userProfile.id_usuario];
        TB_DNC.value.json_tabla = JSON.stringify(jsonTabla);
      });
    });

    const onFinalizarRenderBody_TB_DNC = () => {
      teleportDNC.value = false;
      nextTick(() => {
        if (document.getElementById("TB_DNC")) {
          teleportDNC.value = true;
          TB_DNC_Filtrar.value = false;
        }
      });
    }; 

    const accionDropdown = (registro, { nombre }) => {
      switch (nombre) {
        case "Editar": {
          console.log(registro);
          const dnc = {
            id_dnc: registro.ignorar_id_dnc,
            nombre: registro.dnc,
            id_observador: registro.ignorar_id_observador,
            nombre_observador: registro.observador,
            correo: registro.ignorar_correo,
            fecha_creacion: registro.fecha_creacion,
            estado: registro.estado,
            extension: registro.ignorar_extension,
            id_competencia_fk: registro.ignorar_id_competencia_fk,
            id_estrategia_fk: registro.ignorar_id_estrategia_fk,
            id_sucursal_titular: registro.ignorar_id_sucursal_titular,
            titulo: registro.ignorar_titulo,
            id_puesto: registro.ignorar_id_puesto,
            nombre_puesto: registro.ignorar_nombre_puesto,
            id_departamento: registro.ignorar_id_departamento,
            nombre_departamento: registro.ignorar_nombre_departamento,
            clave_empresa_departamento: registro.ignorar_clave_empresa_departamento,
            id_area: registro.ignorar_id_area,
            nombre_area: registro.ignorar_nombre_area,
            clave_empresa_area: registro.ignorar_clave_empresa_area,
            necesidades: registro.ignorar_necesidades,
            id_dnc_justificacion: registro.ignorar_id_dnc_justificacion,
            justificacion: registro.ignorar_justificacion,
            proveedores: registro.ignorar_proveedores,
          };
          store.commit("ADMCapacitacion/ADD_DNC", dnc);
          modalDNC.value = true;
          break;
        }
        default:
          break;
      }
    };

    const onCerrarAgregarDNC = () => {
      abrirDNC.value = false;
      modalDNC.value = true;
      TB_DNC_Filtrar.value = true;
    };

    const onCerrarCancelarDNC = () => {
      abrirDNC.value = false;
    };

    const onActualizarDnc = () => {
      TB_DNC_Filtrar.value = true;
    };

    return {
      TB_DNC,
      TB_DNC_Filtrar,
      onFinalizarRenderBody_TB_DNC,
      teleportDNC,
      accionDropdown,
      modalDNC,
      cargandoDNC,
      abrirDNC,
      onCerrarAgregarDNC,
      onCerrarCancelarDNC,
      onActualizarDnc,
    };
  },
});
</script>

<style scoped></style>
