<template>
  <!-- Contenedor para animación - SOLO si archivo existe -->
  <div v-if="fileExists" ref="riveContainer" class="rive-wrapper" :style="{ width, height }">
    <canvas v-show="!errorMessage" ref="canvas"></canvas>
  </div>
  
  <!-- Contenedor para errores - SIEMPRE disponible para mostrar errores -->
  <div v-if="errorMessage" class="error-message" :style="{ width, height }">
    {{ errorMessage }}
  </div>
</template>

<script>
import { defineComponent, onMounted, onBeforeUnmount, ref, watch, nextTick } from 'vue';
import { Rive, Layout, Fit, Alignment } from '@rive-app/canvas';
import { useRiveValidator } from '@/components_templates/Rive/useRiveValidator.js';

export default defineComponent({
  name: 'RivePlayer',
  props: {
    src: {
      type: String,
      required: true
    },
    width: {
      type: String,
      default: '100%'
    },
    height: {
      type: String,
      default: '100%'
    },
    autoplay: {
      type: Boolean,
      default: true
    },
    stateMachines: {
      type: [String, Array],
      default: null
    },
    artboard: {
      type: String,
      default: null
    },
    isPaused: {
      type: Boolean,
      default: false
    }
  },
  setup(props) {
    const canvas = ref(null);
    const riveContainer = ref(null);
    const errorMessage = ref(null);
    const fileExists = ref(false);
    const isValidating = ref(true);
    let riveInstance = null;
    let isCleaningUp = false;
    let debounceTimer = null;
    let intersectionObserver = null;
    const isVisible = ref(true);
    
    const { checkRiveExists } = useRiveValidator();

    // Nueva función para manejar el play/pause de forma inteligente
    const updatePlaybackState = () => {
      if (!riveInstance || isCleaningUp) return;
      
      try {
        if (isVisible.value && !props.isPaused && props.autoplay) {
          riveInstance.play();
        } else {
          riveInstance.pause();
        }
      } catch (e) {
        console.error('RivePlayer: Error actualizando estado de reproducción', e);
      }
    };

    const cleanupRiveInstance = () => {
      if (!riveInstance || isCleaningUp) return;
      
      isCleaningUp = true;
      
      try {
        // Detener animación antes de cleanup
        if (riveInstance.stop) {
          riveInstance.stop();
        }
        
        // Limpiar recursos
        if (riveInstance.cleanup) {
          riveInstance.cleanup();
        }
      } catch (e) {
        console.error('RivePlayer: Error durante cleanup', e);
      } finally {
        riveInstance = null;
        isCleaningUp = false;
      }
    };

    const setupObserver = () => {
      if (intersectionObserver) return;

      intersectionObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            isVisible.value = entry.isIntersecting;
            updatePlaybackState();
          });
        },
        {
          threshold: 0.1,
          rootMargin: '50px'
        }
      );
    };

    const validateAndInit = async () => {
      // Limpiar timer de debounce anterior
      if (debounceTimer) {
        clearTimeout(debounceTimer);
        debounceTimer = null;
      }

      errorMessage.value = null;
      isValidating.value = true;
      fileExists.value = false;

      // Cleanup de instancia anterior
      cleanupRiveInstance();
      if (!props.src) {
        isValidating.value = false;
        return;
      }
      const isRiv = props.src.toLowerCase().includes('.riv') || 
                    props.src.startsWith('blob:') || 
                    props.src.startsWith('data:');
      
      if (!isRiv) {
        errorMessage.value = 'Formato no válido';
        fileExists.value = false;
        isValidating.value = false;
        return;
      }

      // Validar que archivo existe
      const exists = await checkRiveExists(props.src);
      fileExists.value = exists;
      isValidating.value = false;

      if (!exists) {
        errorMessage.value = 'Archivo no encontrado';
        return;
      }

      await nextTick();
      initRive();

      // RE-SINCRONIZAR OBSERVADOR: Asegura que el nuevo div (post v-if) sea vigilado
      if (fileExists.value && riveContainer.value) {
        setupObserver();
        intersectionObserver.observe(riveContainer.value);
      }
    };

    const initRive = () => {
      // Solo inicializar si canvas está disponible
      if (!canvas.value || !props.src || !fileExists.value) {
        return;
      }

      try {
        riveInstance = new Rive({
          src: props.src,
          canvas: canvas.value,
          autoplay: props.autoplay,
          stateMachines: props.stateMachines,
          artboard: props.artboard,
          layout: new Layout({
            fit: Fit.Contain,
            alignment: Alignment.Center
          }),
          onLoad: () => {
            if (riveInstance && !isCleaningUp) {
              riveInstance.resizeDrawingSurfaceToCanvas();
            }
          },
          onLoadError: (error) => {
            errorMessage.value = 'Error al cargar animación';
            console.error('RivePlayer: Error en onLoadError', error);
            
            // Limpiar instancia cuando hay error de carga
            cleanupRiveInstance();
          }
        });
      } catch (e) {
        errorMessage.value = 'Error al inicializar';
        console.error('RivePlayer exception:', e);
        cleanupRiveInstance();
      }
    };

    onMounted(async () => {
      await validateAndInit();
      
      // Solo agregar listeners de resize si el archivo existe
      if (fileExists.value) {
        window.addEventListener('resize', onResize);
      }
    });

    onBeforeUnmount(() => {
      // Limpiar timer de debounce
      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }
      
      // Desconectar Intersection Observer
      if (intersectionObserver) {
        intersectionObserver.disconnect();
        intersectionObserver = null;
      }
      
      // Remover event listener
      window.removeEventListener('resize', onResize);
      
      // Cleanup de instancia Rive
      cleanupRiveInstance();
    });

    const onResize = () => {
      if (riveInstance && !isCleaningUp) {
        try {
          riveInstance.resizeDrawingSurfaceToCanvas();
        } catch (e) {
          console.error('RivePlayer: Error en resize', e);
        }
      }
    };

    // Watcher con debounce para evitar re-inicializaciones excesivas
    watch(() => props.src, () => {
      // Cancelar timer anterior si existe
      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }
      
      // Debounce de 150ms
      debounceTimer = setTimeout(() => {
        validateAndInit();
      }, 150);
    });
    
    // Watcher para pausa manual
    watch(() => props.isPaused, () => {
      updatePlaybackState();
    });

    return {
      canvas,
      riveContainer,
      errorMessage,
      isVisible,
      fileExists,
      isValidating
    };
  }
});
</script>

<style scoped>
.rive-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

canvas {
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.error-message {
  color: var(--bs-gray-500);
  padding: 8px 12px;
  border-radius: 4px;
  font-size: 12px;
  text-align: center;
}
</style>
