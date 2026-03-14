<template>
  <div ref="chartDom" class="echarts-container" :style="{ height: height, width: width }"></div>
</template>

<script>
import { defineComponent, onMounted, onUnmounted, watch, ref } from 'vue';
import * as echarts from 'echarts';

export default defineComponent({
  name: 'EChartsVisualizer',
  props: {
    // Opción de configuración completa de ECharts
    option: {
      type: Object,
      required: true
    },
    // Altura del contenedor (por defecto 400px)
    height: {
      type: String,
      default: '400px'
    },
    // Anchura del contenedor (por defecto 100%)
    width: {
      type: String,
      default: '100%'
    }
  },
  setup(props, { expose }) {
    const chartDom = ref(null); // Referencia al elemento HTML del DOM
    let myChart = null;        // Instancia de ECharts
    let resizeObserver = null; // Observador para detectar cambios de tamaño en el div

    /**
     * Inicializa la instancia de ECharts y configura el ResizeObserver.
     */
    const initChart = () => {
      // Si ya existe una instancia, la destruimos antes de crear una nueva
      if (myChart) {
        myChart.dispose();
      }
      
      // Creamos la instancia ligada al DOM seleccionado
      myChart = echarts.init(chartDom.value);
      
      // Aplicamos la configuración inicial
      myChart.setOption(props.option);

      // --- RESPONSIVIDAD DINÁMICA ---
      // Usamos ResizeObserver para detectar cuando el contenedor cambia de tamaño
      if (resizeObserver) resizeObserver.disconnect();
      resizeObserver = new ResizeObserver(() => {
        // requestAnimationFrame asegura que el redimensionado ocurra en el próximo ciclo del navegador.
        window.requestAnimationFrame(() => {
          myChart?.resize();
        });
      });
      resizeObserver.observe(chartDom.value);
    };

    onMounted(() => {
      initChart();
      // Listener adicional para cambios globales en la ventana del navegador
      window.addEventListener('resize', () => myChart?.resize());
    });

    onUnmounted(() => {
      window.removeEventListener('resize', () => myChart?.resize());
      resizeObserver?.disconnect();
      myChart?.dispose();
    });

    /**
     * Observa cambios en la propiedad 'option'. 
     * Cuando la data o config cambian, actualizamos la gráfica sin destruirla (setOption).
     */
    watch(
      () => props.option,
      (newOption) => {
        myChart?.setOption(newOption, true);
      },
      { deep: true }
    );

    expose({
      getChartInstance: () => myChart
    });

    return {
      chartDom
    };
  }
});
</script>

<style scoped>
.echarts-container {
  min-height: 200px;
}
</style>
