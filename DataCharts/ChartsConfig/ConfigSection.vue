<template>
  <section class="panel-section">
    <header 
      class="section-header-clickable d-flex align-items-center justify-content-between mb-2" 
      @click="handleToggle"
    >
      <label class="panel-section-title mb-0 cursor-pointer" :class="{ 'is-active': isOpen }">
        {{ title }}
      </label>
    </header>
    
    <div class="section-content accordion-transition" :class="{ 'is-open': isOpen }">
      <div class="accordion-content-inner pt-2">
        <slot></slot>
      </div>
    </div>
  </section>
</template>

<script>
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'ConfigSection',
  props: {
    title: String,
    isOpen: Boolean
  },
  emits: ['toggle'],
  setup(props, { emit }) {
    const handleToggle = () => {
      emit('toggle');
    };

    return {
      handleToggle
    };
  }
});
</script>

<style scoped>
.section-header-clickable {
  user-select: none;
  padding: 4px 0;
  cursor: pointer;
}

.panel-section-title {
  transition: color 0.3s ease;
  font-weight: 600;
}

.panel-section-title.is-active {
  color: var(--purple-sb) !important;
}

.accordion-transition {
  display: grid;
  grid-template-rows: 0fr;
  transition: grid-template-rows 0.3s ease-out, opacity 0.2s ease;
  opacity: 0;
  overflow: hidden;
}

.accordion-transition.is-open {
  grid-template-rows: 1fr;
  opacity: 1;
}

.accordion-content-inner {
  min-height: 0;
}

.chevron-icon {
  font-size: 0.8rem;
  color: #adb5bd;
}

.chevron-icon.rotated {
  transform: rotate(-90deg);
}

.section-header-clickable:hover .panel-section-title {
  color: var(--purple-sb);
}
</style>
