<template>
  <div class="card card-elevated border-0 rounded-3 h-100">
    <!-- Header con título (opcional) -->
    <div v-if="title || $slots.header" class="card-header mt-3 bg-white border-0" :class="{ 'text-center': centerHeader }">
      <slot name="header">
        <h6 class="card-title text-uppercase small mb-0 fw-semibold">{{ title }}</h6>
      </slot>
    </div>
    
    <!-- Body con contenido -->
    <div class="card-body" :class="bodyClass">
      <slot></slot>
    </div>
  </div>
</template>

<script>
export default {
  name: 'CardResponsive',
  props: {
    title: {
      type: String,
      default: ''
    },
    bodyClass: {
      type: String,
      default: 'p-4'
    },
    centerHeader: {
      type: Boolean,
      default: false
    }
  }
}
</script>

<style scoped>
.card {
  transition: all 0.3s ease;
}

.card-elevated {
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 
              0 2px 4px -1px rgba(0, 0, 0, 0.06);
}

.card-elevated:hover {
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 
              0 4px 6px -2px rgba(0, 0, 0, 0.05);
  transform: translateY(-2px);
}

.card-header {
  padding: 0.75rem 1rem 0.5rem 1rem;
}

.card-body {
  padding-top: 0.5rem;
}

.card-title {
  margin: 0;
}
</style>
