<template>
  <div class="form-floating mb-3" v-if="label">
    <input
      :class="['form-control', size ? 'form-control-' + size : '']"
      type="date"
      :id="inputId"
      :value="inputValue"
      :min="minValue"
      :max="maxValue"
      :disabled="disabled"
      @input="emitirFecha($event.target.value)"
    />
    <label :for="inputId">{{ label }}</label>
  </div>
  <div class="mb-0" v-else>
    <input
      :class="['form-control', size ? 'form-control-' + size : '']"
      type="date"
      :value="inputValue"
      :min="minValue"
      :max="maxValue"
      :disabled="disabled"
      @input="emitirFecha($event.target.value)"
    />
  </div>
</template>

<script>
import { computed, defineComponent } from "vue";
import dayjs from "dayjs";

export default defineComponent({
  name: "DatePickerInput",
  props: {
    label: {
      type: String,
      default: null,
    },
    valorInput: {
      type: String,
      default: "",
    },
    formato: {
      type: String,
      default: "YYYY-MM-DD",
    },
    formatoDisplay: {
      type: String,
      default: "",
    },
    minDate: {
      type: String,
      default: "",
    },
    maxDate: {
      type: String,
      default: "",
    },
    disabled: Boolean,
    size: {
      type: String,
      default: "",
    },
  },
  emits: ["update:fechaActualizada"],
  setup(props, { emit }) {
    const toNativeDate = (value) => {
      if (!value) return "";
      const valueString = String(value).substring(0, 10);

      if (/^\d{4}-\d{2}-\d{2}$/.test(valueString)) {
        return valueString;
      }

      if (/^\d{2}-\d{2}-\d{4}$/.test(valueString)) {
        const [day, month, year] = valueString.split("-");
        return `${year}-${month}-${day}`;
      }

      const parsed = dayjs(valueString);
      return parsed.isValid() ? parsed.format("YYYY-MM-DD") : "";
    };

    const inputValue = computed(() => toNativeDate(props.valorInput));
    const minValue = computed(() => toNativeDate(props.minDate));
    const maxValue = computed(() => toNativeDate(props.maxDate));
    const inputId = computed(() => `date-input-${Math.random().toString(36).slice(2)}`);

    const emitirFecha = (value) => {
      if (!value) {
        emit("update:fechaActualizada", "");
        return;
      }

      const parsed = dayjs(value);
      emit("update:fechaActualizada", parsed.isValid() ? parsed.format(props.formato) : value);
    };

    return {
      inputId,
      inputValue,
      minValue,
      maxValue,
      emitirFecha,
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
