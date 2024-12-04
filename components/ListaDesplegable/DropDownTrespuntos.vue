<template>
  <div class="DropDownTrespuntos btn-group">
    <button type="button" data-bs-toggle="dropdown" aria-expanded="false">
      <span v-html="svgContent" class="icon"></span>
    </button>
    <ul class="dropdown-menu">
      <li v-for="(opcion, index) in opcionesLista" :key="index">
        <button class="dropdown-item" type="button" @click="emitirEvento(opcion, index)">
          {{ opcion }}
        </button>
      </li>
    </ul>
  </div>
</template>

<script>
import { defineComponent, ref, watch, computed } from 'vue';

// Caché compartido para almacenar las promesas y el contenido SVG
const svgCache = {};

export default defineComponent({
  name: 'DropDownTrespuntos',
  props: {
    lista: {
      type: [Array, String],
      default: () => [],
    },
    data: {
      type: Object,
      default: () => ({}),
    },
    iconName: {
      type: String,
      required: true,
    },
    width_icon: {
      type: String,
      default: '10px',
    },
  },
  emits: ['elementoSeleccionado'],
  setup(props, { emit }) {
    const opcionesLista = ref([]);
    const svgContent = ref('');

    // Computada para manejar el texto del botón
    const buttonText = computed(() => {
      const texto = 'Selecciona una opción';
      return texto.length > 20 ? texto.substring(0, 20) + '...' : texto;
    });

    // Observador para actualizar opcionesLista cada vez que la prop lista cambia
    watch(
      () => props.lista,
      (newValue) => {
        if (Array.isArray(newValue)) {
          opcionesLista.value = newValue;
        } else if (typeof newValue === 'string') {
          opcionesLista.value = newValue.split(',').filter((n) => n.trim());
        }
      },
      { immediate: true }
    );

    // Función para emitir el evento con nombre, índice y datos
    function emitirEvento(opcion, index) {
      emit('elementoSeleccionado', {
        nombre: opcion,
        indice: index,
        data: props.data,
      });
    }

    // Función para cargar el SVG con caché que maneja promesas
    const loadSvg = async () => {
      if (svgCache[props.iconName]) {
        const cached = svgCache[props.iconName];
        if (cached instanceof Promise) {
          // Si es una promesa, esperar a que se resuelva
          svgContent.value = await cached;
          //console.log('SVG cargado desde promesa en caché');
        } else {
          // Si es el contenido SVG, usarlo directamente
          svgContent.value = cached;
          //console.log('SVG cargado desde caché');
        }
      } else {
        // Iniciar la carga del SVG y almacenar la promesa en el caché
        const fetchPromise = (async () => {
          try {
            const svgPath = require(`@/assets/images/icons/${props.iconName}`);
            const response = await fetch(svgPath);
            const svgText = await response.text();
            const svgWithStyle = svgText.replace(
              /<svg /,
              `<svg style="width: ${props.width_icon};" `
            );
            // Una vez cargado, reemplazar la promesa en el caché con el contenido SVG
            svgCache[props.iconName] = svgWithStyle;
            //console.log('SVG cargado desde archivo y almacenado en caché');
            return svgWithStyle;
          } catch (error) {
            console.error('Error al cargar el SVG:', error);
            const errorSvg =
              '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100"><text y="50%" x="50%" dy="0.3em" text-anchor="middle" fill="red">Error</text></svg>';
            svgCache[props.iconName] = errorSvg; // Almacenar el SVG de error en el caché
            return errorSvg;
          }
        })();
        // Almacenar la promesa en el caché
        svgCache[props.iconName] = fetchPromise;
        svgContent.value = await fetchPromise;
      }
    };

    watch(
      () => props.iconName,
      loadSvg,
      { immediate: true }
    );

    return { opcionesLista, buttonText, emitirEvento, svgContent };
  },
});
</script>

<style scoped>
.dropdown-toggle {
  text-align: left;
}
.DropDownTrespuntos {
  padding: 5px 0px;
}
.DropDownTrespuntos button {
  background-color: transparent;
  border: none;
  color: var(--babyBlue);
  transition: 0.5s linear;
}
.DropDownTrespuntos .dropdown-menu button:hover {
  background-color: var(--bluePerry);
}
.DropDownTrespuntos .icon {
  display: inline-block;
  width: 1.5rem;
  height: 1.5rem;
  fill: var(--blueBerry);
}
.dropdown-menu.show {
  background: linear-gradient(
    90deg,
    var(--purple-sb-70) 0%,
    var(--bluelight-sb-70) 100%
  );
  border: 1px solid var(--babyBlue);
  backdrop-filter: blur(5px);
  box-shadow: rgba(0, 0, 0, 0.24) 0px 3px 8px;
}
</style>
