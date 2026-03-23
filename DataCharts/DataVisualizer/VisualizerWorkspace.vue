<template>
  <div class="content-scrollable flex-grow-1 p-1 pt-0 mt-3" @click="handleClicked">
    <!-- Estado Vacío -->
    <div v-if="!selectedTableName" class="d-flex flex-column align-items-center justify-content-center h-100 animate__animated animate__fadeIn">
      <div class="empty-state-card p-5 text-center bg-white rounded-4 shadow-lg border-0">
        <h3 class="fw-bold text-dark mb-4">Comienza tu análisis</h3>
        <p class="text-muted mb-4 mx-auto small" style="max-width: 300px;">
          Selecciona una tabla en el panel lateral y transforma tus datos en gráficas.
        </p>
        <div class="d-flex justify-content-center col-10 mx-auto">
          <DynamicSvgLoader 
            class="large-action-icon py-2"
            width_icon="48px"
            fileName="icons/box-arrow-in-left"
            @click.stop="openSidebar"
            title="Nueva Consulta"
            :icon_active="true"
          />
        </div>
      </div>
    </div>

    <!-- Vistas persistentes con v-show y transición individual -->
    <div v-else class="explorer-workspace position-relative overflow-hidden">
      <!-- Slot para contenido personalizado arriba de la visualización (ej. KPIs) -->
      <slot name="header" :isChartMode="isChartMode"></slot>

      <!-- VISTA 1: GRÁFICAS JERÁRQUICAS -->
      <transition name="view-switch">
        <div v-show="isChartMode && chartSections.length > 0" class="p-2 w-100">
          <div v-for="(section, sIdx) in chartSections" :key="section.title" class="p-3 section-card mb-5 bg-white rounded-4 shadow-sm border position-relative overflow-hidden">
            <!-- Icono de descarga flotante para sección -->
            <DynamicSvgLoader
              class="download-btn-floating cursor-pointer transition-all"
              title="Descargar esta agrupación"
              @click.stop="downloadSection(section, sIdx)"
              fileName="icons/DAR BAJA"
              width_icon="24px"
              :icon_active="true"
            />
            <div class="section-header p-2 bg-light border-bottom d-flex align-items-center">
              <h4 class="mb-0 texto-caja">{{ section.title }}</h4>
            </div>
            <div class="section-body p-3">
              <div class="row g-4">
                <div v-for="(chart, cIdx) in section.charts" :key="chart.id" :class="getColClass(section.charts.length)">
                  <div class="chart-tile p-3 bg-white rounded-3 border h-100">
                    <EChartsVisualizer 
                      :ref="el => { if (el) setChartRef(sIdx, cIdx, el) }"
                      :option="chart.option" 
                      class="responsive-chart-tile" 
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </transition>

      <!-- VISTA 2: GRÁFICAS PLANAS -->
      <transition name="view-switch">
        <div v-show="isChartMode && chartSections.length === 0" class="p-3 w-100">
          <div class="row g-4 chart-view-cards">
            <div v-if="chartOptions.length === 0" class="col-12">
              <div class="main-chart-card bg-white rounded-4 shadow-sm border position-relative overflow-hidden">
                <DynamicSvgLoader
                  class="download-btn-floating cursor-pointer transition-all"
                  title="Descargar gráfica"
                  @click.stop="downloadMainChart()"
                  fileName="icons/DAR BAJA"
                  width_icon="24px"
                  :icon_active="true"
                />
                <div class="p-4">
                  <EChartsVisualizer ref="mainChartRef" :option="chartOption" class="responsive-chart-main" />
                </div>
              </div>
            </div>
            <div v-for="(grouped, idx) in chartOptions" :key="grouped.id" :class="getColClass(chartOptions.length)">
              <div class="grouped-chart-card bg-white rounded-4 shadow-sm border position-relative overflow-hidden">
                <DynamicSvgLoader
                  class="download-btn-floating cursor-pointer transition-all"
                  title="Descargar gráfica"
                  @click.stop="downloadOptionChart(idx, grouped.id)"
                  fileName="icons/DAR BAJA"
                  width_icon="24px"
                  :icon_active="true"
                />
                <div class="p-4">
                  <EChartsVisualizer 
                    :ref="el => { if (el) setOptionRef(idx, el) }"
                    :option="grouped.option" 
                    class="responsive-chart-grouped" 
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </transition>

      <!-- VISTA 3: TABLA -->
      <transition name="view-switch">
        <div v-show="!isChartMode" class="p-3 w-100">
          <TablaDinamica 
            :key="selectedTableName"
            :tabla_nombre="selectedTableName"
            :tablaBase="tableBase"
            :consultar_registros="externalDataTrigger"
            @finalizarRenderBody="onDataLoaded"
          />
        </div>
      </transition>
    </div>
  </div>
