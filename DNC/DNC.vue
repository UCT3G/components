<template>
  <div class="p-3">
    <div class="row mb-2">
      <div class="col-12">
        <label>Nombre del DNC: </label>
        <input
          type="text"
          class="form-control input-formulario"
          v-model="nombreDNC"
        />
      </div>
    </div>
    <div class="d-flex justify-content-center">
      <button class="btn btn-primary m-1" @click="guardarDNC">Guardar</button>
      <button class="btn btn-secondary m-1" @click="cancelarDNC">
        Cancelar
      </button>
    </div>
  </div>
  <LoadingUCT :blockFullScreem="true" class="position-fixed top-0 start-0" v-if="cargandoBloqueo" />
</template>

<script>
import { defineComponent, ref } from "vue";
import LoadingUCT from "@/components/Loading/Loading.vue";
import { useStore } from "vuex";

export default defineComponent({
  components: {
    LoadingUCT
  },
  emits: ["cerrar-agregar-dnc", "cerrar-cancelar-dnc"],
  setup(props, { emit }) {
    const store = useStore();
    const nombreDNC = ref("Nombre por defecto");
    const cargandoBloqueo = ref(false);

    const guardarDNC = async () => {
      cargandoBloqueo.value = true;
      let nuevoDNC = {
        nombre: nombreDNC.value,
        observador: store.state.user.userProfile,
      };
      await store.dispatch("ADMCapacitacion/addDNC", {
        nuevoDNC: nuevoDNC,
        token: store.state.user.token,
      });
      cargandoBloqueo.value = false;
      emit("cerrar-agregar-dnc");
    };

    const cancelarDNC = () => {
      emit("cerrar-cancelar-dnc");
    };

    return {
      nombreDNC,
      guardarDNC,
      cancelarDNC,
      cargandoBloqueo,
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
</style>
