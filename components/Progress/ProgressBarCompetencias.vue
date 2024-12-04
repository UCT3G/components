<template>
  <div class="progress" role="progressbar" :aria-valuenow="avance" aria-valuemin="0" aria-valuemax="100">
    <div class="progress-bar" :style="getProgressBarStyle(avance)"></div>
    <div class="progress-text" :style="getProgressTextStyle(avance)">
      {{ avance.toFixed(2) }}%
    </div>
  </div>
</template>

<script>
export default {
  props: {
    avance: {
      type: Number,
      required: true,
    },
    condicionBackground: {
      type: Boolean,
      default: false,
    },
  },
  methods: {
    getProgressBarStyle(avance) {
      let background;
      if(!this.condicionBackground){
        if (avance >= 0 && avance <= 24) {
          background = 'rgb(255, 0, 255)'; // Morado
        } else if (avance >= 25 && avance <= 49) {
          background = 'rgb(237, 30, 121)'; // Rosa
        } else if (avance >= 50 && avance <= 74) {
          background = 'rgb(255, 255, 0)'; // Amarillo
        } else if (avance >= 75 && avance <= 90) {
          background = 'rgb(0, 255, 0)'; // Verde
        } else {
          background = 'rgb(0, 0, 255)'; // Cian
        }
        return {
          width: avance + '%',
          background: background
        };
      }else{
        return {
          width: avance + '%',
          background: 'var(--haze)'
        };
      }
      
    },
    getProgressTextStyle(avance) {
      let color;
      if (avance >= 0 && avance < 100) {
        color = "#4d4d4d";
      } else {
        color = "#ffffff";
      }
      return {
        color: color,
      };
    },
  },
};
</script>

<style scoped>
.progress {
  position: relative;
  height: 20px;
  background-color: #e9ecef;
  border-radius: 5px;
  overflow: hidden;
  width: 100%;
}

.progress-bar {
  border-radius: 10px;
  margin: 3.5px;
  transition: width 0.6s ease;
}

.progress-text {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-weight: bolder !important;
  white-space: nowrap;
  font-size: smaller;
}
</style>
