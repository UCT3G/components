# UCTChart.vue (componente genérico)

```vue
<template>
  <div class="row d-flex justify-content-center p-0">
    <div class="col-12 d-flex justify-content-center contenedor-cardgrafica">
      <CardGraficas>
        <template #HeadTitulo>
          <h5 class="subtitulo">{{ tituloGrafica }}</h5>
        </template>

        <template #headBTN>
          <div class="w-100 d-flex gap-2">
            <ButtonPrimary
              v-if="permiteLog && (chartType === 'line' || chartType === 'bar')"
              :iconName="iconEscala"
              class="w-50"
              width_icon="16px"
              @click="toggleEscala"
            >
              {{ escalaLogaritmica ? 'Escala Logarítmica' : 'Escala Lineal' }}
            </ButtonPrimary>
            <ButtonPrimary
              v-else
              :iconName="iconAutoescala"
              class="w-100"
              width_icon="16px"
              @click="toggleAutoescala"
            >
              {{ autoescala ? 'Autoescala' : 'Rango fijo' }}
            </ButtonPrimary>

            <ButtonPrimary
              iconName="download.svg"
              class="w-50 d-none"
              width_icon="16px"
              @click="exportarPNG"
            >
              Exportar PNG
            </ButtonPrimary>
          </div>
        </template>

        <template #BodyContenido>
          <div class="grafica-uct">
            <component
              :is="chartComponent"
              ref="chartRef"
              class="GraficaUCT"
              :options="chartOptions"
              :data="chartData"
              @click="handleClick"
            />
          </div>
        </template>
      </CardGraficas>
    </div>

    <div v-if="mostrarTabla" class="col-12 flex-wrap d-flex justify-content-center contenedor-cardgrafica">
      <div class="grafica-uct-tabla col-12 d-flex flex-wrap">
        <div v-for="(dataObj, index) in jsonDataArray" :key="index" class="m-2 mb-4 col-5">
          <CardGraficas>
            <template #HeadTitulo>
              <h5 class="subtitulo" style="font-size: 12px;">{{ dataObj.nombre }}</h5>
            </template>
            <template #BodyContenido>
              <table class="table" style="font-size: 12px;">
                <thead>
                  <tr>
                    <th>Competencia</th>
                    <th>Valor</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(value, key) in dataObj.json_data" :key="key">
                    <td>{{ labelMode === 'firstWord' ? key.split(' ')[0] : recortar(key) }}</td>
                    <td>{{ value }}</td>
                  </tr>
                </tbody>
              </table>
            </template>
          </CardGraficas>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { defineComponent, watch, ref, computed, nextTick } from 'vue';
import { Radar, Line, Bar, Doughnut } from 'vue-chartjs';
import { Chart as ChartJS, Title, Tooltip, Legend, RadialLinearScale, PointElement, LineElement, BarElement, CategoryScale, LinearScale, Filler, ArcElement } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import CardGraficas from '@/components/Cards/CardGraficas.vue';
import ButtonPrimary from '@/components/ButtonWithIcon/ButtonPrimary.vue';

ChartJS.register(
  Title, Tooltip, Legend,
  // Escalas/cartesianos
  CategoryScale, LinearScale,
  // Radar
  RadialLinearScale,
  // Elementos
  PointElement, LineElement, BarElement, ArcElement, Filler,
  // Plugin
  ChartDataLabels
);

export default defineComponent({
  name: 'UCTChart',
  components: { Radar, Line, Bar, Doughnut, CardGraficas, ButtonPrimary },
  props: {
    jsonDataArray: { type: Array, required: true },
    max_Y: { type: Number, default: 5 },
    chartType: { type: String, default: 'radar' }, // 'radar'|'line'|'bar'|'doughnut'
    showLabels: { type: Boolean, default: true },
    textLargo: { type: Number, default: 20 },
    showValor: { type: Boolean, default: false },
    valorFontSize: { type: Number, default: 12 },
    labelColor: { type: String, default: '#FFFFFF' },
    backgroundColor: { type: String, default: 'rgba(75, 192, 192, 0.2)' },
    tituloGrafica: { type: String, default: 'Gráfica UCT' },
    palette: { type: Array, default: () => [] }, // [{bg, border}]
    mostrarTabla: { type: Boolean, default: true },
    labelMode: { type: String, default: 'trim' }, // 'trim' | 'firstWord' | 'full'
    propautoescala: { type: Boolean, default: false}
  },
  emits: ['point-click'],
  setup(props, { emit }) {
    const chartRef = ref(null);
    const escalaLogaritmica = ref(false);
    const autoescala = ref(props.autoescala); // para tipos que no soportan log

    const iconEscala = ref('toggle_off.svg');
    const iconAutoescala = ref('toggle_on.svg');

    const permiteLog = computed(() => props.chartType === 'line' || props.chartType === 'bar');

    const chartComponent = computed(() => {
      switch (props.chartType) {
        case 'line': return Line;
        case 'bar': return Bar;
        case 'doughnut': return Doughnut;
        default: return Radar;
      }
    });

    const colores = computed(() => {
      if (props.palette && props.palette.length) return props.palette;
      return [
        { bg: props.backgroundColor, border: 'rgba(75, 192, 192, 1)' },
        { bg: 'rgba(255, 99, 132, 0.2)', border: 'rgba(255, 99, 132, 1)' },
        { bg: 'rgba(54, 162, 235, 0.2)', border: 'rgba(54, 162, 235, 1)' },
        { bg: 'rgba(255, 205, 86, 0.2)', border: 'rgba(255, 205, 86, 1)' },
        { bg: 'rgba(153, 102, 255, 0.2)', border: 'rgba(153, 102, 255, 1)' },
        { bg: 'rgba(201, 203, 207, 0.2)', border: 'rgba(201, 203, 207, 1)' }
      ];
    });

    const labels = ref([]);
    const datasets = ref([]);

    const chartData = computed(() => ({ labels: labels.value, datasets: datasets.value }));

    const MaxMin_Y = ref({ min: 0, max: props.max_Y });

    const basePlugins = computed(() => ({
      legend: { display: true, position: 'top' },
      tooltip: {
        callbacks: { title: (items) => items?.[0]?.label ?? '' }
      },
      datalabels: {
        display: props.showValor,
        anchor: 'end',
        align: 'top',
        formatter: (v) => v,
        font: { size: props.valorFontSize },
        color: props.labelColor
      }
    }));

    const escalaY = computed(() => {
      if (props.chartType === 'radar' || props.chartType === 'doughnut') return null;
      return {
        type: escalaLogaritmica.value ? 'logarithmic' : 'linear',
        beginAtZero: true,
        min: 0,
        suggestedMax: props.max_Y
      };
    });

    const chartOptions = computed(() => {
      if (props.chartType === 'radar') {
        return {
          responsive: true,
          scales: {
            r: {
              beginAtZero: true,
              min: autoescala.value ? Math.max(0, MaxMin_Y.value.min - MaxMin_Y.value.min * 0.05) : 0,
              max: autoescala.value ? MaxMin_Y.value.max + MaxMin_Y.value.max * 0.05 : props.max_Y,
              ticks: { display: props.showLabels }
            }
          },
          plugins: basePlugins.value
        };
      }

      if (props.chartType === 'doughnut') {
        return { responsive: true, plugins: basePlugins.value };
      }

      // line/bar
      return {
        responsive: true,
        scales: {
          x: { type: 'category' },
          y: escalaY.value
        },
        plugins: basePlugins.value
      };
    });

    const recortar = (t) => {
      if (props.labelMode === 'full') return t;
      if (props.labelMode === 'firstWord') return t.split(' ')[0];
      return t.length > props.textLargo ? t.substring(0, props.textLargo) : t;
    };

    const buildData = (arr) => {
      if (!arr || !arr.length) return;
      labels.value = Object.keys(arr[0].json_data).map(recortar);

      const added = new Set();
      const allValues = [];

      datasets.value = arr.map((obj, i) => {
        let label = obj.nombre;
        if (added.has(label)) {
          let c = 1; while (added.has(`${label} (${c})`)) c++; label = `${label} (${c})`;
        }
        added.add(label);

        const data = Object.values(obj.json_data);
        allValues.push(...data);

        const c = colores.value[i % colores.value.length];
        const base = {
          label,
          data,
          backgroundColor: c.bg,
          borderColor: c.border,
          borderWidth: 2,
          tension: 0.15,
          fill: props.chartType !== 'line' // line sin fill por defecto
        };
        if (props.chartType === 'bar') base.borderSkipped = false;
        return base;
      });

      if (allValues.length) {
        MaxMin_Y.value.min = Math.min(...allValues);
        MaxMin_Y.value.max = Math.max(...allValues);
      }
    };

    watch(
      () => props.jsonDataArray,
      (n) => { buildData(n); nextTick(() => reRender()); },
      { immediate: true, deep: true }
    );

    const reRender = async () => {
      // Forzar actualización del canvas cuando cambian escalas
      await nextTick();
      const inst = chartRef.value?.chart;
      inst?.update();
    };

    const toggleEscala = () => {
      if (!permiteLog.value) return;
      escalaLogaritmica.value = !escalaLogaritmica.value;
      iconEscala.value = escalaLogaritmica.value ? 'toggle_on.svg' : 'toggle_off.svg';
      reRender();
    };

    const toggleAutoescala = () => {
      autoescala.value = !autoescala.value;
      iconAutoescala.value = autoescala.value ? 'toggle_on.svg' : 'toggle_off.svg';
      reRender();
    };

    const exportarPNG = () => {
      const canvas = chartRef.value?.chart?.canvas;
      if (!canvas) return;
      const enlace = document.createElement('a');
      enlace.href = canvas.toDataURL('image/png');
      enlace.download = `${props.tituloGrafica.replace(/\s+/g,'_')}.png`;
      enlace.click();
    };

    const handleClick = (_evt, _activeEls) => {
      // Puedes extender para encontrar el punto/barra clicada y emitir su info
      emit('point-click', { /* evt, active: _activeEls */ });
      console.log(_evt, _activeEls);
    };

    return {
      chartRef,
      chartComponent,
      chartData,
      chartOptions,
      iconEscala,
      iconAutoescala,
      escalaLogaritmica,
      autoescala,
      permiteLog,
      toggleEscala,
      toggleAutoescala,
      exportarPNG,
      recortar,
      handleClick
    };
  }
});
</script>

<style scoped>
.GraficaUCT { cursor: pointer; }
.grafica-uct { height: 100%; width: 100%; }
.contenedor-cardgrafica { max-width: 700px; min-width: 300px; }
</style>
