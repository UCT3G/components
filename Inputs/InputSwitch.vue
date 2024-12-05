<template>
    <div class="form-check form-switch">
      <input
        class="form-check-input"
        type="checkbox"
        role="switch"
        :id="inputId"
        :checked="isChecked"
        @change="handleChange"
      />
      <label class="form-check-label" :for="inputId">{{ label }}</label>
    </div>
  </template>
  
  <script>
  import { defineComponent, ref, computed, watch } from 'vue';
  import axios from '@/../axios-config.js';
  import { useStore } from 'vuex';
  
  export default defineComponent({
    props: {
      estado: {
        type: [Number, String, Boolean],
        required: true
      },
      url: {
        type: String,
        required: true
      },
      identificador: {
        type: Object,
        required: true
      },
      label: String
    },
    setup(props) {
      const inputId = `input-switch-${Math.random().toString(36).substring(2, 9)}`;
      const activeValues = [1, 'A', true];
      const inactiveValues = [0, 'I', false];
      const isChecked = ref(activeValues.includes(props.estado));
      const store = useStore();
   
  
      // Computed property to determine current state value
      
      const currentValue = computed(() => {
        return isChecked.value ? activeValues[0] : inactiveValues[0];
      });
  
      // Handles changes to the switch, attempts to post data and reverts on failure
      const handleChange = async () => {
        try {
          //Se cambia el valor de currentValue, si currentValue.value es 1, A, true, se cambia a 0 y viceversa
          isChecked.value = isChecked.value == 1  || isChecked.value == 'A' || isChecked.value == true ? 0 : 1;

          const headers = getCredenciales();
          const response = await axios.post(props.url, {
            identificador: props.identificador,
            estado: currentValue.value
          },headers);
         
          console.log('Response:', response.data);

        } catch (error) {
          // Revert the checkbox state on error
          isChecked.value = !isChecked.value;
          console.error('Error updating state:', error);
        }
      };
  
      // Watches external changes to the 'estado' prop
      watch(() => props.estado, (newVal) => {
        isChecked.value = activeValues.includes(newVal);
      });

      const getCredenciales = () => {
          const token = store.state.user.token; // Ajusta según la estructura de tu store
          return {
              headers: {
                  Authorization: `Bearer ${token}`
              }
          };
      };
        

      return {
        inputId,
        isChecked,
        handleChange
      };
    }
  });
  </script>
  