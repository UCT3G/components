<template>
  <div v-if="colaborador" class="perfil-modal">
    <!-- Header del Perfil -->
    <div class="d-flex align-items-center gap-3 mb-4">
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
      <div>
        <h5 class="mb-1 fw-bold">{{ colaborador.nombre }}</h5>
        <p class="mb-0 text-secondary small">{{ colaborador.cargo }}</p>
      </div>
    </div>

    <!-- Badge de Cuadrante -->
    <div 
      v-if="cuadrante" 
      class="d-inline-block px-3 py-1 rounded-pill text-white fw-semibold small mb-4"
      :style="{ background: cuadrante.color_hex }"
    >
      {{ cuadrante.icono || '' }} {{ cuadrante.nombre_caja }}
    </div>

    <!-- Puntajes (Ejes X e Y) -->
    <div class="scores-grid mb-4">
      <div class="d-flex flex-column gap-1 bg-light rounded-3 p-3">
        <span class="text-uppercase fw-bold small text-secondary mb-1">{{ config?.titulo_eje_x || 'Eje X' }}</span>
        <span class="score-value">{{ colaborador.valor_x }}</span>
        <div class="score-bar">
          <div 
            class="score-bar-fill"
            :style="{ width: colaborador.valor_x + '%', background: cuadrante?.color_hex || 'var(--purple-sb)' }"
          ></div>
        </div>
      </div>
      <div class="d-flex flex-column gap-1 bg-light rounded-3 p-3">
        <span class="text-uppercase fw-bold small text-secondary mb-1">{{ config?.titulo_eje_y || 'Eje Y' }}</span>
        <span class="score-value">{{ colaborador.valor_y }}</span>
        <div class="score-bar">
          <div 
            class="score-bar-fill"
            :style="{ width: colaborador.valor_y + '%', background: cuadrante?.color_hex || 'var(--purple-sb)' }"
          ></div>
        </div>
      </div>
    </div>

    <!-- Descripción del Cuadrante -->
    <div v-if="cuadrante?.descripcion" class="bg-light rounded-3 p-3 small text-secondary">
      <p class="small fw-bold text-uppercase mb-1" style="letter-spacing:0.8px;color:#6c757d">
        Perfil del cuadrante
      </p>
      <p class="mb-0">{{ cuadrante.descripcion }}</p>
    </div>
  </div>
</template>

<script>
import { defineComponent } from 'vue';
import { getEmployeePhotoUrl } from '@/utils/utils';

export default defineComponent({
  name: 'MatrixProfileDetail',
  props: {
    colaborador: { type: Object, required: true },
    cuadrante: { type: Object, default: null },
    config: { type: Object, default: null }
  },
  setup() {
    const iniciales = (nombre = '') =>
      nombre.split(' ').slice(0, 2).map(w => w[0]?.toUpperCase() || '').join('');

    return { iniciales, getEmployeePhotoUrl };
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

.scores-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.score-value {
  font-size: 28px;
  font-weight: 800;
  color: #212529;
  line-height: 1;
}

.score-bar {
  height: 4px;
  background: #e9ecef;
  border-radius: 2px;
  overflow: hidden;
  margin-top: 4px;
}

.score-bar-fill {
  height: 100%;
  border-radius: 2px;
  transition: width 0.6s ease;
}

</style>
