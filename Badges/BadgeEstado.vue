<template>
  <span class="status-badge" :class="`status-${variant}`">
    <span class="status-dot"></span>
    {{ text }}
  </span>
</template>

<script>
import { defineComponent } from "vue";

export default defineComponent({
  name: "BadgeEstado",
  props: {
    text: {
      type: String,
      required: true
    },
    variant: {
      type: String,
      default: "primary", // success, warning, danger, info, primary
      validator: (value) => ["success", "warning", "danger", "info", "primary"].includes(value)
    }
  }
});
</script>

<style scoped>
.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 12px;
  padding: 5px 12px;
  border-radius: 16px;
  font-size: 0.85rem;
  font-weight: 500;
  transition: all 0.3s ease;
}

.status-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  display: inline-block;
}

/* Variante Warning (Naranja) */
.status-warning {
  color: var(--bs-orange);
}

.status-warning .status-dot {
  background: var(--bs-orange);
  animation: pulse 2s ease-in-out infinite;
}

/* Variante Success (Verde) */
.status-success {
  color: var(--bs-green);
}

.status-success .status-dot {
  background: var(--bs-success);
  box-shadow: 0 0 0 2px rgba(76, 175, 80, 0.3);
}

/* Variante Danger (Rojo) */
.status-danger {
  color: var(--bs-red);
}

.status-danger .status-dot {
  background: var(--bs-red);
}

/* Variante Info (Azul) */
.status-info {
  color: var(--bs-info);
}

.status-info .status-dot {
  background: var(--bs-info);
}

@keyframes pulse {
  0%,
  100% {
    transform: scale(1);
    box-shadow: 0 0 0 3px rgba(255, 152, 0, 0.25);
  }
  50% {
    transform: scale(1.2);
    box-shadow: 0 0 0 5px rgba(255, 152, 0, 0.15);
  }
}
</style>