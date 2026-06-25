<template>
  <section class="resumen-datos-panel bg-white shadow-sm">
    <div class="resumen-datos-grid">
      
      <div
        v-for="(item, index) in items"
        :key="index"
        class="resumen-dato-item resumen-dato-item-clickable"
        :class="{ 'resumen-dato-item-activo': filtroActivo === item.valor }"
        @click="seleccionarFiltro(item.valor)"
      >
        <div class="resumen-dato-icon" :class="getIconClass(index)">
          <DynamicSvgLoader :fileName="item.icono" width="24px" height="24px" />
        </div>
        <div>
          <p class="resumen-dato-label">{{ item.titulo }}</p>
          <p class="resumen-dato-value">{{ item.cantidad || 0 }}</p>
        </div>
      </div>

    </div>
  </section>
</template>

<script>
import { defineComponent, ref } from 'vue';
import DynamicSvgLoader from '@/components/LoaderSVG/LoaderSVG.vue';

export default defineComponent({
  name: 'NavResumenDatos',
  components: {
    DynamicSvgLoader
  },
  props: {
    items: {
      type: Array,
      default: () => []
    }
  },
  emits: ['filtro-seleccionado'],
  setup(props, { emit }) {
    const filtroActivo = ref(null);

    const seleccionarFiltro = (filtroId) => {
      if (filtroActivo.value === filtroId) {
        filtroActivo.value = null; // Toggle
      } else {
        filtroActivo.value = filtroId;
      }
      emit('filtro-seleccionado', filtroActivo.value);
    };

    const getIconClass = (index) => {
      const classes = [
        'resumen-dato-icon-contratados',
        'resumen-dato-icon-accidentes',
        'resumen-dato-icon-ingresos',
        'resumen-dato-icon-historico',
        'resumen-dato-icon-eficiencia'
      ];
      return classes[index % classes.length];
    };

    return {
      filtroActivo,
      seleccionarFiltro,
      getIconClass
    };
  }
});
</script>

<style scoped>
.resumen-datos-panel {
  border-left: 6px solid var(--blueBerry);
  border-radius: 8px;
  overflow: hidden;
}

.resumen-datos-actions {
  display: flex;
  justify-content: flex-end;
  padding: 1rem 1.5rem 0;
}

.resumen-datos-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(190px, 1fr));
  gap: 1rem;
  padding: 1rem 1.5rem 1.5rem;
}

.resumen-datos-grid-con-acciones {
  padding-top: 0.75rem;
}

.resumen-dato-item {
  display: flex;
  align-items: center;
  min-height: 96px;
  gap: 1rem;
  padding: 1rem;
  border: 1px solid #e9edf3;
  border-radius: 8px;
  background-color: #fbfcfe;
}

.resumen-dato-item-clickable {
  cursor: pointer;
  transition: transform 0.15s ease, box-shadow 0.15s ease, border-color 0.15s ease;
}

.resumen-dato-item-clickable:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 14px rgba(60, 84, 127, 0.08);
}

.resumen-dato-item-activo {
  border-color: var(--blueBerry);
  box-shadow: 0 0 0 1px rgba(68, 90, 128, 0.12);
  background-color: #f7faff;
}

.resumen-dato-icon {
  width: 48px;
  height: 48px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  border-radius: 50%;
  font-size: 1.35rem;
}

.resumen-dato-icon-contratados {
  color: #1f7a4d;
  background-color: #e7f5ee;
}

.resumen-dato-icon-accidentes {
  color: #9a3412;
  background-color: #fff1e8;
}

.resumen-dato-icon-ingresos {
  color: #0f766e;
  background-color: #e6fffb;
}

.resumen-dato-icon-historico {
  color: #7c3aed;
  background-color: #f1e8ff;
}

.resumen-dato-icon-eficiencia {
  color: var(--blueBerry);
  background-color: var(--blueBerryPastel);
}

.resumen-dato-label {
  margin: 0 0 0.25rem;
  color: #6c757d;
  font-size: 0.85rem;
  font-family: "MonserratSemiBold";
  text-transform: uppercase;
}

.resumen-dato-value {
  margin: 0;
  color: var(--blueBerry);
  font-size: 1.75rem;
  line-height: 1;
  font-family: "MonserratBold";
}
</style>
