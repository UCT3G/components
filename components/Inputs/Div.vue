<template>
    <div
      contenteditable="true"
      :class="{ 'content-editable': true, 'error': errorInput }"
      @input="handleInput"
      @blur="handleBlur"
      v-html="inputValue"
      @focus="handleFocus"
    ></div>
  </template>
  
  <script>
  import { ref, watch, onUnmounted } from 'vue';
  import { toast } from 'vue3-toastify';
  
  export default {
    name: 'DivGenerico',
    props: {
      modelValue: String,
      minlength: {
        type: Number,
        default: 0
      },
      maxlength: {
        type: Number,
        default: null
      },
      required: {
        type: Boolean,
        default: false
      }
    },
    setup(props, { emit }) {
        const inputValue = ref(props.modelValue);
        const errorInput = ref(false);
        const isFocused = ref(false);
    
        watch(inputValue, (newValue) => {
            if (newValue.length < props.minlength || (props.maxlength && newValue.length > props.maxlength)) {
            errorInput.value = true;
            toast.error("Longitud de texto no válida.", {
                autoClose: 1000,
                theme: 'dark',
                position: toast.POSITION.TOP_CENTER,
            });
            } else {
            errorInput.value = false;
            }
    
            if (props.required && !newValue.trim()) {
            errorInput.value = true;
            toast.error("Este campo es obligatorio.", {
                autoClose: 1000,
                theme: 'dark',
                position: toast.POSITION.TOP_CENTER,
            });
            }
        });
    
        const handleInput = (event) => {
            let text = event.target.innerText;
            if (props.maxlength && text.length > props.maxlength) {
            text = text.slice(0, props.maxlength);
            event.target.innerText = text;
            }
            inputValue.value = text;
            emit('update:modelValue', text);
        };
    
        const handleBlur = () => {
            isFocused.value = false;
            if (props.required && !inputValue.value.trim()) {
            toast.error("Este campo es obligatorio.", {
                autoClose: 1000,
                theme: 'dark',
                position: toast.POSITION.TOP_CENTER,
            });
            }
        };

        const handleFocus = () => {
            isFocused.value = true;
        };
  
        onUnmounted(() => {
            // Cleanup si es necesario
        });
    
        return {
            inputValue,
            handleInput,
            handleBlur,
            errorInput,
            handleFocus,
            isFocused,
        };
    }
  };
  </script>
  
  <style>
    .content-editable {
        /* Estilos para tu componente contenteditable */
        /*border: 1px solid #ccc;*/
        padding: 10px;
        min-height: 20px;
    }

    .focused-class {
        /* Estilos cuando el contenteditable está enfocado */
        border-bottom: solid 1px #424242;
    }
    
    .error {
        border-color: red;
    }
  </style>
  