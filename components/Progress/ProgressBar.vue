<template>
  <div
    class="progress"
    role="progressbar"
    :aria-valuenow="avance"
    aria-valuemin="0"
    aria-valuemax="100"
  >
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
  },
  methods: {
    getProgressBarStyle(avance) {
      let background;
      if (avance >= 0 && avance <= 24) {
        background =
          "linear-gradient(110deg, #f693a4 0, #e9829a 25%, #d86c8f 50%, #c65785 75%, #b7457e 100%)"; // Morado
      } else if (avance >= 25 && avance <= 49) {
        background =
          "linear-gradient(110deg, #edb78d 0, #e4a67e 25%, #d8906c 50%, #cb7a5c 75%, #c26851 100%)"; // Rosa
      } else if (avance >= 50 && avance <= 74) {
        background =
          "linear-gradient(110deg, #ffffaf 0, #ffffa6 25%, #f2f29d 50%, #d7dd94 75%, #bfca8b 100%)"; // Amarillo
      } else if (avance >= 75 && avance <= 90) {
        background =
          "linear-gradient(110deg, #e6ff99 0, #ceff9b 16.67%, #b5ff9d 33.33%, #9df29d 50%, #86e49d 66.67%, #72d89d 83.33%, #60ce9e 100%)"; // Verde
      } else {
        background =
          "linear-gradient(110deg, #9fb7f5 0, #6c90d8 50%, #2c6bbb 100%)"; // Cian
      }
      return {
        width: avance + "%",
        background: background,
      };
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
  border-radius: 10px;
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
  font-weight: bold;
  white-space: nowrap;
  font-size: smaller;
}
</style>
