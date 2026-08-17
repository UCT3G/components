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
  color: var(--txttitulo);
  transition: 0.5s linear;
}

.DropDownTrespuntos .icon {
  display: inline-block;
  width: 1.5rem;
  height: 1.5rem;
  fill: var(--blueBerry); 
}

.DropDownTrespuntos .dropdown-menu button:hover {
  background-color: var(--dropdown-hover);
}


.dropdown-menu.show {
    font-size: 13.5px;
    background: linear-gradient(
        45deg,
        rgba(var(--dropdown-bg), 0.60) 0%,
        rgba(214, 214, 231, 0.30) 40%
    );
    backdrop-filter: blur(9px);
    -webkit-backdrop-filter: blur(11px) saturate(160%);
    border: 1px solid rgba(255, 255, 255, 0.75);
    border-radius: 12px;
    box-shadow:
        0 10px 30px rgba(0,0,0,.20),
        0 2px 8px rgba(0, 0, 0, 0.11),
        inset 0 1px 0 rgba(255,255,255,.6);
}

.dropdown-item {
    position: relative;
    transition: all .2s ease;
}

.dropdown-item::before {
    content: "";
    position: absolute;
    left: 1px;
    top: 20%;
    width: 3px;
    height: 70%;
    border-radius: 999px;
    background: var(--purple-sb-70);
    transform: scaleY(0);
    transition: transform .2s ease;
}

.dropdown-item:hover::before {
    transform: scaleY(1);
}
</style>
