<template>
  <div 
    class="sidebar-wrapper d-flex flex-column h-100" 
    :class="{ 'sidebar-collapsed': !isOpen, 'sidebar-expanded': isOpen }"
    :style="sidebarStyles"
  >
    <!-- Estado Colapsado: Barra vertical estilizada tipo cápsula -->
    <div 
      v-if="!isOpen" 
      class="collapsed-pill-sidebar card bg-white h-100 shadow-sm border-0 rounded-4 d-flex flex-column align-items-center py-3"
    >
      <ButtonOnlyIcon
        :iconName="iconToggleOpen"
        width_icon="16px"
        color="var(--bs-gray-600)"
        hoverColor="var(--blueBerry)"
        :title="titleOpen || `Mostrar ${title || 'panel'}`"
        @click="toggleSidebar"
      />
    </div>

    <!-- Estado Abierto: Card con header, contenido scrollable y footer -->
    <div v-else class="card bg-white flex-grow-1 shadow-sm border-0 rounded-4 overflow-hidden h-100">
      <div class="card-body p-3 d-flex flex-column overflow-hidden h-100">
        
        <!-- Header con Icono, Título, Acciones opcionales y Botón de Cierre -->
        <slot name="header">
          <div class="d-flex align-items-center justify-content-between mb-2">
            <div class="d-flex align-items-center gap-2 overflow-hidden">
              <DynamicSvgLoader
                v-if="icon"
                :fileName="icon"
                width_icon="18px"
                height_icon="18px"
                :style="`fill: ${iconColor} !important; cursor: default !important;`"
                class="flex-shrink-0 p-0 d-inline-flex align-items-center"
              />
              <span v-if="title" class="text-primary fw-bold text-truncate">{{ title }}</span>
            </div>

            <div class="d-flex align-items-center gap-1 ms-auto">
              <!-- Slot para botones o acciones extras en cabecera -->
              <slot name="header-actions" />

              <!-- Botón Toggle de cierre -->
              <ButtonOnlyIcon
                :iconName="iconToggleClose"
                width_icon="15px"
                color="var(--bs-gray-600)"
                hoverColor="var(--blueBerry)"
                :title="titleClose || `Ocultar ${title || 'panel'}`"
                @click="toggleSidebar"
              />
            </div>
          </div>
        </slot>

        <!-- Slot de Contenido Principal (Scrollable) -->
        <div class="d-flex flex-column flex-grow-1 overflow-hidden h-100">
          <slot />
        </div>

        <!-- Slot Footer (Sticky al fondo) -->
        <div v-if="$slots.footer" class="mt-auto pt-2 w-100 flex-shrink-0">
          <slot name="footer" />
        </div>

      </div>
    </div>
  </div>
</template>

<script>
import { defineComponent, computed } from "vue";
import DynamicSvgLoader from "@/components/LoaderSVG/LoaderSVG.vue";
import ButtonOnlyIcon from "@/components/ButtonWithIcon/ButtonOnlyIcon.vue";

export default defineComponent({
  name: "CollapsibleSidebar",
  components: {
    DynamicSvgLoader,
    ButtonOnlyIcon
  },
  props: {
    modelValue: {
      type: Boolean,
      default: undefined
    },
    abierto: {
      type: Boolean,
      default: undefined
    },
    side: {
      type: String,
      default: "left",
      validator: (val) => ["left", "right"].includes(val)
    },
    title: {
      type: String,
      default: ""
    },
    icon: {
      type: String,
      default: ""
    },
    iconColor: {
      type: String,
      default: "var(--purple-sb)"
    },
    width: {
      type: String,
      default: "320px"
    },
    minWidth: {
      type: String,
      default: "290px"
    },
    maxWidth: {
      type: String,
      default: "360px"
    },
    collapsedWidth: {
      type: String,
      default: "48px"
    },
    titleOpen: {
      type: String,
      default: ""
    },
    titleClose: {
      type: String,
      default: ""
    }
  },
  emits: ["update:modelValue", "update:abierto", "toggle", "open", "close"],
  setup(props, { emit }) {
    const isOpen = computed(() => {
      if (props.modelValue !== undefined) return props.modelValue;
      if (props.abierto !== undefined) return props.abierto;
      return true;
    });

    // Dirección de iconos para ButtonOnlyIcon (busca en assets/images/icons/)
    const iconToggleOpen = computed(() => (props.side === "left" ? "D_FLECHA_D.svg" : "D_FLECHA_I.svg"));
    const iconToggleClose = computed(() => (props.side === "left" ? "D_FLECHA_I.svg" : "D_FLECHA_D.svg"));

    const sidebarStyles = computed(() => {
      if (isOpen.value) {
        return {
          width: props.width,
          minWidth: props.minWidth,
          maxWidth: props.maxWidth
        };
      }
      return {
        width: props.collapsedWidth,
        minWidth: props.collapsedWidth,
        maxWidth: props.collapsedWidth
      };
    });

    const toggleSidebar = () => {
      const nextState = !isOpen.value;
      emit("update:modelValue", nextState);
      emit("update:abierto", nextState);
      emit("toggle", nextState);
      if (nextState) {
        emit("open");
      } else {
        emit("close");
      }
    };

    return {
      isOpen,
      iconToggleOpen,
      iconToggleClose,
      sidebarStyles,
      toggleSidebar
    };
  }
});
</script>

<style scoped>
.sidebar-wrapper {
  transition: width 0.28s cubic-bezier(0.4, 0, 0.2, 1), 
              min-width 0.28s cubic-bezier(0.4, 0, 0.2, 1), 
              max-width 0.28s cubic-bezier(0.4, 0, 0.2, 1);
  flex-shrink: 0;
}

.collapsed-pill-sidebar {
  width: 100%;
  user-select: none;
}
</style>
