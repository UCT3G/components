<template>
  <div
    class="quill-editor-custom bg-white d-flex flex-column overflow-visible position-relative"
    :class="{ highlighted: isHighlighted }"
    :style="editorStyle"
  >
    <QuillEditor
      theme="bubble"
      :content="modelValue"
      contentType="html"
      @update:content="onContentChange"
      :options="editorOptions"
      @focus="handleFocus"
      @blur="handleBlur"
      @ready="onEditorReady"
    />
  </div>
</template>

<script>
import { defineComponent, computed } from 'vue';
import { QuillEditor } from '@vueup/vue-quill';
import '@vueup/vue-quill/dist/vue-quill.bubble.css';

export default defineComponent({
  name: 'EditorTexto',
  components: {
    QuillEditor
  },
  props: {
    modelValue: {
      type: String,
      default: ''
    },
    placeholder: {
      type: String,
      default: 'Escribe aquí...'
    },
    isHighlighted: {
      type: Boolean,
      default: false
    },
    toolbarOptions: {
      type: Array,
      default: () => [
        ['bold', 'italic', 'underline', 'link'],
        [{ 'list': 'ordered'}, { 'list': 'bullet' }],
        [{ 'align': [] }],
        ['clean']
      ]
    },
    maxHeight: {
      type: String,
      default: '300px'
    },
    bounds: {
      type: String,
      default: '.custom-card'
    }
  },
  emits: ['update:modelValue', 'focus', 'blur'],
  setup(props, { emit }) {
    const editorOptions = computed(() => ({
      modules: {
        toolbar: props.toolbarOptions
      },
      placeholder: props.placeholder,
      bounds: props.bounds
    }));

    const editorStyle = computed(() => ({
      '--editor-max-height': props.maxHeight
    }));

    const onContentChange = (content) => {
      emit('update:modelValue', content);
    };

    const handleFocus = () => {
      emit('focus');
    };

    const handleBlur = () => {
      emit('blur');
    };

    const onEditorReady = (quill) => {
      quill.on('selection-change', (range) => {
        if (range && range.length > 0) {
          setTimeout(() => {
            const bounds = quill.getBounds(range.index, range.length);
            const editorRoot = quill.root;
            if (!bounds || !editorRoot) return;

            const margin = 25;
            let scrollNeeded = false;
            let newScrollTop = editorRoot.scrollTop;
            let newScrollLeft = editorRoot.scrollLeft;

            if (bounds.top < margin) {
              newScrollTop += bounds.top - margin;
              scrollNeeded = true;
            } else if (bounds.bottom > editorRoot.clientHeight - margin) {
              newScrollTop += (bounds.bottom - editorRoot.clientHeight) + margin;
              scrollNeeded = true;
            }

            if (bounds.left < margin) {
              newScrollLeft += bounds.left - margin;
              scrollNeeded = true;
            } else if (bounds.right > editorRoot.clientWidth - margin) {
              newScrollLeft += (bounds.right - editorRoot.clientWidth) + margin;
              scrollNeeded = true;
            }

            if (scrollNeeded) {
              editorRoot.scrollTo({
                top: newScrollTop,
                left: newScrollLeft,
                behavior: 'smooth'
              });
            }
          }, 50);
        }
      });
    };

    return {
      editorOptions,
      editorStyle,
      onContentChange,
      handleFocus,
      handleBlur,
      onEditorReady
    };
  }
});
</script>

<style scoped>
.quill-editor-custom {
  border: 1px solid var(--blueBerry);
  border-radius: 7px;
  margin-bottom: 20px;
}

.quill-editor-custom.highlighted {
  background-color: var(--babyBlue);
  pointer-events: auto !important;
}

:deep(.ql-container) {
  border: none;
  min-height: 150px;
  font-family: inherit;
}

:deep(.ql-editor) {
  min-height: 150px;
  max-height: var(--editor-max-height);
  overflow-y: auto;
  font-size: 14px;
  line-height: 1.4;
  word-break: break-word;
  overflow-wrap: anywhere;
}

:deep(.ql-editor ul), 
:deep(.ql-editor ol) {
  padding-left: 1.5em !important;
}

:deep(.ql-editor li) {
  margin-bottom: 5px;
}

/* Hacer las viñetas de punto más grandes y alineadas */
:deep(.ql-editor ul > li::before) {
  font-size: 20px !important; 
  line-height: 1 !important;
  vertical-align: middle;
  margin-top: -2px;
  font-weight: normal !important; /* Por defecto normal */
}

