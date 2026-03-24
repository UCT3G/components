<template>
  <div class="d-flex align-items-center gap-3 vigencia-container">
    <!-- Inicio -->
    <div class="d-flex flex-column">
      <label class="form-label fw-bold mb-1 smaller text-muted">{{ labelInicioEjercicio }}</label>
      <select
        v-model="internalValue.ejercicio"
        class="form-select form-select-sm"
        style="min-width: 120px"
        @change="emitChange"
      >
        <option :value="null" disabled>Año...</option>
        <option v-for="ejercicio in ejercicios" :key="ejercicio" :value="ejercicio">
          {{ ejercicio }}
        </option>
      </select>
    </div>

    <div class="d-flex flex-column">
      <label class="form-label fw-bold mb-1 smaller text-muted">{{ labelInicioPeriodo }}</label>
      <select
        v-model="internalValue.periodo"
        class="form-select form-select-sm"
        style="min-width: 100px"
        @change="emitChange"
      >
        <option :value="null" disabled>Mes...</option>
        <option v-for="(mes, index) in meses" :key="index" :value="periodos[index]">
          {{ mes }}
        </option>
      </select>
    </div>

    <div v-if="showFin" class="vr mx-2 separator" style="height: 35px; margin-top: 15px; opacity: 0.2;"></div>

    <!-- Fin (Opcional) -->
    <template v-if="showFin">
      <div class="d-flex flex-column">
        <label class="form-label fw-bold mb-1 smaller text-muted">{{ labelFinEjercicio }}</label>
        <select
          v-model="internalValue.ejercicio_fin"
          class="form-select form-select-sm"
          style="min-width: 130px"
          @change="emitChange"
        >
          <option :value="null">Sin fecha fin</option>
          <option v-for="ejercicio in ejercicios" :key="ejercicio" :value="ejercicio">
            {{ ejercicio }}
          </option>
        </select>
      </div>

      <div class="d-flex flex-column">
        <label class="form-label fw-bold mb-1 smaller text-muted">{{ labelFinPeriodo }}</label>
        <select
          v-model="internalValue.periodo_fin"
          class="form-select form-select-sm"
          style="min-width: 100px"
          :disabled="internalValue.ejercicio_fin === null"
          @change="emitChange"
        >
          <option :value="null">Mes...</option>
          <option v-for="(mes, index) in meses" :key="index" :value="periodos[index]">
            {{ mes }}
          </option>
        </select>
      </div>
    </template>
  </div>
</template>

<script>
import { defineComponent, computed, reactive, watch } from 'vue';

export default defineComponent({
  name: 'ConfiguracionVigencia',
  props: {
    modelValue: {
      type: Object,
      required: true,
      default: () => ({
        ejercicio: null,
        periodo: null,
        ejercicio_fin: null,
        periodo_fin: null
      })
    },
    showFin: {
      type: Boolean,
      default: true
    },
    labelInicioEjercicio: { type: String, default: 'Ejercicio Inicio' },
    labelInicioPeriodo: { type: String, default: 'Periodo Inicio' },
    labelFinEjercicio: { type: String, default: 'Ejercicio Fin (Opcional)' },
    labelFinPeriodo: { type: String, default: 'Periodo Fin' }
  },
  emits: ['update:modelValue', 'change'],
  setup(props, { emit }) {
    const internalValue = reactive({ ...props.modelValue });

    const ejercicios = Array.from({ length: 6 }, (_, i) => 2025 + i);
    const meses = [
      "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
      "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
    ];
    const periodos = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, "0"));

    watch(() => props.modelValue, (newVal) => {
      Object.assign(internalValue, newVal);
    }, { deep: true });

    const emitChange = () => {
      emit('update:modelValue', { ...internalValue });
      emit('change', { ...internalValue });
    };

    return {
      internalValue,
      ejercicios,
      meses,
      periodos,
      emitChange
    };
  }
});
</script>

<style scoped>
.smaller {
  font-size: 0.75rem;
}
.vigencia-container {
    flex-wrap: wrap;
}
.separator {
    align-self: flex-start;
}
</style>
