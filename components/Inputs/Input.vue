<template>
  <input
    v-if="type != 'checkbox'"
    :type="type"
    :placeholder="placeholder"
    v-model="inputValue"
    @input="handleInput"
    @blur="handleBlur"
  />
  <template v-else>
    <input
      :type="type"
      :placeholder="placeholder"
      v-model="inputValue"
      @input="handleInput"     
      @change="handleBlur"
    />
  </template>
</template>
  
<script>
  import { ref, watch, onUnmounted } from 'vue';
  import axios from '@/../axios-config.js';
  import { toast } from 'vue3-toastify';

  export default {
    name: 'InputGenerico',
    props: {
      type: {
        type: String,
        default: 'text'
      },
      placeholder: String,
      modelValue: {
        type: [String, Number, Boolean, Object, Array],
        default: ''
      },
      onchangeUpdate: {
        type: Boolean,
        default: false
      },
      functionConfirm: {
        type: Boolean,
        default: false
      },
      identificador:{
        type:Object,
        default: () => ({})
      },
      functionPreUpdate: Function,
      functionPostUpdate: Function,
      url: String,
      getCredenciales: Function,
      timeAutoSave:String,
      name:{
        type:String,
        default: 'campo'
      }
    },
    setup(props, { emit }) {
      const inputValue = ref(props.modelValue); // Usa modelValue
      
      let debounceTimeout = null;
      const timeAutoSave = props.timeAutoSave != null?props.timeAutoSave : 5000;
      const saved = ref(false)
      const previousValue = ref(props.value);
      const errorInput = ref(false)     
     

      watch(inputValue, (newValue, oldValue) => {
        previousValue.value = oldValue;
        if (props.onchangeUpdate) {
          //debugger
          saved.value = false
          if (debounceTimeout) 
            clearTimeout(debounceTimeout);
            debounceTimeout = setTimeout(() => {
              if(!saved.value && !errorInput.value){                             
                handleOnChangeUpdate(newValue)
            }}, timeAutoSave);
        }
      });

      const handleInput = (event) => {
        inputValue.value = event.target.value;
        emit('update:modelValue', inputValue.value);
      };

      const handleBlur = () => {
        if (debounceTimeout) {
          clearTimeout(debounceTimeout);
          debounceTimeout = null;          
          if(!saved.value){
            saved.value=true;
            handleOnChangeUpdate(inputValue.value);
          }            
        }
      };

      const handleOnChangeUpdate = async (newValue) => {
        if (props.functionConfirm && !await confirmUpdate()) {
          // La respuesta de ejecutar esa función debe ser true o false. Si es true, continúa con la aplicación y si es false, detiene todo y recupera el valor anterior.
          return;
        }

        if (props.functionPreUpdate) {
          await props.functionPreUpdate();
        }

        try {
          
          const headers = props.getCredenciales ? await props.getCredenciales() : {};

          // Construye el objeto de datos para la solicitud dependiendo de si `name` está presente.
          //const data = props.name ? { [props.name]: newValue } : { value: newValue };
          
          const data = { 
          [props.name]: newValue,         
          identificador: props.identificador,
         };

          const response = await axios.post(props.url, data, { headers });

          previousValue.value = newValue; // Actualiza el valor anterior.
          
          /*toast.success(response.comentario, {
                        autoClose: 1000,
                        theme: 'dark',
                        position: toast.POSITION.TOP_CENTER,
                        toastId: "customId",
                    });*/

          if (props.functionPostUpdate) {
            await props.functionPostUpdate(response);
          }

        } catch (error) {
          // Detener que el watch siga guardando cambios.
          inputValue.value = previousValue.value;
          errorInput.value = true;
          clearTimeout(debounceTimeout);
          toast.error(error.message, {
                        autoClose: 1000,
                        theme: 'dark',
                        position: toast.POSITION.TOP_CENTER,
                        toastId: "customId",
                    });
        }

        
};

  
      const confirmUpdate = async () => {
        // Implementación de la lógica de confirmación
        return true; // Retornar verdadero o falso según la confirmación del usuario
      };

      onUnmounted(() => {
        if (debounceTimeout) clearTimeout(debounceTimeout);
      });

      return { 
      inputValue, 
      handleInput, 
      handleBlur,      
      
    };
    }
  };
</script>


  
  <style>
  /* Estilos del input */
  </style>
  