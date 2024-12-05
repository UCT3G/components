<template>
  <div id="ads" :style="getCardStyle(competencia)">
    <div class="card" @click="handleCardClick">
      <div class="card-image">
        <div class="obligatorio-circlea"></div>
        <slot name="card-image ">
          <span class="card-icon obligatorio-circle-no">
            <img :src="AreaTematica" alt="Logo Comentario" width="20" height="20">
          </span>
        </slot>
      </div>
      <div class="card-body" :class="{'reflejo-obligatorio': competencia.es_obligatoria === '1'}">
        <div class="header-container">
          <div class="progress-container">
            <!--<ProgressBarCompetencias :avance="competencia.avance"></ProgressBarCompetencias>-->
          </div>
        </div>
        <div class="title-container">
          <h5 class="text-obligatorio-no">
            {{ competencia.titulo }}
          </h5>
        </div>
        <slot name="card-body"></slot>
      </div>
    </div>
  </div> 
</template>

<script>
import { onMounted, ref } from 'vue';
//import ProgressBarCompetencias from '../Progress/ProgressBarCompetencias.vue';

export default {
  components: {
    
  },
  props: {
    competencia: {
      type: Object,
      required: true
    },
    calificacionIcon: {
      type: String,
      required: true
    }
  },
  methods: {
    getCardStyle(competencia) {
      let color;
      let color2;
      if (competencia.avance >= 0 && competencia.avance <= 24) {
        color = '255, 0, 255';
        color2 = '237, 30, 121';
      } else if (competencia.avance >= 25 && competencia.avance <= 49) {
        color = '237, 30, 121';
        color2 = '251, 176, 59';
      } else if (competencia.avance >= 50 && competencia.avance <= 74) {
        color = '255, 255, 0';
        color2 = '252, 238, 33';
      } else if (competencia.avance >= 75 && competencia.avance <= 90) {
        color = '0, 255, 0';
        color2 = '41, 171, 226';
      } else {
        color = '0, 255, 255';
        color2 = '0, 0, 255';
      }
      return {
        'font-size': '12px',
        '--calificacion-content': '\'' + competencia.avance.toFixed(0) + '%\'',
        '--card-background': `linear-gradient(to right, rgb(${color}), rgb(${color2}))`
      };
    },
    handleCardClick() {
      this.$emit('card-click', this.competencia);
    }
  },
  setup(props) {
    const AreaTematica = ref('');

    onMounted(() => {
      switch (props.competencia.area_tematica) {
        case 1000: //PRODUCCION GENERAL
          AreaTematica.value = require('@/assets/images/icons/DC3/PRODUCCIÓN GRAL.svg');
          break;
        case 2000: //SERVICIOS1
          AreaTematica.value = require('@/assets/images/icons/DC3/SERVICIOS.svg');
          break;
        case 3000: //ADMINISTRACION, CONTABILIDAD
          AreaTematica.value = require('@/assets/images/icons/DC3/Administración-23.svg');
          break;
        case 4000: //COMERCIALIZACION
          AreaTematica.value = require('@/assets/images/icons/DC3/COMERCIALIZACIÓN.svg');
          break;
        case 5000: //MANTENIMIENTO Y REPARACION
          AreaTematica.value = require('@/assets/images/icons/DC3/MANTENIMIENTO.svg');
          break;
        case 6000: //SEGURIDAD
          AreaTematica.value = require('@/assets/images/icons/DC3/SEGURIDAD.svg');
          break;
        case 7000: //DESARROLLO PERSONAL
          AreaTematica.value = require('@/assets/images/icons/DC3/DESARROLLO PERSONAL.svg');
          break;
        case 8000: //USO DE TECNOLOGIAS
          AreaTematica.value = require('@/assets/images/icons/DC3/USO DE TECNOLOGIAS.svg');
          break;
        case 9000: //PARTICIPACION SOCIAL
          AreaTematica.value = require('@/assets/images/icons/DC3/PARTICIPACIÓN SOCIAL.svg');
          break;
        default:
          return "Valor fuera de rango";
      }
    });


    return {
      AreaTematica
    };
  }
}
</script>

<style scoped>
#ads {
  margin: 30px 0 10px 0;
}

#ads .card-icon {
  position: absolute;
  left: -10px;
  /* Ajusta la posición izquierda del icono */
  top: -10px;
  /* Ajusta la posición superior del icono */
  background: linear-gradient(rgb(216, 218, 223), rgb(254, 254, 254));
  border-radius: 50%;
  text-align: center;
  color: #fff;
  width: 40px;
  height: 40px;
  padding: 6px 0 0 0;
  border: 1.5px solid white;
  z-index: 5;
}

#ads .card-icon.obligatoria {
  box-shadow:
    inset 0 -3em 3em rgb(193 13 71 / 40%),
    0 0 0 1px white,
    0.3em 0.3em 1em rgb(193 13 71 / 40%);
  /* box-shadow: 0 0 30px var(--close); */
}

#ads .card::before {
  content: var(--calificacion-content, '');
  position: absolute;
  width: 75px;
  /* Ancho de la pestaña */
  height: 40px;
  /* Altura de la pestaña */
  background: var(--card-background);
  display: flex;
  justify-content: center;
  justify-content: flex-end;
  /* Alinea el texto hacia la derecha */
  align-items: center;
  padding-right: 16px;
  font-weight: bold;
  color: #fff;
  border-bottom-right-radius: 70%;
}

#ads .card {
  width: 225px;
  height: auto;
  border-radius: 20px;
  /* Agrega esquinas redondeadas */
  cursor: pointer;
  transition: all 0.3s ease;
  margin-left: 10px;
  min-height: 150px;
  box-shadow: 5px 10px 8px rgba(0, 0, 0, 0.4);
}

#ads .card-body {
  overflow: hidden;
  /* Oculta el texto que desborda */
  border-radius: 20px;
  /* Agrega esquinas redondeadas */
  z-index: 1;
}

#ads .card:hover {
  box-shadow: 5px 10px 8px rgba(0, 0, 0, 0.4);
  /*transform: translateY(-5%);CAMBIAANIMACION*/
  transition: all 0.3s ease;
  box-shadow: var(--blueBerry) 0px 54px 55px, var(--blueBerryLight) 0px -12px 30px, var(--blueBerryLight) 0px 4px 6px, var(--blueBerryLight) 0px 12px 13px, var(--blueBerryLight) 0px -3px 5px;
}

.header-container {
  display: flex;
  align-items: center;
  position: relative;
}

#ads .progress {
  flex-grow: 1;
  margin-left: 75px;
  /* Ajusta este valor según sea necesario */
}

.title-container {
  margin-top: 10px;
  /* Espaciado adicional entre el progress bar y el tituloC */
  text-align: center;
  /* Centra el texto horizontalmente */
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  
  min-height: 70px;
  /* Coloca el texto en columna */
}

.title-container h5 {
  font-size: 12px;
  font-weight: bold;
  font-family: 'MonserratBoldItalic';
  /*SOLO Obligatorio*/
}

.title-container h5 {
  font-size: 12px;
  font-weight: bold;

}

.progress-container {
  width: 140px;
  margin-left: -15px;
  height: 20px;
}

.obligatorio-circle-no {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  /* animation: rotate 8.0s infinite linear; */
  position: absolute;
  left: -10px;
  top: -10px;
}

.text-obligatorio-no {
  color: rgb(104, 104, 104);
}

.text-obligatorio-si {
  color: var(--rojo-obligarotiasB);
}



/* @keyframes rotate {
  100% {
    transform: rotate(1turn);
  }
} */
</style>