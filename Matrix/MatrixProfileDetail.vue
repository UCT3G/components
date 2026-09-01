<template>
  <div v-if="colaborador" class="perfil-modal text-start">
    <!-- Header del Perfil -->
    <div class="d-flex align-items-center gap-3 mb-3 pb-3 border-bottom">
      <div v-if="colaborador.no_empleado" class="foto-container-modal">
        <img 
          :src="getEmployeePhotoUrl(colaborador.no_empleado)" 
          :alt="colaborador.nombre"
          class="foto-perfil-modal"
          :style="{ borderColor: cuadrante?.color_hex || 'var(--purple-sb)' }"
        />
      </div>
      <div 
        v-else
        class="avatar-lg" 
        :style="{ background: cuadrante?.color_hex || 'var(--purple-sb)' }"
      >
        {{ iniciales(colaborador.nombre) }}
      </div>
      <div class="flex-grow-1">
        <h5 class="mb-1 fw-bold text-dark">{{ colaborador.nombre }}</h5>
        <p class="mb-2 text-secondary small">{{ colaborador.puesto || colaborador.cargo || 'Evaluado' }}</p>
        
        <!-- Chips compactos de Cuadrante y Puntuaciones -->
        <div class="d-flex flex-wrap align-items-center gap-2">
          <span 
            v-if="cuadrante" 
            class="badge rounded-pill text-white px-2 py-1 small fw-semibold"
            :style="{ background: cuadrante.color_hex || 'var(--purple-sb)' }"
          >
            {{ cuadrante.nombre_caja }}
          </span>
          <span v-if="colaborador.valor_x !== undefined && colaborador.valor_x !== null" class="badge bg-light text-dark border px-2 py-1 small">
            {{ config?.titulo_eje_x || 'X' }}: <strong>{{ colaborador.valor_x }}</strong>
          </span>
          <span v-if="colaborador.valor_y !== undefined && colaborador.valor_y !== null" class="badge bg-light text-dark border px-2 py-1 small">
            {{ config?.titulo_eje_y || 'Y' }}: <strong>{{ colaborador.valor_y }}</strong>
          </span>
        </div>
      </div>
    </div>

    <!-- Spinner de Carga de Requisitos -->
    <div v-if="loadingAvance" class="py-4 d-flex flex-column align-items-center justify-content-center">
      <LoadingUCT :blockFullScreem="false" style="max-width: 100px;" />
      <span class="text-muted small mt-2">Cargando requisitos...</span>
    </div>

    <!-- Bloque de Avance y Requisitos -->
    <div v-else-if="avanceData">
      <!-- Tarjeta de Estado General -->
      <div class="pe-2 border rounded-3 p-3 bg-light text-start mb-3">
        <h6 :class="['fw-bold mb-1', avanceData.todo_completo ? 'text-success' : 'text-danger']">
          {{ avanceData.todo_completo ? 'Evaluación Completa' : 'Evaluación Incompleta' }}
        </h6>
        <p class="small mb-0 text-muted">
          {{ avanceData.todo_completo 
            ? 'Todos los requisitos del perfil y psicométricos se han registrado con éxito.' 
            : 'La evaluación no cuenta con todos los registros necesarios.' 
          }}
        </p>
      </div>

      <!-- Columnas de Ponderaciones y Psicométricos -->
      <div class="row g-2">
        <!-- Ponderaciones -->
        <div class="col-12 col-sm-6">
          <h6 class="fw-bold small mb-2 text-secondary text-uppercase" style="letter-spacing: 0.5px;">
            Ponderaciones
          </h6>
          <div v-if="!avanceData.ponderaciones || avanceData.ponderaciones.length === 0" class="text-muted small py-2 text-center bg-white rounded border">
            Sin ponderaciones.
          </div>
          <div v-else class="d-flex flex-column gap-1">
            <BorderCard
              v-for="pond in avanceData.ponderaciones"
              :key="pond.id_ponderacion"
              :text="pond.nombre"
              :borderColor="pond.completado ? 'var(--bs-success)' : 'var(--bs-danger)'"
              :icon="pond.completado ? 'icons/check-square' : 'icons/hourglass'"
              :iconTooltip="pond.completado ? 'Listo' : 'Pendiente'"
            />
          </div>
        </div>

        <!-- Psicométricos -->
        <div class="col-12 col-sm-6">
          <h6 class="fw-bold small mb-2 text-secondary text-uppercase" style="letter-spacing: 0.5px;">
            Psicométricos
          </h6>
          <div v-if="!avanceData.psicometricos || Object.keys(avanceData.psicometricos).length === 0" class="text-muted small py-2 text-center bg-white rounded border">
            Sin psicométricos.
          </div>
          <div v-else class="d-flex flex-column gap-1">
            <BorderCard
              v-for="(psico, key) in avanceData.psicometricos"
              :key="key"
              :text="psico.nombre"
              :borderColor="psico.completado ? 'var(--bs-success)' : 'var(--bs-danger)'"
              :icon="psico.completado ? 'icons/check-square' : 'icons/hourglass'"
              :iconTooltip="psico.completado ? 'Listo' : 'Pendiente'"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Sin datos de avance -->
    <div v-else class="text-center text-muted py-3 small bg-light rounded-3 border">
      No se encontró información de requisitos para esta evaluación.
    </div>
  </div>
</template>

<script>
import { defineComponent, ref, watch } from 'vue';
import { useStore } from 'vuex';
import { getEmployeePhotoUrl } from '@/utils/utils';
import BorderCard from '@/components/Cards/BorderCard.vue';
import LoadingUCT from '@/components/Loading/Loading.vue';

export default defineComponent({
  name: 'MatrixProfileDetail',
  components: {
    BorderCard,
    LoadingUCT
  },
  props: {
    colaborador: { type: Object, required: true },
    cuadrante: { type: Object, default: null },
    config: { type: Object, default: null }
  },
  setup(props) {
    const store = useStore();
    const loadingAvance = ref(false);
    const avanceData = ref(null);

    const iniciales = (nombre = '') =>
      nombre.split(' ').slice(0, 2).map(w => w[0]?.toUpperCase() || '').join('');

    const fetchAvance = async () => {
      const idUsuarioEvaluacion = props.colaborador?.id_usuario_evaluacion || props.colaborador?.id;
      if (!idUsuarioEvaluacion) {
        avanceData.value = null;
        return;
      }
      loadingAvance.value = true;
      try {
        avanceData.value = await store.dispatch("EvaluacionesBoxGrid/getAvanceEvaluacion", {
          idUsuarioEvaluacion,
        });
      } catch (error) {
        console.error("Error al obtener avance en MatrixProfileDetail:", error);
        avanceData.value = null;
      } finally {
        loadingAvance.value = false;
      }
    };

    watch(() => props.colaborador, fetchAvance, { immediate: true });

    return { 
      iniciales, 
      getEmployeePhotoUrl,
      loadingAvance,
      avanceData
    };
  }
});
</script>

<style scoped>
.avatar-lg {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-weight: 700;
  font-size: 18px;
  flex-shrink: 0;
  box-shadow: 0 4px 12px rgba(0,0,0,0.2);
}

.foto-container-modal {
  width: 56px;
  height: 56px;
  flex-shrink: 0;
}

.foto-perfil-modal {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}
</style>
