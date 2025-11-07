<!-- src/components/PanelContenedorFlexible/PanelContenedorFlexible.vue -->
<template>
  <!-- Trigger opcional (slot o interno). Por defecto oculto -->
  <div v-if="isOverlay && showInternalTrigger" class="pcf-trigger">
    <slot name="trigger">
      <button class="pcf-btn" type="button" @click="toggle()"
              :aria-expanded="!internalCollapsed" :aria-controls="idPanel">
        <span class="pcf-burger"></span><span class="pcf-burger"></span><span class="pcf-burger"></span>
      </button>
      <span class="pcf-title" v-if="title">{{ title }}</span>
    </slot>
  </div>

  <aside
    :id="idPanel"
    class="pcf-panel"
    :class="[
      { 'pcf-collapsed': internalCollapsed && !isOverlay,
        'pcf-overlay': isOverlay,
        'pcf-open': isOverlay && !internalCollapsed
      },
      `pcf-${side}`
    ]"
    :style="panelInlineStyle"
    ref="panelRef"
  >
    <header v-if="title || $slots.header" class="pcf-header">
      <slot name="header">
        <h6 class="m-0">{{ title }}</h6>
      </slot>
      <button v-if="isOverlay" type="button" class="pcf-close" @click="close()">×</button>
    </header>

    <div class="pcf-content">
      <slot />
    </div>

    <div
      v-if="!isOverlay && !internalCollapsed && resizable"
      class="pcf-resizer"
      :class="[`pcf-resizer--${side}`]"
      @mousedown="startResize"
      @touchstart.prevent="startResize"
    />
  </aside>

  <div
    v-if="isOverlay"
    class="pcf-backdrop"
    :class="{ 'pcf-backdrop--show': !internalCollapsed }"
    @click="close()"
  />
</template>

<script setup>
import { ref, watch, computed, onMounted, onBeforeUnmount, defineProps, defineEmits, defineExpose } from 'vue'

const props = defineProps({
  modelValue: { type: Boolean, default: false }, // true = colapsado
  width: { type: Number, default: 350 },
  minWidth: { type: Number, default: 300 },
  maxWidth: { type: Number, default: 900 },
  side: { type: String, default: 'left', validator: v => ['left', 'right'].includes(v) },
  breakpoint: { type: Number, default: 992 },
  overlayZ: { type: Number, default: 1050 },
  title: { type: String, default: '' },
  resizable: { type: Boolean, default: true },
  rounded: { type: Boolean, default: true },
  id: { type: String, default: '' },

  /* Nuevo */
  forceOverlay: { type: Boolean, default: false },   // fuerza modo móvil
  startCollapsed: { type: Boolean, default: true },  // inicia oculto
  showInternalTrigger: { type: Boolean, default: false } // oculta trigger interno por defecto
})

const emit = defineEmits(['update:modelValue', 'update:width', 'toggle', 'open', 'close'])

const internalWidth = ref(props.width)
const internalCollapsed = ref(props.modelValue)
const isOverlay = ref(false) // overlay activo (móvil o forzado)
const dragging = ref(false)
const startX = ref(0)
const startW = ref(props.width)
const panelRef = ref(null)

const idPanel = computed(() => props.id || 'pcf-panel')

const panelInlineStyle = computed(() => {
  const s = {}
  if (!isOverlay.value) {
    s.width = internalCollapsed.value ? '0px' : `${internalWidth.value}px`
    s.borderRadius = props.rounded ? '30px' : '0'
  } else {
    s.zIndex = props.overlayZ
  }
  return s
})

function recomputeOverlay() {
  if (props.forceOverlay) {
    isOverlay.value = true
  } else {
    isOverlay.value = window.matchMedia(`(max-width: ${props.breakpoint - 1}px)`).matches
  }
}

function open() {
  if (!internalCollapsed.value) return
  internalCollapsed.value = false
  emit('update:modelValue', false)
  emit('toggle', true)
  emit('open')
}
function close() {
  if (internalCollapsed.value) return
  internalCollapsed.value = true
  emit('update:modelValue', true)
  emit('toggle', false)
  emit('close')
}
function toggle() {
  internalCollapsed.value ? open() : close()
}

function onResizeMove(e) {
  if (!dragging.value) return
  const clientX = e.touches ? e.touches[0].clientX : e.clientX
  let delta = clientX - startX.value
  if (props.side === 'right') delta = -delta
  let newW = startW.value + delta
  newW = Math.max(props.minWidth, Math.min(props.maxWidth, newW))
  internalWidth.value = newW
  emit('update:width', newW)
}
function stopResize() {
  dragging.value = false
  document.removeEventListener('mousemove', onResizeMove)
  document.removeEventListener('mouseup', stopResize)
  document.removeEventListener('touchmove', onResizeMove)
  document.removeEventListener('touchend', stopResize)
}
function startResize(e) {
  if (isOverlay.value) return
  dragging.value = true
  startX.value = e.touches ? e.touches[0].clientX : e.clientX
  startW.value = internalWidth.value
  document.addEventListener('mousemove', onResizeMove)
  document.addEventListener('mouseup', stopResize)
  document.addEventListener('touchmove', onResizeMove, { passive: false })
  document.addEventListener('touchend', stopResize)
}

