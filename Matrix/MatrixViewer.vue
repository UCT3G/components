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
          v-if="editable"
          class="text-extra-small"
          iconName="gears-solid.svg"
          width_icon="14px"
          @clickSecondary="$emit('click-config')"
          title="Configurar matriz"
        >
        </BotonIconoSecondary>

        <!-- Cápsula Pill con Switch -->
        <div v-if="permitir_dispersion" class="bg-light rounded-pill px-3 py-1 border d-inline-flex align-items-center gap-2 shadow-xs">
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
      <div ref="wrapperRef" class="viewer-chart-wrapper position-relative h-100">
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
                <!-- Badge con conteo de colaboradores responsivo -->
                <div 
                  v-if="!esModoTrayectoria && totalColaboradoresCuadrante > 0"
                  class="popout-badge d-inline-flex align-items-center gap-1 bg-white rounded-pill shadow-sm"
                >
                  <img :src="iconUsuario" alt="Usuario" class="popout-badge-icon" />
                  <span class="popout-badge-count">{{ totalColaboradoresCuadrante }}</span>
                </div>
                <span class="popout-title fw-medium">{{ cuadranteFiltro.nombre_caja }}</span>
              </div>
            </div>

            <!-- Canvas con Avatares de Colaboradores -->
            <div class="popout-canvas position-relative z-2 flex-grow-1 w-100" style="min-height: 0;">
              <div v-if="!colaboradoresDelCuadrante.length" class="d-flex align-items-center justify-content-center h-100 text-white-50 fw-semibold">
                Sin colaboradores en esta caja
              </div>

              <div
                v-for="colab in colaboradoresDelCuadrante"
                :key="colab.id"
                class="popout-avatar-wrapper position-absolute cursor-pointer"
                :class="{
                  'popout-item-selected': colab.esSeleccionado
                }"
                :style="{ 
                  left: colab.posX + '%', 
                  top: colab.posY + '%',
                  zIndex: colab.esSeleccionado ? 30 : 10
                }"
                :title="colab.nombre + (colab.puesto ? ' - ' + colab.puesto : '')"
                @click="seleccionarColaboradorDetalle(colab)"
              >
                <div 
                  class="popout-avatar-ring"
                  :class="{ 
                    'popout-ring-selected': colab.esSeleccionado
                  }"
                  :style="{ borderColor: colab.color_borde || '#ffffff' }"
                >
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

  </div>
</template>

<script>
import { defineComponent, ref, computed, toRef, onMounted, onBeforeUnmount, watch } from 'vue';
import EChartsVisualizer from '@/components/DataCharts/EChartsVisualizer.vue';
import BotonIconoSecondary from '@/components/ButtonWithIcon/ButtonSecondary.vue';
import { useMatrixChart } from '@/components/Matrix/useMatrixChart';
import { getEmployeePhotoUrl } from '@/utils/utils';
import iconUsuario from '@/assets/images/icons/usuario.svg';

