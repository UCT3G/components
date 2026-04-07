<template>
  <div 
    class="tooltip-shell shadow-lg border" 
    :class="[
      { 'is-visible': visible },
      'align-' + align
    ]"
  >
    <div class="p-tooltip-internal">
      <div v-if="title" class="row mb-2 border-bottom pb-1 gx-0 mx-0">
        <div class="col-12 d-flex align-items-center">
          <span class="tooltip-title">{{ title }}</span>
        </div>
      </div>
      <div class="row gx-0 mx-0">
        <div class="col-12">
          <!-- Renderizado automático de filas si se pasan por props -->
          <div v-for="(row, index) in rows" :key="index" class="row-tt">
            <span class="label-tt">{{ row.label }}:</span>
            
            <template v-if="row.type === 'badge'">
              <span class="badge-tt" :class="row.variant || 'secondary'">
                {{ row.value }}
              </span>
            </template>
            <template v-else>
              <span class="value-tt" :class="row.class">{{ row.value }}</span>
            </template>
          </div>

          <!-- Slot para contenido personalizado o adicional -->
          <slot></slot>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'Tooltip',
  props: {
    title: {
      type: String,
      default: ''
    },
    visible: {
      type: Boolean,
      default: false
    },
    rows: {
      type: Array,
      default: () => []
    },
    align: {
      type: String,
      default: 'center',
      validator: (value) => ['left', 'center', 'right'].includes(value)
    }
  }
});
</script>

<style scoped>
.tooltip-shell {
    position: absolute;
    top: calc(100% + 10px);
    background: var(--blanco);
    min-width: 220px;
    max-width: 300px;
    z-index: 10000;
    opacity: 0;
    visibility: hidden;
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    pointer-events: none;
    box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1) !important;
    border-radius: 12px;
}

/* Alineaciones */
.align-center {
    left: 70%;
    transform: translateX(-50%) translateY(5px);
}
.align-left {
    left: 0;
    transform: translateY(5px);
}
.align-right {
    right: 0;
    left: auto;
    transform: translateY(5px);
}

.p-tooltip-internal {
    padding: 14px; 
}

/* Flecha del Tooltip */
.tooltip-shell::before {
    content: '';
    position: absolute;
    top: -6px;
    width: 12px;
    height: 12px;
    background: var(--blanco);
    border-top: 1px solid var(--bs-gray-200);
    border-left: 1px solid var(--bs-gray-200);
    transform: rotate(45deg);
}

.align-center::before {
    left: 30%;
    transform: translateX(-50%) rotate(45deg);
}
.align-left::before {
    left: 15px;
}
.align-right::before {
    right: 15px;
    left: auto;
}

/* Estados Visibles */
.tooltip-shell.is-visible.align-center {
    opacity: 1;
    visibility: visible;
    transform: translateX(-50%) translateY(0);
}
.tooltip-shell.is-visible.align-left,
.tooltip-shell.is-visible.align-right {
    opacity: 1;
    visibility: visible;
    transform: translateY(0);
}

.tooltip-title {
    font-size: 0.6rem; 
    font-weight: 800;
    text-transform: uppercase;
    color: var(--card-title-color);
    opacity: 0.5; 
    letter-spacing: 0.5px;
}

.row-tt {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    font-size: 0.75rem;
    margin-bottom: 6px;
    gap: 12px;
}

.label-tt {
    color: var(--card-title-color);
    opacity: 0.7;
    font-weight: 500;
}

.value-tt {
    color: var(--black);
    text-align: right;
    flex: 1; 
}

.badge-tt {
    padding: 2px 10px;
    border-radius: 50px;
    font-size: 0.62rem;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.3px;
}

/* Colores de badge por defecto */
.badge-tt.primary { background: var(--babyBlue); color: var(--purple-sb); }
.badge-tt.success { background: white; color: var(--bs-success); }
.badge-tt.secondary { background: white; color: var(--bs-gray); }

/* Responsividad básica */
@media (max-width: 480px) {
    .tooltip-shell {
        min-width: 200px;
        left: unset;
        right: 0;
        transform: translateY(5px);
    }
    .tooltip-shell::before {
        left: unset;
        right: 20px;
    }
    .tooltip-shell.is-visible {
        transform: translateY(0);
    }
}
</style>