watch(() => props.modelValue, v => (internalCollapsed.value = v))
watch(internalCollapsed, v => emit('update:modelValue', v))
watch(() => props.width, w => (internalWidth.value = w))

onMounted(() => {
  recomputeOverlay()
  window.addEventListener('resize', recomputeOverlay)

  // Iniciar oculto si se pide (como móvil)
  if (props.startCollapsed) {
    internalCollapsed.value = true
    emit('update:modelValue', true)
  }
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', recomputeOverlay)
  stopResize()
})

defineExpose({ open, close, toggle })
</script>

<style scoped>
/* === BOTÓN FLOTANTE HAMBURGUESA (TRIGGER) === */
.pcf-trigger {
  position: fixed;
  left: 16px;            /* esquina izquierda */
  top: 16px;             /* esquina superior */
  z-index: 1000;         /* por encima del resto */
}

.pcf-btn {
  border: none;
  background: var(--blueBerry, #8c8cf9);
  padding: 10px 12px;
  border-radius: 50%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 4px;
  cursor: pointer;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.15);
  transition: background 0.25s;
}
.pcf-btn:hover {
  background: var(--blueBerryHover, #7676d8);
}
.pcf-burger {
  width: 20px;
  height: 2px;
  background: #fff;
  display: block;
}
.pcf-title {
  display: none;
}

/* Ocultamos el botón flotante en pantallas grandes (solo móvil o tablet) */
@media (min-width: 992px) {
  /* .pcf-trigger { display: none; } */
}

/* === PANEL LATERAL === */
.pcf-panel {
  position: relative;
  background:
    radial-gradient(circle at 0% 0%, var(--azulNormal, #2a5bd7) 0%, transparent 40%),
    radial-gradient(circle at 70% 20%, var(--azulDark, #163a8a) 0%, transparent 40%),
    radial-gradient(circle at 80% 20%, var(--azulDark, #163a8a) 0%, transparent 40%),
    radial-gradient(circle at 40% 30%, var(--azulDark, #163a8a) 0%, transparent 40%),
    radial-gradient(circle at 80% 40%, var(--azulNormal, #2a5bd7) 0%, transparent 40%),
    radial-gradient(circle at 80% 50%, var(--azulNormal, #2a5bd7) 0%, transparent 40%),
    radial-gradient(circle at 30% 90%, #d8d9dd 0%, transparent 40%),
    linear-gradient(135deg, var(--azulDark, #163a8a), #ffffff);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(106, 106, 106, 0.25);
  height: 100%;
  transition: width 0.3s ease, transform 0.25s ease, opacity 0.2s ease;
  overflow: hidden;
  border-radius: 30px;
  box-shadow: rgba(0, 0, 0, 0.15) 1.95px 1.95px 2.6px;
}

.pcf-left {
  border-radius: 30px 0 0 30px;
}
.pcf-right {
  border-radius: 0 30px 30px 0;
}

/* Colapsado */
.pcf-collapsed {
  width: 0px !important;
  border: none;
  background: transparent;
}

/* === ENCABEZADO === */
.pcf-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background: rgba(255, 255, 255, 0.85);
  border-bottom: 1px solid #eaeaea;
}
.pcf-close {
  border: 0;
  background: transparent;
  font-size: 22px;
  line-height: 1;
  cursor: pointer;
}

/* === CONTENIDO === */
.pcf-content {
  height: calc(100% - 48px);
  padding: 16px 18px;
  overflow-y: auto;
  scrollbar-width: none;
  border-radius: 30px;
  border: unset;  
}

/* === RESIZER (solo escritorio) === */
.pcf-resizer {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 8px;
  cursor: col-resize;
  opacity: 0.001;
}
.pcf-resizer--left { right: -4px; }
.pcf-resizer--right { left: -4px; }

/* === MODO OVERLAY (móvil) === */
.pcf-overlay {
  position: fixed;
  top: 0;
  bottom: 0;
  width: 80vw;
  max-width: 420px;
  transform: translateX(-100%);
  opacity: 0;
}
.pcf-overlay.pcf-open {
  transform: translateX(0);
  opacity: 1;
}
.pcf-overlay.pcf-left { left: 0; }
.pcf-overlay.pcf-right { right: 0; }

/* === BACKDROP MÓVIL === */
.pcf-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.25);
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.2s ease;
}
.pcf-backdrop--show {
  opacity: 1;
  pointer-events: auto;
}

/* === AJUSTES RESPONSIVE === */
@media (max-width: 991.98px) {
  .pcf-content {
    padding: 14px;
  }
  .pcf-header {
    padding: 10px 14px;
  }
}
</style>
