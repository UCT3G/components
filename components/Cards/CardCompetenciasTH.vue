<template>
  <div id="ads" :style="getCardStyle(avance)">
    <div class="card" @click="handleCardClick">
      <div>
        <span
          class="card-icon card-circle"
        >
        <img :src="AreaTematica" alt="Logo Comentario" width="20" height="20">
        </span>
      </div>
      <div class="card-body" :class="{'reflejo-obligatorio': es_obligatorio === '1'}">
        <div class="header-container">
          <div class="progress-container">
            <!--<ProgressBar :avance="avance"></ProgressBar>-->
          </div>
        </div>
        <div class="title-container">
          <h5 class="text-obligatorio-no">{{ titulo }}</h5>
        </div>
        <slot name="card-body"></slot>
      </div>
      <span class="calificacion">cal.{{ promedio }}</span>
    </div>
     
  </div>
</template>

<script>
import { onMounted, ref } from "vue";
//import ProgressBar from "../Progress/ProgressBar.vue";

export default {
  components: {
    //ProgressBar,
  },
  props: {
    titulo: {
      type: String,
      required: true,
    },
    promedio: {
      type: Number,
      required: true,
    },
    avance: {
      type: Number,
      required: true,
    },
    es_obligatorio: {
      type: String,
      default: '0',
    },
    area_tematica: {
      type: Number,
      required: true,
    },
  },
  methods: {
    getCardStyle(promedio) {
      let degradado;
      if (promedio >= 0 && promedio <= 24) {
        degradado =
          "110deg, #f693a4 0, #e9829a 25%, #d86c8f 50%, #c65785 75%, #b7457e 100%";
      } else if (promedio >= 25 && promedio <= 49) {
        degradado =
          "110deg, #edb78d 0, #e4a67e 25%, #d8906c 50%, #cb7a5c 75%, #c26851 100%";
      } else if (promedio >= 50 && promedio <= 74) {
        degradado =
          "110deg, #ffffaf 0, #ffffa6 25%, #f2f29d 50%, #d7dd94 75%, #bfca8b 100%";
      } else if (promedio >= 75 && promedio <= 90) {
        degradado =
          "110deg, #e6ff99 0, #ceff9b 16.67%, #b5ff9d 33.33%, #9df29d 50%, #86e49d 66.67%, #72d89d 83.33%, #60ce9e 100%";
      } else {
        degradado = "110deg, #9fb7f5 0, #6c90d8 50%, #2c6bbb 100%";
      }
      return {
        "--calificacion-content": "'" + promedio + "%'",
        "--card-background": `linear-gradient(${degradado})`,
      };
    },
    handleCardClick() {
      this.$emit("card-click", this.competencia);
    },
  },
  setup(props) {
    const AreaTematica = ref("");

    onMounted(() => {
      switch (props.area_tematica) {
        case 1000: //PRODUCCION GENERAL
          AreaTematica.value = require("@/assets/images/icons/DC3/PRODUCCIÓN GRAL.svg");
          break;
        case 2000: //SERVICIOS
          AreaTematica.value = require("@/assets/images/icons/DC3/SERVICIOS.svg");
          break;
        case 3000: //ADMINISTRACION, CONTABILIDAD
          AreaTematica.value = require("@/assets/images/icons/DC3/Administración-23.svg");
          break;
        case 4000: //COMERCIALIZACION
          AreaTematica.value = require("@/assets/images/icons/DC3/COMERCIALIZACIÓN.svg");
          break;
        case 5000: //MANTENIMIENTO Y REPARACION
          AreaTematica.value = require("@/assets/images/icons/DC3/MANTENIMIENTO.svg");
          break;
        case 6000: //SEGURIDAD
          AreaTematica.value = require("@/assets/images/icons/DC3/SEGURIDAD.svg");
          break;
        case 7000: //DESARROLLO PERSONAL
          AreaTematica.value = require("@/assets/images/icons/DC3/DESARROLLO PERSONAL.svg");
          break;
        case 8000: //USO DE TECNOLOGIAS
          AreaTematica.value = require("@/assets/images/icons/DC3/USO DE TECNOLOGIAS.svg");
          break;
        case 9000: //PARTICIPACION SOCIAL
          AreaTematica.value = require("@/assets/images/icons/DC3/PARTICIPACIÓN SOCIAL.svg");
          break;
        default:
          return "Valor fuera de rango";
      }
    });

    return {
      AreaTematica,
    };
  },
};
</script>

<style scoped>
#ads {
  margin-top: 30px;
  margin-bottom: 5px;
}

#ads .card::before {
  content: var(--calificacion-content, "");
  position: absolute;
  width: 85px; /* Ancho de la pestaña */
  height: 40px; /* Altura de la pestaña */
  background: var(--card-background);
  display: flex;
  justify-content: flex-end; /* Alinea el texto hacia la derecha */
  align-items: center;
  padding-right: 16px;
  font-weight: bold;
  color: #fff;
  border-bottom-right-radius: 70%;
  border-top-left-radius: 20px;
}

#ads .card {
  position: relative;
  width: 225px;
  height: 160px;
  border-radius: 20px; /* Agrega esquinas redondeadas */
  box-shadow: rgba(0, 0, 0, 0.16) 0px 3px 6px, rgba(0, 0, 0, 0.23) 0px 3px 6px;
  cursor: pointer;
}

#ads .card-body {
  overflow: hidden; /* Oculta el texto que desborda */
  border-radius: 20px; /* Agrega esquinas redondeadas */
  z-index: 1;
}

#ads .card:hover {
  box-shadow: 20px 20px 20px rgba(0, 0, 0, 0.4);
  transform: translateY(-5%);
  transition: all 0.3s ease;
}

#ads .card-icon {
  position: absolute;
  left: -10px; /* Ajusta la posición izquierda del icono */
  top: -10px; /* Ajusta la posición superior del icono */
  background: linear-gradient(rgb(216, 218, 223), rgb(254, 254, 254));
  text-align: center;
  color: #fff;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  padding: 6px 0 0 0;
  z-index: 5;
}

.card-circle {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  box-shadow: rgba(0, 0, 0, 0.4) 0px 2px 4px,
    rgba(0, 0, 0, 0.3) 0px 7px 13px -3px, rgba(0, 0, 0, 0.2) 0px -3px 0px inset;
  /* animation: rotate 4s infinite linear; */
  position: absolute;
  left: -10px;
  top: -10px;
}

@keyframes rotate {
  100% {
    transform: rotate(1turn);
  }
}

.header-container {
  display: flex;
  align-items: center;
  position: relative;
}

.title-container {
  margin-top: 10px; /* Espaciado adicional entre el progress bar y el tituloC */
  text-align: center; /* Centra el texto horizontalmente */
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column; /* Coloca el texto en columna */
  height: 80px;
  
  margin-top: 20px;
}

.title-container h5 {
  font-size: 12px;
  font-weight: bold;
}

.progress-container {
  width: 140px;
  margin-left: 60px;
}

.text-obligatorio-no{
  color: rgb(104, 104, 104);
}

.text-obligatorio-si{
  color: red;
}

.calificacion{
  font-family: 'MonserratSemiBoldItalic';
    padding-left: 10px;
    color: rgb(104, 104, 104);
    position: absolute;
    right: 10px;
    top: 6px;
}
</style>
