<template>
  <div class="resumen-datos-nav">
    <div v-if="hasActions" class="resumen-datos-actions">
      <slot name="actions"></slot>
    </div>
    <div
      class="resumen-datos-grid"
      :class="{ 'resumen-datos-grid-con-acciones': hasActions }"
    >
      <div
        v-for="item in normalizedItems"
        :key="item.id"
        class="resumen-dato-item"
        :class="{
          'resumen-dato-item-clickable': item.clickeable,
          'resumen-dato-item-activo': item.activo
        }"
        @click="seleccionarItem(item)"
      >
        <div class="resumen-dato-icon" :class="getIconClass(item)">
          <DynamicSvgLoader
            :fileName="item.icono"
            width_icon="24px"
            height_icon="24px"
          />
        </div>
        <div class="resumen-dato-content">
          <p class="resumen-dato-label">{{ item.titulo }}</p>
          <p class="resumen-dato-value">{{ item.valor }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { computed, defineComponent } from 'vue';
import DynamicSvgLoader from '@/components/LoaderSVG/LoaderSVG.vue';

export default defineComponent({
  name: 'NavResumenDatos',
  components: {
    DynamicSvgLoader
  },
  props: {
    /**
     * Contrato recomendado por item:
     * {
     *   id: String | Number,
     *   titulo: String,
     *   valor: String | Number,
     *   icono: String, // formato: "icons/nombre_icono" sin ".svg"
     *   activo?: Boolean,
     *   clickeable?: Boolean,
     *   variante?: String
     * }
     *
     * Compatibilidad actual:
     * - `cantidad` se sigue tomando como alias de `valor`
     * - `valor` se sigue tomando como alias de `id` cuando `id` no viene definido
     * - si `icono` llega con extension ".svg", se normaliza automaticamente
     */
    items: {
      type: Array,
      default: () => [],
      validator: (items) =>
        Array.isArray(items) &&
        items.every((item) => item && typeof item === 'object')
    },
    activeItemId: {
      type: [String, Number, null],
      default: null
    }
  },
  emits: ['item-click', 'filtro-seleccionado'],
  setup(props, { emit, slots }) {
    const normalizarIcono = (icono) => {
      const iconoNormalizado = String(icono ?? '').trim();

      if (!iconoNormalizado) {
        return '';
      }

      return iconoNormalizado.replace(/\.svg$/i, '');
    };

    const normalizedItems = computed(() =>
      props.items.map((item, index) => {
        const fallbackId = item.id ?? item.valor ?? `item-${index}`;
        const displayValue = item.cantidad ?? item.valor ?? 0;

        return {
          id: fallbackId,
          titulo: item.titulo ?? '',
          valor: displayValue,
          icono: normalizarIcono(item.icono),
          activo: typeof item.activo === 'boolean' ? item.activo : props.activeItemId === fallbackId,
          clickeable: item.clickeable !== false,
          variante: item.variante ?? ''
        };
      })
    );

    const seleccionarItem = (item) => {
      if (!item.clickeable) {
        return;
      }

      emit('item-click', item);
      emit('filtro-seleccionado', item.id);
    };

    const getIconClass = (item) => {
      const variantClassMap = {
        success: 'resumen-dato-icon-contratados',
        warning: 'resumen-dato-icon-accidentes',
        info: 'resumen-dato-icon-ingresos',
        history: 'resumen-dato-icon-historico',
        primary: 'resumen-dato-icon-eficiencia'
      };

      return item.variante ? variantClassMap[item.variante] || item.variante : '';
    };

    const hasActions = computed(() => Boolean(slots.actions));

    return {
      hasActions,
      normalizedItems,
      seleccionarItem,
      getIconClass
    };
  }
});
</script>

<style scoped>
.resumen-datos-nav {
  width: 100%;
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

.resumen-dato-icon :deep(.loaderSVG-contend),
.resumen-dato-icon :deep(.loaderSVG-contend-selected) {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  margin: 0;
}

.resumen-dato-icon :deep(svg) {
  width: 24px;
  height: 24px;
  display: block;
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

.resumen-dato-content {
  min-width: 0;
}

.resumen-dato-value {
  margin: 0;
  color: var(--blueBerry);
  font-size: 1.75rem;
  line-height: 1;
  font-family: "MonserratBold";
  word-break: break-word;
}
</style>
