<template>
  <div class="form-check form-check-inline">
    <input
      class="form-check-input"
      type="radio"
      :value="valor"
      v-model="modelo"
      :disabled="disabled"
      :required="required"
      @change="$emit('update:modelValue', modelo)"
    />
    <label class="form-check-label">{{ texto }}</label>
  </div>
</template>

<script>
import { watch } from "vue";
import { ref } from "vue";

export default {
  props: {
    valor: [String, Number, Boolean],
    texto: String,
    modelValue: [String, Number, Boolean],
    disabled: Boolean,
    required: Boolean
  },
  setup(props, { emit }) {
    const modelo = ref(props.modelValue);

    watch(
      () => props.modelValue,
      (newValue) => {
        modelo.value = newValue;
      }
    );

    watch(modelo, (newValue) => {
      emit("update:modelValue", newValue);
    });

    return {
      modelo,
    };
  },
};
</script>