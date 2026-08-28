<template>
  <div class="d-flex flex-column matrix-container">
    <!-- Header: Info Slot (Izquierda) + Switch de Cápsula Pill (Derecha) -->
    <div class="viewer-header d-flex align-items-center justify-content-between mb-2">
      <!-- Slot de Información Izquierda -->
      <div class="header-info-slot">
        <slot name="header-info"></slot>
      </div>

      <!-- Acciones Derecha: Botón Configuración + Cápsula Pill con Switch -->
      <div class="d-flex align-items-center gap-2">
        <BotonIconoSecondary
          class="text-extra-small"
          iconName="gears-solid.svg"
          width_icon="14px"
          @clickSecondary="onConfiguracion"
          title="Configurar matriz"
        >
        </BotonIconoSecondary>

        <!-- Cápsula Pill con Switch -->
        <div class="bg-light rounded-pill px-3 py-1 border d-inline-flex align-items-center gap-2 shadow-xs">
          <span class="text-extra-small fw-semibold text-secondary select-none">
            {{ verRejilla ? 'Vista matriz' : 'Vista dispersión' }}
          </span>
          <div class="form-check form-switch mb-0 ps-0 d-flex align-items-center">
            <input 
              class="form-check-input ms-0 cursor-pointer" 
              type="checkbox" 
              v-model="verRejilla" 
              id="switchRejilla" 
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Chart -->
    <div class="viewer-body position-relative overflow-hidden flex-grow-1 d-flex justify-content-center align-items-center">
      <div class="viewer-chart-wrapper position-relative h-100">
        <EChartsVisualizer
          ref="chartRef"
          :option="echartsOption"
          height="100%"
          class="viewer-chart h-100 w-100"
          :class="{ 'matrix-blurred': !!cuadranteFiltro }"
        />
      </div>

      <!-- Tarjeta Flotante Elevada 3D (Pop-Out Layer Premium) -->
      <transition name="popout-fade">
        <div 
          v-if="cuadranteFiltro" 
          class="matrix-popout-overlay position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center p-3"
          @click.self="cerrarPopout"
        >
          <div 
            class="matrix-popout-card position-relative rounded-4 p-4 shadow-lg overflow-hidden d-flex flex-column"
            :style="{ backgroundColor: cuadranteFiltro.color_hex || 'var(--bs-gray-300)' }"
          >
            <!-- Número Gigante de Cuadrante al Centro -->
            <div class="popout-number-bg select-none position-absolute top-50 start-50 translate-middle pointer-events-none">
              {{ numeroCuadrante }}
            </div>

            <!-- Header de la Tarjeta Flotante -->
            <div class="popout-header d-flex align-items-center justify-content-between position-relative z-2 mb-3">
              <div class="d-flex align-items-center gap-2 text-dark">
                <span class="fs-6 fw-medium" style="font-style: italic;">{{ cuadranteFiltro.nombre_caja }}</span>
              </div>
            </div>

            <!-- Canvas con Avatares de Colaboradores -->
            <div class="popout-canvas position-relative z-2 flex-grow-1 w-100" style="min-height: 280px;">
              <div v-if="!colaboradoresDelCuadrante.length" class="d-flex align-items-center justify-content-center h-100 text-white-50 fw-semibold">
                Sin colaboradores en esta caja
              </div>

              <div
                v-for="colab in colaboradoresDelCuadrante"
                :key="colab.id"
                class="popout-avatar-wrapper position-absolute cursor-pointer"
                :style="{ left: colab.posX + '%', top: colab.posY + '%' }"
                :title="colab.nombre + (colab.cargo ? ' - ' + colab.cargo : '')"
                @click="seleccionarColaboradorDetalle(colab)"
              >
                <div class="popout-avatar-ring">
                  <img
                    v-if="colab.no_empleado && !colabPhotoErrors[colab.no_empleado]"
                    :src="getEmployeePhotoUrl(colab.no_empleado)"
                    class="popout-avatar-img"
                    @error="colabPhotoErrors[colab.no_empleado] = true"
                  />
                  <div v-else class="popout-avatar-initials">
                    {{ iniciales(colab.nombre) }}
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </transition>
    </div>

    <!-- Modal: Perfil del Colaborador -->
    <ModalSolid
      v-model:visible="modalVisible"
      :titulo="colaboradorSeleccionado ? colaboradorSeleccionado.nombre : 'Perfil'"
      size="medium"
      :fullScreenHeight="false"
    >
      <MatrixProfileDetail 
        :colaborador="colaboradorSeleccionado"
        :cuadrante="cuadranteDelSeleccionado"
        :config="config"
      />
    </ModalSolid>

    <!-- Modal: Configuración de Matriz BoxGrid -->
    <ModalSolid
      v-model:visible="modalConfigVisible"
      :titulo="tituloModalConfig"
      size="large"
      :confirm="false"
    >
      <FormBoxGrid
        :tipo_grid="tipoGridActivo"
        @guardado="onConfiguracionGuardada"
      />
    </ModalSolid>
  </div>
