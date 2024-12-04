<template>
  <div class="d-flex justify-content-end mb-2">
    <IconBoton
      width_icon="13px"
      iconName="TRASH.svg"
      @click="ventanaEliminarProveedor = true"
      >Eliminar</IconBoton
    >
  </div>
  <div class="row mb-2">
    <div class="col-4">
      <label class="form-label">Nombre: </label>
      <input
        type="text"
        class="form-control input-formulario"
        v-model="nombreProveedor"
      />
    </div>
    <div class="col-4">
      <label class="form-label">Costo: </label>
      <input
        type="text"
        class="form-control input-formulario"
        v-model="costo"
      />
    </div>
    <div class="col-4">
      <label class="form-label">Duracion en horas: </label>
      <input
        type="text"
        class="form-control input-formulario"
        v-model="duracionHoras"
      />
    </div>
  </div>
  <div class="row mb-2">
    <div class="col-12">
      <label class="form-label">Objetivo del curso: </label>
      <textarea
        class="form-control input-formulario-textarea"
        placeholder="Objetivo del curso"
        v-model="objetivo"
      ></textarea>
    </div>
  </div>
  <div class="row mb-2">
    <div class="col-12">
      <label class="form-label">Temario del curso: </label>
      <textarea
        class="form-control input-formulario-textarea"
        placeholder="Temario del curso"
        v-model="temarioCurso"
      ></textarea>
    </div>
  </div>
  <div class="d-flex justify-content-center mb-2">
    <IconBoton
      width_icon="13px"
      iconName="UCT_Kanban/actualizar.svg"
      @click="actualizarProveedor"
      >Actualizar Proveedor</IconBoton
    >
  </div>
  <LoadingUCT
    :blockFullScreem="true"
    class="position-fixed top-0 start-0"
    v-if="cargandoBloqueo"
  />
  <PopupSolid
    :visible="ventanaEliminarProveedor"
    size="small"
    @update:visible="ventanaEliminarProveedor = $event"
    :confirm="true"
    :confirmFunction="eliminarProveedor"
    titulo="Confirmar eliminar proveedor"
  >
    ¿Estas seguro de eliminar el proveedor "{{ nombreProveedor }}"?
  </PopupSolid>
</template>

<script>
import { defineComponent, ref } from "vue";
import IconBoton from "@/components/ButtonWithIcon/ButtonPrimary.vue";
import LoadingUCT from "@/components/Loading/Loading.vue";
import PopupSolid from "@/components/Modal/ModalSolid.vue";
import { useStore } from "vuex";

export default defineComponent({
  components: {
    IconBoton,
    LoadingUCT,
    PopupSolid,
  },
  props: {
    proveedor: {
      type: Object,
      required: true,
    },
  },
  emits: ["actualizar-proveedor", "eliminar-proveedor"],
  setup(props, { emit }) {
    const store = useStore();
    const idDNCExterno = ref(props.proveedor.id_dnc_externo || 0);
    const nombreProveedor = ref(props.proveedor.nombre_proveedor || "");
    const costo = ref(props.proveedor.costo || 0);
    const duracionHoras = ref(props.proveedor.duracion_curso || 0);
    const objetivo = ref(props.proveedor.objetivo_curso || "");
    const temarioCurso = ref(props.proveedor.temario_curso || "");
    const idDnc = ref(props.proveedor.id_dnc_fk || 0);
    const ventanaEliminarProveedor = ref(false);
    const cargandoBloqueo = ref(false);

    const actualizarProveedor = async () => {
      cargandoBloqueo.value = true;
      let proveedorActualizado = {
        id_dnc_externo: idDNCExterno.value,
        costo: costo.value,
        objetivo_curso: objetivo.value,
        temario_curso: temarioCurso.value,
        duracion_curso: duracionHoras.value,
        nombre_proveedor: nombreProveedor.value,
        id_dnc_fk: idDnc.value,
      };
      await store.dispatch("ADMCapacitacion/actualizarProveedor", {
        proveedorActualizado: proveedorActualizado,
        token: store.state.user.token,
      });
      cargandoBloqueo.value = false;
      emit("actualizar-proveedor");
    };

    const eliminarProveedor = async () => {
      ventanaEliminarProveedor.value = false;
      cargandoBloqueo.value = true;
      let proveedorEliminado = {
        id_dnc_externo: idDNCExterno.value,
        id_dnc_fk: idDnc.value,
      };
      await store.dispatch("ADMCapacitacion/eliminarProveedor", {
        proveedorEliminado: proveedorEliminado,
        token: store.state.user.token,
      });
      cargandoBloqueo.value = false;
      emit("eliminar-proveedor", idDNCExterno.value);
    };

    return {
      idDNCExterno,
      costo,
      objetivo,
      temarioCurso,
      duracionHoras,
      nombreProveedor,
      actualizarProveedor,
      eliminarProveedor,
      cargandoBloqueo,
      ventanaEliminarProveedor,
    };
  },
});
</script>

<style scoped>
.input-formulario {
  border: none;
  border-bottom: 2px solid var(--purple-sb-70);
  background: transparent;
}

.input-formulario-textarea {
  border-color: var(--blueBerry);
}
</style>
