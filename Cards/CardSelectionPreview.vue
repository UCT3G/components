<template>
  <div class="card-selection-preview" @click="handleClick">
    <!-- Preview Slot -->
    <div class="preview-container" :style="{ minHeight: minHeight }">
      <slot name="preview"></slot>
    </div>

    <!-- Info Section -->
    <div class="card-info">
      <span v-if="badge" class="card-badge">{{ badge }}</span>
      <h6 v-if="title" class="card-title">{{ title }}</h6>
      <p v-if="description" class="card-desc">{{ description }}</p>
      
      <div v-if="statusText" class="card-status" :class="statusOk ? 'status-ok' : 'status-pending'">
        <span>{{ statusText }}</span>
      </div>
    </div>

    <!-- Action Section -->
    <div class="card-action">
      <slot name="actions">
        <span>{{ actionText }}</span>
      </slot>
    </div>
  </div>
</template>

<script>
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'CardSelectionPreview',
  props: {
    title: { type: String, default: '' },
    description: { type: String, default: '' },
    badge: { type: String, default: '' },
    statusText: { type: String, default: '' },
    statusOk: { type: Boolean, default: false },
    actionText: { type: String, default: 'Configurar →' },
    minHeight: { type: String, default: '130px' }
  },
  emits: ['click'],
  setup(props, { emit }) {
    const handleClick = () => {
      emit('click');
    };

    return { handleClick };
  }
});
</script>

<style scoped>
.card-selection-preview {
  width: 260px;
  border: 1px solid var(--bs-gray-400);
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  transition: box-shadow 0.2s ease, transform 0.2s ease, border-color 0.2s ease;
  background: white;
}

.card-selection-preview:hover {
  box-shadow: 0 8px 24px rgba(0,0,0,0.10);
  transform: translateY(-3px);
  border-color: var(--bluelight-sb);
}

.preview-container {
  background: var(--bs-gray-100);
  padding: 20px;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 130px;
}

.card-info {
  padding: 14px 16px 6px;
}

.card-badge {
  display: inline-block;
  background: linear-gradient(90deg, var(--purple-sb) 0%, var(--bluelight-sb) 100%);
  color: white;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 700;
  padding: 2px 10px;
  margin-bottom: 6px;
}

.card-title {
  font-weight: 700;
  font-size: 15px;
  margin-bottom: 2px;
  color: black;
}

.card-desc {
  font-size: 12px;
  color: var(--bs-gray-600);
  margin-bottom: 8px;
}

.card-status {
  font-size: 11px;
  font-weight: 600;
  padding: 2px 0;
}

.status-ok { color: var(--bs-form-valid-color); }
.status-pending { color: var(--bs-gray-500); }

.card-action {
  padding: 10px 16px 14px;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
}

.card-selection-preview:hover .btn-action {
  letter-spacing: 0.5px;
}
</style>
