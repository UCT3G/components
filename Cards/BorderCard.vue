<template>
  <div 
    class="d-flex align-items-center justify-content-between p-3 bg-white border rounded-3 shadow-sm"
    :style="cardStyle"
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
</template>

<script>
import { defineComponent, computed } from "vue";
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
    }
  },
  setup(props) {
    const cardStyle = computed(() => ({
      borderLeft: `${props.borderWidth} solid ${props.borderColor} !important`
    }));

    return { cardStyle };
  }
});
</script>
