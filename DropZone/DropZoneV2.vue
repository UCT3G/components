<template>
  <section class="dropzone-v2 BackgroundUCT-colorFacultades" :class="{ 'is-disabled': disabled }">
    <div class="dropzone-v2-header">
      <div>
        <h6 class="dropzone-v2-title">{{ title }}</h6>
        <p class="dropzone-v2-subtitle">{{ selectedFiles.length }} / {{ maxFiles }} archivos</p>
      </div>

      <button
        type="button"
        class="btn btn-sm dropzone-v2-primary"
        :disabled="disabled || !canAddFiles"
        @click="openFileDialog"
      >
        <i class="bi bi-plus-lg me-1"></i>{{ buttonText }}
      </button>
    </div>

    <input
      ref="fileInput"
      class="d-none"
      type="file"
      :accept="accept"
      :multiple="multiple && maxFiles > 1"
      :disabled="disabled"
      @change="onFileInputChange"
    >

    <div
      class="dropzone-v2-area"
      :class="{ 'is-active': isDragging, 'is-full': !canAddFiles }"
      role="button"
      tabindex="0"
      @click="openFileDialog"
      @keydown.enter.prevent="openFileDialog"
      @keydown.space.prevent="openFileDialog"
      @dragenter.prevent="onDragEnter"
      @dragover.prevent="onDragOver"
      @dragleave.prevent="onDragLeave"
      @drop.prevent="onDrop"
    >
      <i class="bi bi-cloud-arrow-up dropzone-v2-icon"></i>
      <strong>{{ dropText }}</strong>
      <span>{{ helpTextComputed }}</span>
    </div>

    <div v-if="selectedFiles.length" class="dropzone-v2-toolbar">
      <span class="dropzone-v2-count">{{ selectedFiles.length }} archivo(s) listo(s)</span>
      <button type="button" class="btn btn-sm btn-link text-muted p-0" @click="clearFiles">
        Limpiar
      </button>
    </div>

    <div v-if="selectedFiles.length" class="dropzone-v2-grid">
      <article
        v-for="item in selectedFiles"
        :key="item.id"
        class="dropzone-v2-item"
      >
        <button
          v-if="allowRemove"
          type="button"
          class="dropzone-v2-remove"
          title="Quitar archivo"
          @click="removeFile(item.id)"
        >
          <i class="bi bi-x-lg"></i>
        </button>

        <div class="dropzone-v2-preview">
          <img
            v-if="item.previewUrl"
            :src="item.previewUrl"
            :alt="item.file.name"
          >
          <i v-else class="bi bi-file-earmark"></i>
        </div>

        <div class="dropzone-v2-meta">
          <strong :title="item.file.name">{{ item.file.name }}</strong>
          <span>{{ formatBytes(item.file.size) }}</span>
        </div>
      </article>
    </div>
  </section>
</template>

<script>
import { toast } from 'vue3-toastify';

