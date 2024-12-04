<template>
  <VDatePicker
    v-model="date"
    color="red"
    :min-date="computedMinDate"
    :max-date="computedMaxDate"
  >
    <template #default="{ inputValue, inputEvents }">
      <div class="form-floating mb-3" v-if="label">
        <input
          class="form-control"
          id="floatingInput"
          :value="inputValue"
          v-on="inputEvents"
          :disabled="disabled"
          :style="{ 'pointer-events': disabled ? 'none' : 'auto' }"
        />
        <label for="floatingInput">{{ label }}</label>
      </div>
      <div class="mb-3" v-else>
        <input
          class="form-control"
          :value="inputValue"
          v-on="inputEvents"
          :disabled="disabled"
          :style="{ 'pointer-events': disabled ? 'none' : 'auto' }"
        />
      </div>
    </template>
  </VDatePicker>
</template>

<script>
import { defineComponent, ref, toRefs, watch, onMounted } from "vue";
import { DatePicker as VDatePicker } from "v-calendar";
import dayjs from "dayjs";
import { computed } from "vue";

export default defineComponent({
  name: "DatePickerInput",
  components: {
    VDatePicker,
  },
  props: {
    label: {
      type: String,
      default: null,
    },
    valorInput: {
      type: String,
      default: "",
    }, //Solo recibe valores con el formato YYYY-MM-DD
    formato: {
      type: String,
      default: "YYYY-MM-DD",
    },
    minDate: {
      type: String, // Cambié el tipo a String
      default: "",
    },
    maxDate: {
      type: String, // Cambié el tipo a String
      default: "",
    },
    disabled: Boolean,
  },
  setup(props, { emit }) {
    const date = ref();
    const { valorInput, formato } = toRefs(props);

    const computedMinDate = computed(() => {
      return props.minDate ? props.minDate : null;
    });

    const computedMaxDate = computed(() => {
      return props.maxDate ? props.maxDate : null;
    });

    // Función para formatear la fecha según el formato deseado
    const formatDate = (date, format) => {
      if (date instanceof Date && !isNaN(date)) {
        return dayjs(date).format(format);
      }
      return "";
    };

    // Observa cambios en localValue para emitir eventos
    watch(date, (newVal, oldValue) => {
      if (newVal === null) {
        emit("update:fechaActualizada", ""); // Emitir una cadena vacía si no hay fecha seleccionada
      } else if (newVal && oldValue != newVal) {
        const formattedDate = formatDate(newVal, formato.value);
        //Pasar al formato solicitado en las props
        emit("update:fechaActualizada", formattedDate);
      }
    });

    watch(valorInput, (newValue) => {
      if (newValue && newValue != "") {
        let year = valorInput.value.substring(0, 4);
        let month = valorInput.value.substring(5, 7);
        let day = valorInput.value.substring(8, 10);
        date.value = new Date(year, month - 1, day);
      } else {
        date.value = null;
      }
    });

    onMounted(() => {
      if (props.valorInput != "") {
        let year = valorInput.value.substring(0, 4);
        let month = valorInput.value.substring(5, 7);
        let day = valorInput.value.substring(8, 10);
        date.value = new Date(year, month - 1, day);
      }
    });

    return {
      date,
      computedMinDate,
      computedMaxDate,
    };
  },
});
</script>

<style scoped>
.form-control {
  width: 100%;
  padding: 0.375rem 0.75rem;
  border: 1px solid #ced4da;
  border-radius: 0.25rem;
}
</style>
