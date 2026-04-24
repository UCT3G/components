<template>
  <div class="microphone-recorder" :class="{ 'is-recording': grabando }">
    <button 
      type="button" 
      class="btn btn-primary rounded-circle d-flex align-items-center justify-content-center shadow-sm mic-btn"
      @click="toggleGrabacion"
      :title="grabando ? 'Detener Grabación' : 'Grabar Audio'"
    >
      <i class="bi" :class="grabando ? 'bi-stop-fill' : 'bi-mic-fill'"></i>
    </button>
    
    <!-- Animación de ondas cuando está grabando -->
    <div v-if="grabando" class="recording-waves">
      <span></span><span></span><span></span>
    </div>
  </div>
</template>

<script>
import { ref, onUnmounted } from 'vue';

export default {
  name: 'MicrophoneRecorder',
  emits: ['audio-captured'],
  setup(props, { emit }) {
    const grabando = ref(false);
    let mediaRecorder = null;
    let audioChunks = [];

    const iniciarGrabacion = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaRecorder = new MediaRecorder(stream);
        audioChunks = [];

        mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            audioChunks.push(event.data);
          }
        };

        mediaRecorder.onstop = () => {
          const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
          emit('audio-captured', audioBlob);
          // Liberar el micrófono
          stream.getTracks().forEach(track => track.stop());
        };

        mediaRecorder.start();
        grabando.value = true;
      } catch (err) {
        console.error("Error accediendo al micrófono:", err);
        alert("No se pudo acceder al micrófono. Por favor revisa los permisos.");
      }
    };

    const detenerGrabacion = () => {
      if (mediaRecorder && mediaRecorder.state !== 'inactive') {
        mediaRecorder.stop();
        grabando.value = false;
      }
    };

    const toggleGrabacion = () => {
      if (grabando.value) {
        detenerGrabacion();
      } else {
        iniciarGrabacion();
      }
    };

    onUnmounted(() => {
      detenerGrabacion();
    });

    return {
      grabando,
      toggleGrabacion
    };
  }
};
</script>

<style scoped>
.microphone-recorder {
  position: relative;
  display: inline-block;
}

.mic-btn {
  width: 50px;
  height: 50px;
  font-size: 1.5rem;
  transition: all 0.3s ease;
  z-index: 2;
  position: relative;
}

.is-recording .mic-btn {
  background-color: var(--close) !important;
  border-color: var(--close) !important;
  animation: pulse-red 1.5s infinite;
}

.recording-waves {
  position: absolute;
  top: 50%;
  right: 60px; /* Al lado del botón */
  transform: translateY(-50%);
  display: flex;
  align-items: center;
  gap: 3px;
  height: 20px;
}

.recording-waves span {
  display: block;
  width: 4px;
  background-color: var(--close);
  border-radius: 2px;
  animation: wave 1s ease-in-out infinite;
}

.recording-waves span:nth-child(1) { animation-delay: 0.0s; height: 10px; }
.recording-waves span:nth-child(2) { animation-delay: 0.1s; height: 20px; }
.recording-waves span:nth-child(3) { animation-delay: 0.2s; height: 12px; }

@keyframes wave {
  0%, 100% { transform: scaleY(1); }
  50% { transform: scaleY(0.4); }
}

@keyframes pulse-red {
  0% { box-shadow: 0 0 0 0 rgba(223, 82, 134, 0.7); }
  70% { box-shadow: 0 0 0 15px rgba(223, 82, 134, 0); }
  100% { box-shadow: 0 0 0 0 rgba(223, 82, 134, 0); }
}
</style>
