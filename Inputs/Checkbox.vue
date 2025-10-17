<template>
  <div class="form-check form-check-inline">
    <input
      class="form-check-input"
      type="checkbox" 
      :value="valor"
      :checked="modelo.includes(valor)"
      @change="toggleSeleccion"
      :disabled="disabled"
      :required="required"
    />
   
  </div>
</template>

<script>
import { watch, ref } from "vue";

export default {
  name:'Input-Checkbox',
  props: {
    valor: [String, Number, Object],
    modelValue: Array, 
    disabled: Boolean,
    required: Boolean
  },
  setup(props, { emit }) {
    const modelo = ref([...props.modelValue]);

    const toggleSeleccion = (event) => {
      const val = props.valor;
      if (event.target.checked) {
        modelo.value.push(val);
      } else {
        modelo.value = modelo.value.filter((v) => v !== val);
      }
      emit("update:modelValue", modelo.value);
    };

    watch(() => props.modelValue, (newVal) => {
      modelo.value = [...newVal];
    });

    return {
      modelo,
      toggleSeleccion
    };
  }
};
</script>
