<template>
  <section class="panel-section">
    <header 
      class="section-header-clickable d-flex align-items-center justify-content-between mb-2" 
      @click="handleToggle"
    >
      <label class="panel-section-title mb-0 cursor-pointer" :class="{ 'is-active': isInternalOpen }">
        {{ title }}
      </label>
      <DynamicSvgLoader 
        fileName="icons/chevron-down" 
        width_icon="14px" 
        height_icon="14px" 
        class="toggle-icon"
        :class="{ 'is-rotated': isInternalOpen }"
      />
    </header>
    
    <div class="section-content accordion-transition" :class="{ 'is-open': isInternalOpen }">
      <div class="accordion-content-inner pt-2">
        <slot></slot>
      </div>
    </div>
  </section>
  <hr class="my-3 opacity-10">
</template>

<script>
import { defineComponent, inject, computed, onMounted } from 'vue';
import DynamicSvgLoader from "@/components/LoaderSVG/LoaderSVG.vue";

export default defineComponent({
  name: 'ConfigSection',
  components: {
    DynamicSvgLoader
  },
  props: {
    title: String,
    isOpen: Boolean,
    id: String
  },
  emits: ['toggle'],
  setup(props, { emit }) {
    const accordionContext = inject('accordionContext', null);
    
    // Identificador único para el acordeón
    const sectionId = props.id || props.title;

    const isInternalOpen = computed(() => {
      if (accordionContext && accordionContext.isAccordion.value) {
        return accordionContext.activeSectionId.value === sectionId;
      }
      return props.isOpen;
    });

    const handleToggle = () => {
      if (accordionContext && accordionContext.isAccordion.value) {
        accordionContext.toggleSection(sectionId);
      }
      emit('toggle');
    };

    return {
      handleToggle,
      isInternalOpen
    };
  }
});
</script>

<style scoped>
.section-header-clickable {
  user-select: none;
  padding: 2px 0;
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
.section-header-clickable:hover .panel-section-title {
  color: var(--purple-sb);
}
.toggle-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.3s ease, color 0.3s ease;
  color: var(--bs-gray-500);
}

.toggle-icon.is-rotated {
  transform: rotate(180deg);
  color: var(--purple-sb);
}

.toggle-icon :deep(.loaderSVG-contend) {
  padding: 0 !important;
  display: flex !important;
  align-items: center;
  justify-content: center;
}

.toggle-icon :deep(svg) {
  fill: currentColor !important;
  display: block;
}
</style>
