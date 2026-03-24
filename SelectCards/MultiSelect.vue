<template>
  <div class="skills-section">
    <h5 class="section-title">
      {{ title }}
      <span v-if="required" class="text-danger">*</span>
    </h5>
    
    <!-- Vista del selector cuando NO está activo -->
    <div v-if="!isActive" class="skills-preview-wrapper">
      <div
        class="skills-input-container"
        @click="isActive = true"
        :class="{ 'focused': isActive }"
      >
        <div class="skills-chips-wrapper" v-if="modelValue.length">
          <div v-for="id in modelValue" :key="id" class="skill-chip">
            <span class="skill-chip-text texto-caja">{{ getItemById(id)?.nombre }}</span>
            <button type="button" class="skill-chip-remove" @click.stop="removeItem(id)">
              <i class="fas fa-times"></i>
            </button>
          </div>
        </div>
        <div v-if="!modelValue.length" class="skills-placeholder">
          {{ placeholder }}
        </div>
        <input type="hidden" :value="modelValue.join(',')" :required="required" />
      </div>

      <div class="skills-info mt-3" v-if="modelValue.length">
        <div class="d-flex justify-content-between align-items-center">
          <span class="text-muted small">
            {{ modelValue.length }} {{ itemName }}{{ modelValue.length !== 1 ? 's' : '' }} seleccionada{{ modelValue.length !== 1 ? 's' : '' }}
          </span>
        </div>
      </div>
    </div>

    <!-- GridSelector cuando está activo -->
    <div v-if="isActive" class="selector-container">
      <GridSelector
        :items="items"
        :selected="modelValue"
        :title="selectorTitle"
        :closeText="closeText"
        @update:selected="handleUpdate"
        @close="isActive = false"
      />
    </div>
  </div>
</template>

<script>
import { defineComponent, ref } from 'vue'
import GridSelector from '@/components/SelectCards/GridSelector.vue'

export default defineComponent({
  name: 'SkillsSelector',
  components: { GridSelector },
  props: {
    modelValue: {
      type: Array,
      default: () => []
    },
    items: {
      type: Array,
      required: true
    },
    title: {
      type: String,
      default: ''
    },
    selectorTitle: {
      type: String,
      default: 'Selecciona'
    },
    placeholder: {
      type: String,
      default: 'Haz clic para seleccionar...'
    },
    closeText: {
      type: String,
      default: 'Listo'
    },
    itemName: {
      type: String,
      default: 'habilidad'
    },
    required: {
      type: Boolean,
      default: false
    }
  },
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    const isActive = ref(false)

    const getItemById = (id) => {
      return props.items.find(i => i.id === id)
    }

    const removeItem = (id) => {
      const newValue = props.modelValue.filter(itemId => itemId !== id)
      emit('update:modelValue', newValue)
    }

    const handleUpdate = (newSelection) => {
      emit('update:modelValue', newSelection)
    }

    return {
      isActive,
      getItemById,
      removeItem,
      handleUpdate
    }
  }
})
</script>

<style scoped>
.selector-container {
  border-radius: 12px;
  overflow: hidden;
  background: white;
  border: 2px solid var(--bs-gray-200);
}

.skills-info {
  background: white;
  border-radius: 10px;
  padding: 0.75rem 1rem;
  border: 1px solid var(--bs-gray-300);
}

.skills-preview-wrapper {
  position: relative;
}

.section-title {
  font-size: 1.04rem;
  font-weight: 600;
  color: var(--bs-gray-dark);
  padding-bottom: 0.75rem;
}

.skills-section {
  background: var(--bs-gray-100);
  border-radius: 16px;
  padding: 1.5rem;
  height: 100%;
  border: 1px solid var(--bs-gray-200);
  transition: all 0.3s ease;
}

.skills-section:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.skills-input-container {
  min-height: 120px;
  border-radius: 12px;
  background: white;
  border: 2px dashed var(--bs-gray-300);
  padding: 1rem;
  cursor: pointer;
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  gap: 0.5rem;
  transition: all 0.3s ease;
}

.skills-input-container:hover {
  border-color: var(--purple-sb);
  background: var(--bs-gray-200);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(71, 72, 75, 0.1);
}

.skills-placeholder {
  width: 100%;
  text-align: center;
  color: var(--bs-gray-500);
  font-size: 1rem;
  padding: 2rem 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.skills-chips-wrapper {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  width: 100%;
}

.skill-chip {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  background: var(--bluelight-sb-70);
  color: white;
  padding: 0.25rem 0.5rem;
  border-radius: 1rem;
  font-size: 0.85rem;
  font-weight: 500;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.skill-chip-text {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-size: 0.8rem;
  min-width: 0;
}

.skill-chip-remove {
  background: var(--rojoNormal);
  border: none;
  color: white;
  border-radius: 50%;
  width: 18px;
  height: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.7rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.skill-chip-remove:hover {
  background: var(--bs-gray-300);
  transform: scale(1.1);
}
</style>