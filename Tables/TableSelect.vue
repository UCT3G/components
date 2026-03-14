<template>
  <div>
    <!-- Controles -->
    <div class="mb-2 d-flex justify-content-end align-items-center m-4">
      <input 
        type="number" 
        v-model="NoRegistrosVisibles" 
        min="10" max="200"
        class="form-control size-input d-inline-block ms-2"
        @change="actualizarRegistros"
      />

      <!-- Selección múltiple -->
      <div 
        v-if="modo === 'multiple'"
        @click="seleccionarRegistros"
        class="ms-2 d-flex align-items-center"
        style="height: 38px; cursor: pointer;"
      >
        <img :src="iconSelect" alt="Seleccionar" class="icon_select" />
      </div>

      <button 
        v-if="modo === 'multiple'" 
        class="btn btn-secondary ms-2" 
        @click="emitirSeleccion"
      >
        Agregar
      </button>
    </div>

    <!-- Tabla dinámica -->
    <div class="d-flex justify-content-center flex-column">
      <div class="m-4">
        <TablaDinamica
          :consultar_registros="filtrar"
          :tablaBase="tabla"
          :tabla_nombre="tablaNombre"
          @finalizarRenderBody="onFinalizarRenderBody"
          breakpoint="lg"
        />

        <!-- Checkbox o botón -->
        <template v-if="botonesActivos">
          <template 
            v-for="(registro, index) in tabla.registros" 
            :key="registro[campoId]"
          >
            <teleport :to="`#${tablaNombre} table tr:nth-child(${index + 1}) td:last-child div`">

              <div class="d-flex justify-content-center">
                <Checkbox
                  v-if="modo === 'multiple'"
                  v-model="registrosSeleccionados"
                  :valor="registro[campoId]"
                />

                <button 
                  v-else 
                  type="button" 
                  class="btn btn-sm btn-secondary"
                  @click="onAddIndividual(registro)"
                >
                  Seleccionar
                </button>
              </div>

            </teleport>
          </template>
        </template>

      </div>
    </div>

  </div>
</template>

<script>
import { defineComponent, ref, onMounted, computed, nextTick } from "vue";
import { useStore } from "vuex";
import TablaDinamica from "@/components/TablaDinamica/TablaDinamica.vue";
import Checkbox from "@/components/Inputs/Checkbox.vue";
import checkbox_icon from "@/assets/images/icons/check-2.svg";
import unchecked_icon from "@/assets/images/icons/checkbox-unchecked.svg";

export default defineComponent({
  name: "TablaSelect",
  components: { TablaDinamica, Checkbox },

  props: {
    tablaNombre: { type: String, required: true },   // Ej: TB_GT_USUARIOS
    campoId: { type: String, required: true },       // Ej: ignorar_id_usuario
    modo: {
      type: String,
      default: "multiple",
      validator: v => ["multiple", "individual"].includes(v)
    },
    filtroEstado: {
      type: Object,
      default: null // Ej: { campo: "estado_usuario", valor: "A" }
    },
    queryData: {
      type: Array,
      default: null // Ej: [1, 'param']
    }
  },

  emits: ["onAddMultiples", "onAddIndividual"],

  setup(props, { emit }) {
    const store = useStore();

    const filtrar = ref(false);
    const botonesActivos = ref(false);
    const registrosSeleccionados = ref([]);
    const NoRegistrosVisibles = ref(10);

    const tabla = computed(() =>
      store.getters["reporteador/getTablaPorNombre"](props.tablaNombre)
    );

    const iconSelect = computed(() =>
      registrosSeleccionados.value.length > 0 ? checkbox_icon : unchecked_icon
    );

    const configurarTabla = () => {
      if (!tabla.value) return;

      const config = JSON.parse(tabla.value.json_tabla);

      config.paginaActual = 1;
      config.inicio = 0;
      config.fin = NoRegistrosVisibles.value;
      config.no_filas = NoRegistrosVisibles.value;

       // Aplicar filtro dinámico
      if (props.filtroEstado) {
        const col = config.columnas.find(
          c => c.campo_nombre === props.filtroEstado.campo
        );
        if (col) col.valor = props.filtroEstado.valor;
      }

      // Aplicar datos de consulta (parámetros SQL)
      if (props.queryData) {
        config.data = props.queryData;
      }

      tabla.value.json_tabla = JSON.stringify(config);
      filtrar.value = true;
    };

    const onFinalizarRenderBody = () => {
      botonesActivos.value = false;
      filtrar.value = false;

      nextTick(() => {
        if (document.getElementById(props.tablaNombre)) {
          botonesActivos.value = true;
        }
      });
    };

    const seleccionarRegistros = () => {
      const registros = tabla.value?.registros || [];

      registrosSeleccionados.value =
        registrosSeleccionados.value.length > 0
          ? []
          : registros
              .slice(0, NoRegistrosVisibles.value)
              .map(r => r[props.campoId]);
    };

    const onAddIndividual = (registro) => {
      emit("onAddIndividual", registro);
    };

    const actualizarRegistros = () => {
      NoRegistrosVisibles.value = Math.min(Math.max(NoRegistrosVisibles.value, 10), 200);
      configurarTabla();
    };

    const emitirSeleccion = () => emit("onAddMultiples", registrosSeleccionados.value);

    onMounted(configurarTabla);

    return {
      tabla,
      filtrar,
      botonesActivos,
      registrosSeleccionados,
      NoRegistrosVisibles,
      iconSelect,
      seleccionarRegistros,
      actualizarRegistros,
      emitirSeleccion,
      onFinalizarRenderBody,
      onAddIndividual
    };
  }
});
</script>

<style scoped>
.size-input {
  width: 80px;
}
.icon_select {
  height: 100%;
  width: auto;
  object-fit: contain;
}
</style>
