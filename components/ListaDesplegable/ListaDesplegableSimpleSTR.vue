<template>
    <div class="dropdown">
      <button class="btn btn-secondary dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false">
        {{ buttonText }}
      </button>
      <ul class="dropdown-menu">
        <li v-for="(opcion, index) in opcionesLista" :key="index">
          <a class="dropdown-item" href="#">{{ opcion }}</a>
        </li>
      </ul>
    </div>
  </template>
  
<script>
    import { defineComponent, ref, watch, computed } from 'vue';

    export default defineComponent({
    name: 'ListaDesplegableSimpleSTR',
    props: {
        lista: {
          type: [Array, String],        
          default: () => []
        }
    },
    setup(props) {
        const opcionesLista = ref([]);

        // Computada para manejar el texto del botón
        const buttonText = computed(() => {
        const texto = opcionesLista.value[0] || '';
        return texto.length > 10 ? texto.substring(0, 10) + '...' : texto;
        });

        // Observador para actualizar opcionesLista cada vez que la prop lista cambia
        watch(() => props.lista, (newValue) => {
        if (Array.isArray(newValue)) {
            opcionesLista.value = newValue;
        } else if (typeof newValue === 'string') {
            opcionesLista.value = newValue.split(',').filter(n => n.trim());
        }
        }, { immediate: true });

        return { opcionesLista, buttonText };
    }
    });
</script>

  <style scoped>
  /* Estilos adicionales si son necesarios */
  .dropdown-toggle {
    min-width: 100px;
    text-align: left;
  }
  </style>
  