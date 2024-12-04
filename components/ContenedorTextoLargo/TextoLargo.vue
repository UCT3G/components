<template>
    <div class="contenedor d-flex align-items-center" @mouseover="showFullText" @mouseleave="hideFullText">
      <div class="texto-corto">{{ truncatedText }}</div>
      <div class="valor-fijo"><slot></slot></div>
      <div v-if="showingFullText" class="popup-texto-completo">{{ fullText }}</div>
    </div>
</template>
  
<script>
import { defineComponent, ref, computed } from 'vue';

export default defineComponent({
  name: 'TextoLargo',
  props: {
    text: {
      type: String,
      required: true
    },
    maxHeight: {
      type: Number,
      default: 55
    }
  },
  setup(props) {
    const showingFullText = ref(false);

    const truncatedText = computed(() => {
      if (props.text.length > 100) {
        return props.text.substring(0, 100) + '...';
      }
      return props.text;
    });

    const fullText = computed(() => props.text);

    const showFullText = () => {
      showingFullText.value = true;
    };

    const hideFullText = () => {
      showingFullText.value = false;
    };

    return {
      showingFullText,
      truncatedText,
      fullText,
      showFullText,
      hideFullText
    };
  }
});
</script>

<style scoped>
.contenedor {
  position: relative;
  width: 100%;
  height: 55px;
  overflow: hidden;
  cursor: pointer;
}

.texto-corto {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  height: 55px;
  line-height: 55px;
  width: calc(100% - 70px);
}

.valor-fijo {
  width: 60px;
  text-align: right;
}

.popup-texto-completo {
  position: fixed;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 80%;
  background: white;
  z-index: 10;
  padding: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  animation: fadeIn 0.2s ease-in-out;
  max-height: 80vh;
  overflow-y: auto;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
</style>