export default {
  name: 'DropZoneV2',
  props: {
    modelValue: {
      type: Array,
      default: () => []
    },
    title: {
      type: String,
      default: 'Archivos'
    },
    buttonText: {
      type: String,
      default: 'Agregar archivos'
    },
    dropText: {
      type: String,
      default: 'Arrastra y suelta aqui'
    },
    helpText: {
      type: String,
      default: ''
    },
    accept: {
      type: String,
      default: 'image/jpeg,image/png,image/webp'
    },
    maxFiles: {
      type: Number,
      default: 2
    },
    maxSizeMb: {
      type: Number,
      default: 15
    },
    multiple: {
      type: Boolean,
      default: true
    },
    disabled: {
      type: Boolean,
      default: false
    },
    allowRemove: {
      type: Boolean,
      default: true
    },
    showToast: {
      type: Boolean,
      default: true
    }
  },
  emits: ['update:modelValue', 'change', 'error', 'clear', 'remove'],
  data() {
    return {
      isDragging: false,
      selectedFiles: []
    };
  },
  computed: {
    canAddFiles() {
      return this.selectedFiles.length < this.maxFiles;
    },
    helpTextComputed() {
      if (this.helpText) return this.helpText;
      return `${this.acceptLabel}. Maximo ${this.maxFiles} archivo(s), ${this.maxSizeMb} MB cada uno.`;
    },
    acceptList() {
      return this.accept
        .split(',')
        .map(item => item.trim().toLowerCase())
        .filter(Boolean);
    },
    acceptLabel() {
      return this.acceptList
        .map(item => item.replace('image/', '').replace('.', '').toUpperCase())
        .join(', ');
    }
  },
  watch: {
    modelValue: {
      immediate: true,
      handler(files) {
        if (!Array.isArray(files)) return;
        const current = this.selectedFiles.map(item => item.file);
        if (current.length === files.length && current.every((file, index) => file === files[index])) {
          return;
        }
        this.rebuildFromFiles(files);
      }
    }
  },
  beforeUnmount() {
    this.revokePreviews();
  },
  methods: {
    openFileDialog() {
      if (this.disabled || !this.canAddFiles) return;
      this.$refs.fileInput?.click();
    },
    onFileInputChange(event) {
      this.addFiles(Array.from(event.target.files || []));
      event.target.value = '';
    },
    onDragEnter() {
      if (!this.disabled && this.canAddFiles) this.isDragging = true;
    },
    onDragOver() {
      if (!this.disabled && this.canAddFiles) this.isDragging = true;
    },
    onDragLeave(event) {
      if (!event.currentTarget.contains(event.relatedTarget)) {
        this.isDragging = false;
      }
    },
    onDrop(event) {
      this.isDragging = false;
      if (this.disabled || !this.canAddFiles) return;
      this.addFiles(Array.from(event.dataTransfer.files || []));
    },
    addFiles(files) {
      const validFiles = [];
      const availableSlots = this.maxFiles - this.selectedFiles.length;

      if (availableSlots <= 0) {
        this.reportError(`Solo se admiten ${this.maxFiles} archivo(s).`);
        return;
      }

      for (const file of files) {
        if (validFiles.length >= availableSlots) break;
        if (this.validateFile(file)) validFiles.push(file);
      }

      if (files.length > availableSlots) {
        this.reportError(`Solo se agregaron ${availableSlots} archivo(s); se alcanzo el limite.`);
      }

      if (!validFiles.length) return;

      const nextItems = [
        ...this.selectedFiles,
        ...validFiles.map(file => this.createItem(file))
      ];

      this.setSelectedItems(nextItems);
    },
    validateFile(file) {
      if (!file) return false;

      if (!this.isAccepted(file)) {
        this.reportError(`${file.name}: formato no permitido.`);
        return false;
      }

      if (file.size > this.maxSizeMb * 1024 * 1024) {
        this.reportError(`${file.name}: supera ${this.maxSizeMb} MB.`);
        return false;
      }

      return true;
    },
    isAccepted(file) {
      if (!this.acceptList.length) return true;
      const name = file.name.toLowerCase();
      const type = (file.type || '').toLowerCase();

      return this.acceptList.some(rule => {
        if (rule.endsWith('/*')) return type.startsWith(rule.replace('*', ''));
        if (rule.startsWith('.')) return name.endsWith(rule);
        return type === rule;
      });
    },
    createItem(file) {
      const isImage = (file.type || '').startsWith('image/');
      return {
        id: `${file.name}-${file.size}-${file.lastModified}-${Math.random().toString(36).slice(2)}`,
        file,
        previewUrl: isImage ? URL.createObjectURL(file) : ''
      };
    },
    rebuildFromFiles(files) {
      this.revokePreviews();
      this.selectedFiles = files.slice(0, this.maxFiles).map(file => this.createItem(file));
    },
    removeFile(id) {
      const item = this.selectedFiles.find(fileItem => fileItem.id === id);
      if (!item) return;
      if (item.previewUrl) URL.revokeObjectURL(item.previewUrl);

      const nextItems = this.selectedFiles.filter(fileItem => fileItem.id !== id);
      this.setSelectedItems(nextItems);
      this.$emit('remove', item.file);
    },
    clearFiles() {
      this.revokePreviews();
      this.selectedFiles = [];
      this.emitFiles();
      this.$emit('clear');
    },
    setSelectedItems(items) {
      this.selectedFiles = items;
      this.emitFiles();
    },
    emitFiles() {
      const files = this.selectedFiles.map(item => item.file);
      this.$emit('update:modelValue', files);
      this.$emit('change', files);
    },
    revokePreviews() {
      this.selectedFiles.forEach(item => {
        if (item.previewUrl) URL.revokeObjectURL(item.previewUrl);
      });
    },
    reportError(message) {
      console.error(message);
      this.$emit('error', message);
      if (this.showToast) toast.error(message);
    },
    formatBytes(bytes) {
      if (!bytes) return '0 KB';
      if (bytes >= 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
      return `${Math.max(1, Math.round(bytes / 1024))} KB`;
    }
  }
};
</script>

<style scoped>
.dropzone-v2 {
  --dz-border: rgba(85, 96, 128, .24);
  --dz-soft: rgba(85, 96, 128, .08);
  width: 100%;
}

.dropzone-v2.is-disabled {
  opacity: .62;
  pointer-events: none;
}

.dropzone-v2-header {
  align-items: center;
  display: flex;
  gap: .75rem;
  justify-content: space-between;
  margin-bottom: .65rem;
}

.dropzone-v2-title {
  color: var(--titleBlue);
  font-size: .92rem;
  font-weight: 700;
  margin: 0;
}

.dropzone-v2-subtitle,
.dropzone-v2-count,
.dropzone-v2-area span,
.dropzone-v2-meta span {
  color: #6c757d;
  font-size: .74rem;
  margin: 0;
}

.dropzone-v2-primary {
  background: var(--blueBerry);
  border-color: var(--blueBerry);
  color: #fff;
  font-weight: 700;
}

.dropzone-v2-primary:hover,
.dropzone-v2-primary:focus {
  background: var(--blueBerryLight);
  border-color: var(--blueBerryLight);
  color: #fff;
}

.dropzone-v2-area {
  align-items: center;
  background: var(--dz-soft);
  border: 1px dashed var(--blueBerry);
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  gap: .15rem;
  justify-content: center;
  min-height: 104px;
  padding: .85rem;
  text-align: center;
  transition: background-color .15s ease, border-color .15s ease;
}

.dropzone-v2-area.is-active {
  background: var(--highlighter);
  border-style: solid;
}

.dropzone-v2-area.is-full {
  cursor: default;
}

.dropzone-v2-area strong {
  color: #343d52;
  font-size: .86rem;
}

.dropzone-v2-icon {
  color: var(--blueBerry);
  font-size: 1.55rem;
}

.dropzone-v2-toolbar {
  align-items: center;
  border-bottom: 1px solid var(--dz-border);
  display: flex;
  justify-content: space-between;
  padding: .65rem 0 .45rem;
}

.dropzone-v2-grid {
  display: grid;
  gap: .65rem;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  margin-top: .75rem;
}

.dropzone-v2-item {
  background: #fff;
  border: 1px solid var(--dz-border);
  border-radius: 8px;
  min-width: 0;
  overflow: hidden;
  position: relative;
}

.dropzone-v2-preview {
  align-items: center;
  aspect-ratio: 4 / 3;
  background: #f8f9fa;
  display: flex;
  justify-content: center;
  overflow: hidden;
}

.dropzone-v2-preview img {
  height: 100%;
  object-fit: cover;
  width: 100%;
}

.dropzone-v2-preview i {
  color: var(--blueBerryGlass);
  font-size: 2rem;
}

.dropzone-v2-remove {
  align-items: center;
  background: rgba(255, 255, 255, .94);
  border: 0;
  border-radius: 50%;
  color: #842029;
  display: flex;
  height: 28px;
  justify-content: center;
  position: absolute;
  right: .4rem;
  top: .4rem;
  width: 28px;
  z-index: 1;
}

.dropzone-v2-meta {
  display: flex;
  flex-direction: column;
  gap: .1rem;
  padding: .45rem .55rem;
}

.dropzone-v2-meta strong {
  color: #343d52;
  font-size: .78rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

@media (max-width: 575.98px) {
  .dropzone-v2-header {
    align-items: stretch;
    flex-direction: column;
  }

  .dropzone-v2-grid {
    grid-template-columns: 1fr;
  }
}
</style>