</template>

<script>
import { defineComponent, ref, computed, toRef, onMounted, onBeforeUnmount, watch } from 'vue';
import EChartsVisualizer from '@/components/DataCharts/EChartsVisualizer.vue';
import ModalSolid from '@/components/Modal/ModalSolid.vue';
import MatrixProfileDetail from '@/components/Matrix/MatrixProfileDetail.vue';
import BotonIconoSecondary from '@/components/ButtonWithIcon/ButtonSecondary.vue';
import { useMatrixChart } from '@/components/Matrix/useMatrixChart';
import { getEmployeePhotoUrl } from '@/utils/utils';
import FormBoxGrid from '@/screens/AdministracionCatalogos/BoxGrid/components/FormBoxGrid.vue';

export default defineComponent({
  name: 'MatrixViewer',
  components: { EChartsVisualizer, ModalSolid, MatrixProfileDetail, BotonIconoSecondary, FormBoxGrid },
  props: {
    config: { 
      type: Object, 
      default: () => ({
        tipo_grid: 9,
        titulo_eje_x: 'Eje x',
        titulo_eje_y: 'Eje Y',
        x_min: 0,
        x_max: 100,
        y_min: 0,
        y_max: 100
      })
    },
    cajas: { type: Array, default: () => [] },
    colaboradores: { type: Array, default: () => [] },
    click_perfil: { type: Boolean, default: true },
    click_cuadrante: { type: Boolean, default: true },
    cuadrante_seleccionado: { type: Object, default: null },
    busqueda: { type: String, default: '' }
  },
  emits: ['seleccionarCuadrante', 'update:cuadrante_seleccionado', 'configuracion-guardada'],
  setup(props, { emit }) {
    const chartRef = ref(null);
    const config = computed(() => ({
      tipo_grid: props.config?.tipo_grid,
      titulo_eje_x: props.config?.titulo_eje_x,
      titulo_eje_y: props.config?.titulo_eje_y,
      x_min: props.config?.x_min,
      x_max: props.config?.x_max,
      y_min: props.config?.y_min,
      y_max: props.config?.y_max,
      cajas: props.cajas || []
    }));
    
    const colaboradores = toRef(props, 'colaboradores');
    const ranges = computed(() => ({
      x_min: config.value.x_min,
      x_max: config.value.x_max,
      y_min: config.value.y_min,
      y_max: config.value.y_max
    }));

    const busqueda = computed(() => props.busqueda || '');
    const cuadranteFiltro = ref(null);
    const modalVisible = ref(false);
    const colaboradorSeleccionado = ref(null);
    const verRejilla = ref(false);

    watch(() => props.cuadrante_seleccionado, (nuevoVal) => {
      cuadranteFiltro.value = nuevoVal;
    }, { immediate: true });

    const N = computed(() => Math.round(Math.sqrt(config.value.tipo_grid || 9)));

    // Composables y Lógica Visual
    const { echartsOption, handleChartClick, iniciales, getJitter } = useMatrixChart({
      config,
      colaboradores,
      verRejilla,
      cuadranteFiltro,
      busqueda,
      ranges,
      click_perfil: toRef(props, 'click_perfil'),
      click_cuadrante: toRef(props, 'click_cuadrante'),
      onSelectColaborador: (d) => {
        if (!props.click_perfil) return;
        colaboradorSeleccionado.value = d;
        modalVisible.value = true;
      },
      onSelectCuadrante: (caja) => {
        if (!props.click_cuadrante) return;
        const yaFiltrado = cuadranteFiltro.value?.fila === caja.fila && cuadranteFiltro.value?.columna === caja.columna;
        cuadranteFiltro.value = yaFiltrado ? null : caja;
        emit('update:cuadrante_seleccionado', cuadranteFiltro.value);
        emit('seleccionarCuadrante', cuadranteFiltro.value);
      }
    });

    const colabPhotoErrors = ref({});

    const cuadranteDelSeleccionado = computed(() =>
      colaboradorSeleccionado.value?.id_caja
        ? config.value?.cajas?.find(c => c.id_caja === colaboradorSeleccionado.value.id_caja) || null
        : null
    );

    const numeroCuadrante = computed(() => {
      if (!cuadranteFiltro.value) return '';
      return (cuadranteFiltro.value.fila - 1) * N.value + cuadranteFiltro.value.columna;
    });

    const colaboradoresDelCuadrante = computed(() => {
      if (!cuadranteFiltro.value || !props.colaboradores.length) return [];
      const fila = cuadranteFiltro.value.fila;
      const col = cuadranteFiltro.value.columna;
      const idCaja = cuadranteFiltro.value.id_caja;

      const xMin = config.value.x_min;
      const xMax = config.value.x_max;
      const yMin = config.value.y_min;
      const yMax = config.value.y_max;

      const pasoX = (xMax - xMin) / N.value;
      const pasoY = (yMax - yMin) / N.value;

      const boxXMin = xMin + (col - 1) * pasoX;
      const boxYMin = yMin + (fila - 1) * pasoY;

      return props.colaboradores.filter(c => {
        if (c.id_caja && idCaja) return c.id_caja === idCaja;
        return false;
      }).map(c => {
        const valXWithJitter = (c.valor_x || 0) + getJitter(c.id, 'x');
        const valYWithJitter = (c.valor_y || 0) + getJitter(c.id, 'y');

        const relX = Math.max(0, Math.min(1, (valXWithJitter - boxXMin) / pasoX));
        const relY = Math.max(0, Math.min(1, (valYWithJitter - boxYMin) / pasoY));
        
        const posX = 15 + relX * 70;
        const posY = 15 + (1 - relY) * 70;

        return {
          ...c,
          posX,
          posY
        };
      });
    });

    const cerrarPopout = () => {
      cuadranteFiltro.value = null;
      emit('update:cuadrante_seleccionado', null);
      emit('seleccionarCuadrante', null);
    };

    const seleccionarColaboradorDetalle = (colab) => {
      if (!props.click_perfil) return;
      colaboradorSeleccionado.value = colab;
      modalVisible.value = true;
    };

    let chartTimer = null;
    const bindChartEvents = () => {
      const chart = chartRef.value?.getChartInstance();
      if (chart) chart.off('click').on('click', handleChartClick);
    };

    onMounted(() => {
      chartTimer = setTimeout(bindChartEvents, 400);
    });

    onBeforeUnmount(() => {
      if (chartTimer) clearTimeout(chartTimer);
    });

    const modalConfigVisible = ref(false);
    const tipoGridActivo = computed(() => config.value?.tipo_grid);
    const tituloModalConfig = computed(() =>
      tipoGridActivo.value ? `CONFIGURAR MATRIZ ${tipoGridActivo.value}-BOX` : 'CONFIGURAR MATRIZ'
    );

    const onConfiguracion = () => modalConfigVisible.value = true;
    const onConfiguracionGuardada = () => {
      modalConfigVisible.value = false;
      emit('configuracion-guardada');
    };

    return {
      chartRef, 
      config, 
      cuadranteFiltro, 
      modalVisible, 
      colaboradorSeleccionado,
      echartsOption, 
      cuadranteDelSeleccionado, 
      verRejilla,
      numeroCuadrante,
      colaboradoresDelCuadrante,
      cerrarPopout,
      seleccionarColaboradorDetalle,
      getEmployeePhotoUrl,
      iniciales,
      colabPhotoErrors,
      onConfiguracion,
      modalConfigVisible,
      tipoGridActivo,
      tituloModalConfig,
      onConfiguracionGuardada
    };
  }
});
</script>