/* Solo negrita si el LI contiene un elemento strong o b */
:deep(.ql-editor ul > li:has(strong)::before),
:deep(.ql-editor ul > li:has(b)::before) {
  font-weight: bold !important;
}

/* Asegurar que los números mantengan su tamaño correcto */
:deep(.ql-editor ol > li::before) {
  font-size: 14px !important;
  font-weight: normal !important;
}

:deep(.ql-editor ol > li:has(strong)::before),
:deep(.ql-editor ol > li:has(b)::before) {
  font-weight: bold !important;
}

:deep(.ql-clipboard) {
  display: none !important;
}

/* Personalización del Tooltip Bubble */
:deep(.ql-bubble .ql-tooltip) {
  background-color: var(--blueBerryPastel) !important;
  color: var(--bs-gray-600) !important;
  border: 1px solid var(--blueBerry) !important;
  border-radius: 8px !important;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1) !important;
  max-width: 95% !important; 
  width: max-content !important;
  min-width: 120px !important;
  transform: translateX(-10px); 
}

/* Estilos para el input de URL al crear un link */
:deep(.ql-bubble .ql-tooltip input[type=text]) {
  display: block;
  width: 100%;
  border: 1px solid var(--bs-gray-300) !important;
  border-radius: 4px !important;
  padding: 5px 10px !important;
  font-size: 13px !important;
  margin-bottom: 5px !important;
  color: var(--bs-gray-700) !important;
  outline: none !important;
}

:deep(.ql-bubble .ql-tooltip input[type=text]:focus) {
  border-color: var(--blueBerry) !important;
  box-shadow: 0 0 0 2px var(--blueBerryPastel) !important;
}

/* Estilos para los enlaces dentro del tooltip (Save, Change, Remove) */
:deep(.ql-bubble .ql-tooltip a.ql-action::after) {
  content: 'Guardar';
  margin-left: 5px;
}

:deep(.ql-bubble .ql-tooltip a.ql-action),
:deep(.ql-bubble .ql-tooltip a.ql-remove) {
  color: var(--blueBerry) !important;
  font-weight: bold !important;
  text-decoration: none !important;
  font-size: 12px !important;
  cursor: pointer !important;
  padding: 4px 8px !important;
  border-radius: 4px !important;
  transition: background-color 0.2s ease !important;
}

:deep(.ql-bubble .ql-tooltip a.ql-action:hover),
:deep(.ql-bubble .ql-tooltip a.ql-remove:hover) {
  background-color: var(--blueBerryPastel) !important;
  color: var(--blueBerry) !important;
}

:deep(.ql-bubble .ql-tooltip-arrow) {
  border-bottom-color: var(--blueBerry) !important;
}

/* Iconos en negro */
:deep(.ql-bubble .ql-stroke) {
  stroke: #000 !important;
}

:deep(.ql-bubble .ql-fill) {
  fill: #000 !important;
}

:deep(.ql-bubble .ql-picker-label) {
  color: #000 !important;
}

:deep(.ql-bubble .ql-picker-label svg .ql-stroke) {
  stroke: #000 !important;
}

/* Efecto Hover en los botones */
:deep(.ql-bubble .ql-toolbar) {
  display: flex !important;
  flex-wrap: wrap !important;
  justify-content: center;
  align-items: center;
  padding: 4px !important;
}

:deep(.ql-bubble .ql-toolbar .ql-formats) {
  margin-right: 2px !important;
  display: flex !important;
  align-items: center;
}

:deep(.ql-bubble .ql-toolbar button) {
  width: 24px !important;
  height: 24px !important;
  padding: 3px !important;
  margin: 0 1px !important;
}

:deep(.ql-bubble .ql-toolbar button:hover),
:deep(.ql-bubble .ql-toolbar button.ql-active) {
  background-color: var(--bs-gray-200) !important;
}

/* Estilos para el selector desplegable (ej. alineación) */
:deep(.ql-bubble .ql-picker-options) {
  background-color: var(--blueBerryPastel) !important;
  border: 1px solid var(--blueBerry) !important;
  border-radius: 4px !important;
  padding: 5px !important;
}

:deep(.ql-bubble .ql-picker-item:hover) {
  background-color: var(--bs-gray-200) !important;
}

:deep(.ql-bubble .ql-picker-item svg .ql-stroke) {
  stroke: #000 !important;
}

:deep(.ql-bubble .ql-picker-item svg .ql-fill) {
  fill: #000 !important;
}
</style>