</template>

<script>
import { defineComponent, ref } from 'vue';
import ButtonPrimary from '@/components/ButtonWithIcon/ButtonPrimary.vue';
import EChartsVisualizer from '../EChartsVisualizer.vue';
import TablaDinamica from '@/components/TablaDinamica/TablaDinamica.vue';
import DynamicSvgLoader from "@/components/LoaderSVG/LoaderSVG.vue";

export default defineComponent({
  name: 'VisualizerWorkspace',
  components: {
    ButtonPrimary,
    EChartsVisualizer,
    TablaDinamica,
    DynamicSvgLoader
  },
  props: {
    selectedTableName: String,
    isChartMode: Boolean,
    chartSections: Array,
    chartOptions: Array,
    chartOption: Object,
    tableBase: Object,
    externalDataTrigger: Boolean
  },
  emits: ['open-sidebar', 'data-loaded', 'clicked'],
  setup(props, { emit }) {
    const chartRefs = ref({});
    const mainChartRef = ref(null);
    const optionRefs = ref({});

    const setChartRef = (sIdx, cIdx, el) => {
        if (!chartRefs.value[sIdx]) chartRefs.value[sIdx] = {};
        chartRefs.value[sIdx][cIdx] = el;
    };

    const setOptionRef = (idx, el) => {
        optionRefs.value[idx] = el;
    };

    const getColClass = (count) => {
        if (count === 1) return 'col-12';
        if (count === 2) return 'col-12 col-md-6';
        return 'col-12 col-md-6 col-lg-4';
    };

    const openSidebar = () => {
      emit('open-sidebar');
    };

    const handleClicked = () => {
      emit('clicked');
    };

    const onDataLoaded = () => {
      emit('data-loaded');
    };

    const downloadSection = async (section, sIdx) => {
        const sectionCharts = chartRefs.value[sIdx];
        if (!sectionCharts) return;

        const chartInstances = section.charts.map((_, cIdx) => sectionCharts[cIdx]?.getChartInstance()).filter(Boolean);
        if (chartInstances.length === 0) return;

        // Activar etiquetas de valor en todas las gráficas de la sección
        const originalSeries = chartInstances.map(inst => inst.getOption().series || []);
        chartInstances.forEach((inst, i) => {
            const seriesConLabels = originalSeries[i].map(s => ({
                ...s,
                label: { show: true, position: 'top', formatter: (p) => p.value != null ? (+p.value).toLocaleString('es-MX', { maximumFractionDigits: 2 }) : '', color: '#888888', fontSize: 10 }
            }));
            inst.setOption({ series: seriesConLabels }, false);
        });

        const images = chartInstances.map(inst => inst.getDataURL({
            type: 'png',
            pixelRatio: 2,
            backgroundColor: 'white'
        }));

        // Restaurar series sin etiquetas
        chartInstances.forEach((inst, i) => {
            const seriesSinLabels = originalSeries[i].map(s => ({ ...s, label: { show: false } }));
            inst.setOption({ series: seriesSinLabels }, false);
        });

        // Combinar en un canvas
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        const count = chartInstances.length;
        const cols = count === 1 ? 1 : (count === 2 ? 2 : 3);
        const rows = Math.ceil(count / cols);
        
        // Asumiendo tamaños estándar de ECharts en el workspace
        const charW = chartInstances[0].getWidth() * 2;
        const charH = chartInstances[0].getHeight() * 2;
        const padding = 40;
        const headerH = 100;

        canvas.width = charW * cols + (padding * (cols + 1));
        canvas.height = charH * rows + (padding * (rows + 1)) + headerH;

        // Fondo (color explícito, no CSS variable)
        ctx.fillStyle = '#f8f9fa';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Título de la sección
        ctx.fillStyle = '#333333';
        ctx.font = 'bold 36px Montserrat, Arial, sans-serif';
        ctx.fillText(section.title, padding, 60);

        // Dibujar cada gráfica
        const loadImages = images.map(src => {
            return new Promise((resolve) => {
                const img = new Image();
                img.onload = () => resolve(img);
                img.src = src;
            });
        });

        const loadedImages = await Promise.all(loadImages);
        
        loadedImages.forEach((img, i) => {
            const r = Math.floor(i / cols);
            const c = i % cols;
            const x = padding + c * (charW + padding);
            const y = headerH + padding + r * (charH + padding);

            // Sombra/Borde de tarjeta
            ctx.fillStyle = 'white';
            ctx.shadowColor = 'rgba(0,0,0,0.1)';
            ctx.shadowBlur = 15;
            ctx.fillRect(x - 5, y - 5, charW + 10, charH + 10);
            ctx.shadowBlur = 0;

            ctx.drawImage(img, x, y, charW, charH);
        });

        // Descargar
        const link = document.createElement('a');
        link.download = `Análisis - ${section.title}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
    };

    const downloadMainChart = () => {
        const inst = mainChartRef.value?.getChartInstance();
        if (!inst) return;
        
        // Activar etiquetas de valor para la imagen
        const currentOption = inst.getOption();
        const seriesConLabels = (currentOption.series || []).map(s => ({
            ...s,
            label: { show: true, position: s.type === 'bar' ? 'top' : 'top', formatter: (p) => p.value != null ? (+p.value).toLocaleString('es-MX', { maximumFractionDigits: 2 }) : '', color: '#888888', fontSize: 11 }
        }));
        inst.setOption({ series: seriesConLabels }, false);
        
        const link = document.createElement('a');
        link.download = `Análisis - Vista General.png`;
        link.href = inst.getDataURL({
            type: 'png',
            pixelRatio: 2,
            backgroundColor: 'white'
        });
        link.click();
        
        // Restaurar sin etiquetas
        const seriesSinLabels = (currentOption.series || []).map(s => ({ ...s, label: { show: false } }));
        inst.setOption({ series: seriesSinLabels }, false);
    };

    const downloadOptionChart = (idx, title) => {
        const inst = optionRefs.value[idx]?.getChartInstance();
        if (!inst) return;
        
        // Activar etiquetas de valor para la imagen
        const currentOption = inst.getOption();
        const seriesConLabels = (currentOption.series || []).map(s => ({
            ...s,
            label: { show: true, position: 'top', formatter: (p) => p.value != null ? (+p.value).toLocaleString('es-MX', { maximumFractionDigits: 2 }) : '', color: '#888888', fontSize: 11 }
        }));
        inst.setOption({ series: seriesConLabels }, false);
        
        const link = document.createElement('a');
        link.download = `Análisis - ${title}.png`;
        link.href = inst.getDataURL({
            type: 'png',
            pixelRatio: 2,
            backgroundColor: 'white'
        });
        link.click();
        
        // Restaurar sin etiquetas
        const seriesSinLabels = (currentOption.series || []).map(s => ({ ...s, label: { show: false } }));
        inst.setOption({ series: seriesSinLabels }, false);
    };

    return {
      getColClass,
      openSidebar,
      handleClicked,
      onDataLoaded,
      setChartRef,
      setOptionRef,
      mainChartRef,
      downloadSection,
      downloadMainChart,
      downloadOptionChart
    };
  }
});
</script>

<style scoped>
.download-btn-floating {
    position: absolute;
    top: 11px;
    right: 12px;
    z-index: 10;
    opacity: 0.7;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    --icon_color_selected: #000;
}

.download-btn-floating:hover {
    opacity: 1;
    transform: scale(1.2) translateY(-2px);
}

.download-btn-floating:hover :deep(svg) {
    fill: var(--purple-sb) !important;
}

.hover-bg-light:hover {
    background-color: var(--bs-gray-100) !important;
    transition: background-color 0.2s ease;
}

.x-small { font-size: 0.75rem; }
/* .texto-caja { font-weight: 600; color: var(--bs-gray-300); } */

.content-scrollable {
  max-height: calc(100vh - 200px); 
  overflow-y: auto;
}
.empty-state-card {
    max-width: 450px;
    border: 1px solid rgba(0,0,0,0.05) !important;
}

:deep(.large-action-icon) {
    padding: 0 !important; /* Quitar el padding de 10px del componente */
}
:deep(.large-action-icon svg) {
    width: 100% !important;
    height: 100% !important;
    display: block;
}
:deep(.large-action-icon) {
    padding: 0 !important;
    color: var(--purple-sb) !important;
    transition: all 0.2s ease;
    cursor: pointer;
}
:deep(.large-action-icon:hover) {
    transform: scale(1.15);
}
.explorer-workspace {
    max-width: 100%;
}
.responsive-chart-tile { height: 200px; max-height: 40vh; min-height: 50px; }
.responsive-chart-main { height: 450px; max-height: calc(100vh - 300px); min-height: 150px; }
.responsive-chart-grouped { height: 300px; max-height: calc(100vh - 300px); min-height: 100px; }

/* Transitions for View Switching */
.view-switch-enter-active,
.view-switch-leave-active {
    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}
.view-switch-leave-active {
    position: absolute; top: 0; left: 0; z-index: 0;
}
.view-switch-enter-active {
    position: relative; z-index: 1;
}
.view-switch-enter-from { opacity: 0; transform: translateX(50px); }
.view-switch-leave-to { opacity: 0; transform: translateX(-50px); }
</style>