export default defineComponent({
  name: 'MatrixViewer',
  components: { EChartsVisualizer, BotonIconoSecondary },
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
    busqueda: { type: String, default: '' },
    colaboradores_seleccionados: { type: [Array, Number, String], default: () => [] },
    editable: { type: Boolean, default: false },
    permitir_dispersion: { type: Boolean, default: false }
  },
  emits: ['seleccionarCuadrante', 'update:cuadrante_seleccionado', 'configuracion-guardada', 'select-colaborador', 'click-config'],
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
    const verRejilla = ref(false);

    watch(() => props.cuadrante_seleccionado, (nuevoVal) => {
      cuadranteFiltro.value = nuevoVal;
    }, { immediate: true });

    watch(() => props.permitir_dispersion, (permitido) => {
      if (!permitido) verRejilla.value = false;
    });

    const N = computed(() => Math.round(Math.sqrt(config.value.tipo_grid || 9)));

    const emitirSeleccionColaborador = (colab) => {
      if (!props.click_perfil || !colab) return;
      const cuadrante = colab.id_caja
        ? config.value?.cajas?.find(c => c.id_caja === colab.id_caja) || null
        : null;
      emit('select-colaborador', { colaborador: colab, cuadrante });
    };

    const wrapperRef = ref(null);
    const containerWidth = ref(750);
    let resizeObserver = null;

    // Composables y Lógica Visual
    const { echartsOption, handleChartClick, iniciales, getJitter } = useMatrixChart({
      config,
      colaboradores,
      verRejilla,
      cuadranteFiltro,
      busqueda,
      ranges,
      containerWidth,
      click_perfil: toRef(props, 'click_perfil'),
      click_cuadrante: toRef(props, 'click_cuadrante'),
      colaboradores_seleccionados: toRef(props, 'colaboradores_seleccionados'),
      onSelectColaborador: (d) => {
        emitirSeleccionColaborador(d);
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

    const esModoTrayectoria = computed(() => {
      return (props.colaboradores || []).some(c => !!c.etiqueta_trayectoria);
    });

    const numeroCuadrante = computed(() => {
      if (!cuadranteFiltro.value) return '';
      return (cuadranteFiltro.value.fila - 1) * N.value + cuadranteFiltro.value.columna;
    });

    const totalColaboradoresCuadrante = computed(() => {
      if (!cuadranteFiltro.value || !props.colaboradores?.length) return 0;
      return props.colaboradores.filter(c => c.id_caja && c.id_caja === cuadranteFiltro.value.id_caja).length;
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

      // Normalizar identificadores de colaboradores seleccionados
      const rawSel = props.colaboradores_seleccionados;
      const idsSeleccionados = Array.isArray(rawSel)
        ? rawSel
        : (rawSel != null && rawSel !== '' ? [rawSel] : []);
      const haySeleccion = idsSeleccionados.length > 0;

      // Filtrar colaboradores que pertenecen a esta caja
      const colaboradoresEnCaja = props.colaboradores.filter(c => {
        if (c.id_caja && idCaja) return c.id_caja === idCaja;
        return false;
      });

      // Determinar si alguno de los seleccionados está presente en ESTA caja
      const haySeleccionEnEstaCaja = haySeleccion && colaboradoresEnCaja.some(c =>
        idsSeleccionados.some(id => id == c.id || id == c.id_usuario || id == c.id_usuario_evaluacion)
      );

      // Si hay selección en esta caja, solo mostramos los seleccionados (los demás desaparecen)
      const listaVisible = haySeleccionEnEstaCaja
        ? colaboradoresEnCaja.filter(c =>
            idsSeleccionados.some(id => id == c.id || id == c.id_usuario || id == c.id_usuario_evaluacion)
          )
        : colaboradoresEnCaja;

      return listaVisible.map(c => {
        const valXWithJitter = (c.valor_x || 0) + getJitter(c.id, 'x');
        const valYWithJitter = (c.valor_y || 0) + getJitter(c.id, 'y');

        const relX = Math.max(0, Math.min(1, (valXWithJitter - boxXMin) / pasoX));
        const relY = Math.max(0, Math.min(1, (valYWithJitter - boxYMin) / pasoY));
        
        const posX = 15 + relX * 70;
        const posY = 15 + (1 - relY) * 70;

        return {
          ...c,
          posX,
          posY,
          esSeleccionado: haySeleccionEnEstaCaja
        };
      });
    });

    const cerrarPopout = () => {
      cuadranteFiltro.value = null;
      emit('update:cuadrante_seleccionado', null);
      emit('seleccionarCuadrante', null);
    };

    const seleccionarColaboradorDetalle = (colab) => {
      emitirSeleccionColaborador(colab);
    };

    let chartTimer = null;
    const bindChartEvents = () => {
      const chart = chartRef.value?.getChartInstance();
      if (chart) chart.off('click').on('click', handleChartClick);
    };

    onMounted(() => {
      chartTimer = setTimeout(bindChartEvents, 400);
      if (wrapperRef.value) {
        if (wrapperRef.value.clientWidth > 0) {
          containerWidth.value = wrapperRef.value.clientWidth;
        }
        resizeObserver = new ResizeObserver((entries) => {
          for (const entry of entries) {
            if (entry.contentRect.width > 0) {
              containerWidth.value = Math.round(entry.contentRect.width);
            }
          }
        });
        resizeObserver.observe(wrapperRef.value);
      }
    });

    onBeforeUnmount(() => {
      if (chartTimer) clearTimeout(chartTimer);
      if (resizeObserver) resizeObserver.disconnect();
    });

    return {
      chartRef,
      config,
      cuadranteFiltro,
      echartsOption,
      verRejilla,
      numeroCuadrante,
      totalColaboradoresCuadrante,
      colaboradoresDelCuadrante,
      cerrarPopout,
      seleccionarColaboradorDetalle,
      getEmployeePhotoUrl,
      iniciales,
      colabPhotoErrors,
      iconUsuario,
      esModoTrayectoria,
      wrapperRef
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
  max-width: min(100%, 750px);
  max-height: 600px;
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
  container-type: size;
}

.matrix-popout-card {
  aspect-ratio: 1.25 / 1;
  width: min(92cqw, calc(88cqh * 1.25), 760px);
  max-width: min(92cqw, 760px);
  max-height: 88cqh;
  height: auto;
  container-type: inline-size;
  box-shadow: 0 30px 65px -12px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.35) inset;
  transition: all 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.popout-title {
  font-size: clamp(0.95rem, 2.6cqw, 1.3rem);
  line-height: 1.25;
}

.popout-badge {
  height: clamp(18px, 3.5cqw, 24px);
  padding: 0 clamp(6px, 1.2cqw, 10px);
  border: 1px solid var(--bs-gray-300);
  flex-shrink: 0;
}

.popout-badge-icon {
  width: clamp(8px, 1.5cqw, 11px);
  height: clamp(9.5px, 1.8cqw, 13px);
  display: block;
}

.popout-badge-count {
  font-size: clamp(9.5px, 1.8cqw, 12px);
  font-weight: 400;
  line-height: 1;
}

.popout-number-bg {
  font-size: clamp(80px, 20cqw, 150px);
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
  width: clamp(38px, 6.8cqw, 48px);
  height: clamp(38px, 6.8cqw, 48px);
  border-radius: 50%;
  border-width: 3.5px;
  border-style: solid;
  overflow: hidden;
  background-color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.25);
}

.popout-avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.popout-avatar-initials {
  color: black;
  font-weight: 700;
  font-size: clamp(12px, 2.2cqw, 15px);
}

/* Estado Seleccionado: Opacidad 100%, halo blanco de contraste y sombra 3D en relieve */
.popout-ring-selected {
  opacity: 1 !important;
  transform: scale(1.1);
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
