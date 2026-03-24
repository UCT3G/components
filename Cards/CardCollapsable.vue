<template>
  <div class="card-desplegable">
    <div
        class="cd-header"
        @click="toggle"
        role="button"
        tabindex="0"
        @keypress.enter="toggle"
        >

        <div class="cd-left texto-caja">
            <slot name="header-left" />

            <div class="cd-title">
            <slot name="title">{{ title }}</slot>
            </div>
        </div>

        <div class="cd-icon" :class="{ expanded: isOpen }">
          <DynamicSvgLoader 
            fileName="icons/chevron-down" 
            width_icon="20px" 
            height_icon="20px" 
          />
        </div>

    </div>

    <transition name="cd-slide">
      <div v-if="isOpen" class="cd-body">
        <slot />
      </div>
    </transition>
  </div>
</template>

<script>
import { defineComponent, ref, watch, reactive } from "vue";
import DynamicSvgLoader from "@/components/LoaderSVG/LoaderSVG.vue";

// Estado global para manejar grupos de acordeón
const activeGroups = reactive({});

export default defineComponent({
  name: "CardDesplegable",
  components: { DynamicSvgLoader },

  props: {
    title: { type: String, default: "" },
    defaultOpen: { type: Boolean, default: false },
    group: { type: String, default: null },
    id: { type: [String, Number], default: null }
  },

  setup(props, { emit }) {
    const isOpen = ref(props.defaultOpen);

    // Identificador único para el acordeón (por prop o por título)
    const cardId = props.id || props.title || Math.random().toString(36).substr(2, 9);

    // Si viene abierto por defecto y tiene grupo, registrarlo como el activo
    if (props.defaultOpen && props.group) {
      activeGroups[props.group] = cardId;
    }

    // Vigilar cambios en el estado global del grupo
    if (props.group) {
      watch(() => activeGroups[props.group], (newActiveId) => {
        if (newActiveId !== cardId && isOpen.value) {
          isOpen.value = false;
          emit('toggle', false);
        }
      });
    }

    watch(() => props.defaultOpen, (newVal) => {
      isOpen.value = newVal;
      if (newVal && props.group) {
        activeGroups[props.group] = cardId;
      }
    });

    function toggle() {
      isOpen.value = !isOpen.value;
      
      if (isOpen.value && props.group) {
        activeGroups[props.group] = cardId;
      }
      
      emit('toggle', isOpen.value);
    }

    return {
      isOpen,
      toggle
    };
  }
});
</script>

<style scoped>
.cd-left {
  display: flex;
  align-items: center;
  gap: 10px;
}

.card-desplegable {
  background: white;
  border-radius: 16px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.04);
  border: 1px solid var(--bs-gray-300);
  transition: 0.3s;
}

.card-desplegable:hover {
  box-shadow: 0 4px 18px rgba(0,0,0,0.08);
}

.cd-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 18px;
  border-radius: 16px;
  cursor: pointer;
  background: linear-gradient(135deg, var(--bs-gray-100) 0%, white 100%);
  border-bottom: 1px solid var(--bs-gray-200);
  transition: 0.25s;
}

.cd-header:hover {
  background: var(--bs-gray-100);
  border-color: var(--bluelight-sb);
}

.cd-title {
  font-size: 16px;
  display: flex;
  gap: 10px;
  align-items: center;
}

.cd-icon {
  width: 32px;
  height: 32px;
  background: var(--bs-gray-100);
  border-radius: 8px;
  display: flex;
  justify-content: center;
  align-items: center;
  transition: 0.3s;
}

.cd-icon :deep(.loaderSVG-contend) {
  padding: 0 !important;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--bs-gray-600);
  transition: 0.3s;
}

.cd-icon :deep(.loaderSVG-contend svg) {
  width: 100% !important;
  height: 100% !important;
  display: block;
}

.cd-icon.expanded {
  background: linear-gradient(135deg, var(--acceso1), var(--bluelight-sb));
}

.cd-icon.expanded :deep(.loaderSVG-contend) {
  color: white !important;
  transform: rotate(180deg);
}

.cd-body {
  padding: 20px;
}

/* Animación */
.cd-slide-enter-active {
  transition: all 0.35s ease;
}
.cd-slide-leave-active {
  transition: all 0.3s ease;
}
.cd-slide-enter-from,
.cd-slide-leave-to {
  transform: translateY(-8px);
  opacity: 0;
}
</style>
