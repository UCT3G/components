<template>
  <div>
    <div :class="['offcanvas', offcanvasPosition]" tabindex="-1" id="offcanvasComponent" aria-labelledby="offcanvasLabel" ref="offcanvasElement">
      <div class="offcanvas-header">
        <h5 class="offcanvas-title" id="offcanvasLabel">{{titulo}}</h5>
        <button type="button" class="btn-close" data-bs-dismiss="offcanvas" aria-label="Close"></button>
      </div>
      <div class="offcanvas-body">
        <slot></slot>
      </div>
    </div>
  </div>
</template>

<script>
import { defineComponent, onMounted, ref, watch, computed } from 'vue';

export default defineComponent({
  name: 'SideBarGeneral',
  props: {
    show: {
      type: Boolean,
      default: false
    },
    position: {
      type: String,
      default: 'end', // 'end' for right
      validator: value => ['start', 'end', 'top', 'bottom'].includes(value)
    },
    titulo: {
      type: String,
      default: ''
    }
  },
  setup(props) {
    const offcanvasElement = ref(null);
    const offcanvasInstance = ref(null);
    const visibleCanvas = ref(false);

    const offcanvasPosition = computed(() => {
      return `offcanvas-${props.position}`;
    });

    onMounted(() => {
      const Offcanvas = require('bootstrap/js/dist/offcanvas');
      offcanvasInstance.value = new Offcanvas(offcanvasElement.value);

      if (props.show) {
        offcanvasInstance.value.show();
        visibleCanvas.value = true;
      }

      offcanvasElement.value.addEventListener('hide.bs.offcanvas', () => {
        visibleCanvas.value = false;
      });

      offcanvasElement.value.addEventListener('hidden.bs.offcanvas', () => {
        visibleCanvas.value = false;
      });

      offcanvasElement.value.addEventListener('show.bs.offcanvas', () => {
        visibleCanvas.value = true;
      });
    });

    watch(() => props.show, () => {
      if (!visibleCanvas.value) {
        offcanvasInstance.value.show();
        visibleCanvas.value = true;
      } else {
        offcanvasInstance.value.hide();
        visibleCanvas.value = false;
      }
    });

    return {
      offcanvasElement,
      offcanvasPosition,
      visibleCanvas
    };
  }
});
</script>

<style scoped>
/* Puedes agregar estilos personalizados aquí si es necesario */
</style>