<style scoped>
.viewer-header { flex-shrink: 0; }
 
.viewer-body { 
  flex: 1; 
  min-height: 0; 
  position: relative; 
  display: flex;
  justify-content: center;
  align-items: center;
}

.viewer-chart-wrapper {
  height: 100%;
  aspect-ratio: 1.25 / 1;
  max-width: 100%;
  max-height: 100%;
  margin: 0 auto;
}

.viewer-body :deep(.echarts-container) { 
  height: 100% !important; 
  width: 100% !important;
}

.matrix-blurred {
  filter: blur(1px);
  opacity: 0.98;
  transition: all 0.4s ease;
}

.matrix-popout-overlay {
  background: rgba(255, 255, 255, 0.04);
  backdrop-filter: blur(1.5px);
  z-index: 100;
}

.matrix-popout-card {
  width: 92%;
  max-width: 580px;
  height: 88%;
  max-height: 450px;
  box-shadow: 0 30px 65px -12px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.35) inset;
  transition: all 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.popout-number-bg {
  font-size: 100px;
  font-weight: 900;
  color: #ffffff;
  line-height: 1;
  z-index: 1;
}

.popout-avatar-wrapper {
  transform: translate(-50%, -50%);
  transition: transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
  cursor: pointer;
}

.popout-avatar-wrapper:hover {
  transform: translate(-50%, -50%) scale(1.3);
  z-index: 50 !important;
}

.popout-avatar-ring {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  border: 3.5px solid white;
  overflow: hidden;
  background-color: white;
  display: flex;
  align-items: center;
  justify-content: center;
}

.popout-avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.popout-avatar-initials {
  color: black;
  font-weight: 700;
  font-size: 14px;
}

.popout-fade-enter-active,
.popout-fade-leave-active {
  transition: all 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.popout-fade-enter-from,
.popout-fade-leave-to {
  opacity: 0;
  transform: scale(0.85);
}
</style>
