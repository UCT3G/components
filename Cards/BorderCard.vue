<template>
  <div class="border-card-container w-100">
    <div 
      class="d-flex align-items-center justify-content-between p-3 bg-white border rounded-3 shadow-sm"
      :class="{ 'cursor-pointer': isCollapsible }"
      :style="cardStyle"
      @click="onCardClick"
    >
      <!-- LADO IZQUIERDO (Texto o Slot principal) -->
      <div class="flex-grow-1 text-start">
        <slot>
          <span>{{ text }}</span>
        </slot>
      </div>

      <!-- LADO DERECHO (Icono o Slot 'right') -->
      <div 
        v-if="icon || $slots.right" 
        class="d-flex align-items-center justify-content-center ms-3"
        :title="iconTooltip"
      >
        <slot name="right">
          <DynamicSvgLoader 
            v-if="icon"
            :fileName="icon" 
            width_icon="20px" 
            height_icon="20px" 
            :style="{ fill: iconColor || borderColor, color: iconColor || borderColor }"
            class="p-0 border-0 pointer-events-none"
          />
        </slot>
      </div>
    </div>

    <!-- CONTENIDO COLAPSABLE -->
    <transition name="fade-slide">
      <div v-if="isCollapsible && isOpen" class="collapse-content mt-2">
        <slot name="collapse" />
      </div>
    </transition>
  </div>
</template>

<script>
import { defineComponent, ref, computed, watch } from "vue";
import DynamicSvgLoader from "@/components/LoaderSVG/LoaderSVG.vue";

export default defineComponent({
  name: "BorderCard",
  components: { DynamicSvgLoader },
  props: {
    text: {
      type: String,
      default: ""
    },
    icon: {
      type: String,
      default: ""
    },
    iconColor: {
      type: String,
      default: ""
    },
    iconTooltip: {
      type: String,
      default: ""
    },
    // Estilo del borde indicador
    borderColor: {
      type: String,
      default: "#FFF"
    },
    borderWidth: {
      type: String,
      default: "4px"
    },
    // Propiedades para comportamiento colapsable
    collapsible: {
      type: Boolean,
      default: false
    },
    defaultOpen: {
      type: Boolean,
      default: false
    }
  },
  emits: ["toggle"],
  setup(props, { slots, emit }) {
    const isOpen = ref(props.defaultOpen);

    watch(() => props.defaultOpen, (newVal) => {
      isOpen.value = newVal;
    });

    const isCollapsible = computed(() => {
      return props.collapsible || Boolean(slots.collapse);
    });

    const onCardClick = () => {
      if (!isCollapsible.value) return;
      isOpen.value = !isOpen.value;
      emit("toggle", isOpen.value);
    };

    const cardStyle = computed(() => ({
      borderLeft: `${props.borderWidth} solid ${props.borderColor} !important`
    }));

    return { 
      isOpen,
      isCollapsible,
      onCardClick,
      cardStyle 
    };
  }
});
</script>

<style scoped>
.cursor-pointer {
  cursor: pointer;
  user-select: none;
}

.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.2s ease-out;
}

.fade-slide-enter-from,
.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}
</style>
