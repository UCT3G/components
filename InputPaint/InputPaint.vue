<template>
  <div
    ref="areaDibujo"
    class="area-dibujo"
    @mousedown="empezarDibujo"
    @mousemove="dibujar"
    @mouseup="terminarDibujo"
    @mouseleave="terminarDibujo"
  >
    <canvas ref="canvas"></canvas>
  </div>
  <button @click="limpiarCanvas">Limpiar</button>
</template>

<script>
import { defineComponent, onBeforeUnmount, onMounted, ref } from "vue";

export default defineComponent({
  setup() {
    const canvas = ref(null);
    const ctx = ref(null);
    const dibujando = ref(false);
    const ultimaX = ref(0);
    const ultimaY = ref(0);

    const empezarDibujo = (e) => {
      dibujando.value = true;
      [ultimaX.value, ultimaY.value] = [e.offsetX, e.offsetY];
    };

    const dibujar = (e) => {
      if (!dibujando.value) return;
      ctx.value.beginPath();
      ctx.value.moveTo(ultimaX.value, ultimaY.value);
      ctx.value.lineTo(e.offsetX, e.offsetY);
      ctx.value.stroke();
      [ultimaX.value, ultimaY.value] = [e.offsetX, e.offsetY];
    };

    const terminarDibujo = () => {
      dibujando.value = false;
    };

    const limpiarCanvas = () => {
      ctx.value.clearRect(0, 0, canvas.value.width, canvas.value.height);
    };

    const redimensionarCanvas = () => {
      canvas.value.width = canvas.value.offsetWidth;
      canvas.value.height = canvas.value.offsetHeight;
      ctx.value.strokeStyle = "#000";
      ctx.value.lineJoin = "round";
      ctx.value.lineCap = "round";
      ctx.value.lineWidth = 5;
    };

    onMounted(() => {
      ctx.value = canvas.value.getContext("2d");
      redimensionarCanvas();
      window.addEventListener("resize", redimensionarCanvas);
    });

    onBeforeUnmount(() => {
      window.removeEventListener("resize", redimensionarCanvas);
    });

    return {
      canvas,
      empezarDibujo,
      dibujar,
      terminarDibujo,
      limpiarCanvas,
    };
  },
});
</script>

<style scoped>
.area-dibujo {
  width: 100%;
  height: 400px;
  position: relative;
}

canvas {
  width: 100%;
  height: 100%;
  border: 1px solid #ccc;
}
</style>
