<template>
  <select class="form-select" :value="selectedValue" @change="handleChange">
    <option v-if="placeholderText != ''" disabled selected value="">{{ placeholderText }}</option>
    <option v-for="option in options" :key="option.value" :value="option.value">
      {{ option.text }}
    </option>
  </select>
</template>

  
  <script>
  import { ref, watch } from 'vue';
  import axios from '@/../axios-config.js';
 
  
  export default {
    name: 'SelectGenerico',
    props: {
      modelValue: [String, Number],
      options: {
        type: Array,
        default: () => []
      },
      identificador:{
        type:String,
        default: ''
      },
      onchangeUpdate: Boolean,
      functionConfirm: Boolean,
      functionPreUpdate: Function,
      functionPostUpdate: Function,
      url: String,
      getCredenciales: Function,
      name:{
        type:String,
        default: 'campoSelect'
      },
      placeholder: {
        type: String,
        default: ''
      },
      extraValue: {
        type: Object,
        default: ()=> {}
      }
    },
    setup(props, { emit }) {
      const selectedValue = ref(props.modelValue);
      const previousValue = ref(props.modelValue);

      watch(() => props.modelValue, (newValue) => {
        selectedValue.value = newValue;
      });

      watch(selectedValue, (newValue, oldValue) => {
        previousValue.value = oldValue;
      }, {
          deep: true,
          immediate: true
      });
  
      const handleChange = async (event) => {
      selectedValue.value = event.target.value;
      emit('update:modelValue', selectedValue.value);
      if (props.onchangeUpdate) {
        await handleOnChangeUpdate(selectedValue.value);
      }
    };

    const handleOnChangeUpdate = async (newValue) => {
      if (props.functionConfirm && !await confirmUpdate()) {
        selectedValue.value = previousValue.value; // Revertir si la confirmación falla
        return;
      }

      if (props.functionPreUpdate) {
        await props.functionPreUpdate();
      }

      try {
        const headers = props.getCredenciales ? await props.getCredenciales() : {};
        // Construye el objeto de datos para la solicitud dependiendo de si `name` está presente.
        const data = { 
          [props.name]: newValue, 
          extraValue: props.extraValue,
          identificador: props.identificador,
         };

       

        const response = await axios.post(props.url, data, headers );
        return response
        
      } catch (error) {
        selectedValue.value = previousValue.value; // Revertir al valor anterior en caso de error
        
      }

      if (props.functionPostUpdate) {
        await props.functionPostUpdate();
      }
    };


    const confirmUpdate = async () => {
      // Implementación de la lógica de confirmación
      return true; // Retornar verdadero o falso según la confirmación del usuario
    };

    return {
      selectedValue,
      handleChange,
      placeholderText: props.placeholder
    };
  }
};
  </script>
  
  <style>
  /* Estilos del select */
  </style>
  