<template>
  <header class="workspace-header bg-white shadow-sm border-bottom p-1">
    <div class="row align-items-center g-2 flex-nowrap-lg">
      <!-- Lado Izquierdo: Toggle y Título -->
      <div class="col-12 col-lg-6 d-flex align-items-center mb-1 mb-lg-0">
        <DynamicSvgLoader 
          class="me-2 iconBtn flex-shrink-0" 
          fileName="icons/list"
          title="Menu" 
          width_icon="32px"
          height_icon="32px"
          @click.stop="onToggleSidebar"
        />   
        <div class="workspace-title-block flex-grow-1">
          <h2 class="title-gt-c subtitulo mb-0 text-truncate">{{ selectedTableName }}</h2>
          <div class="d-flex gap-1 flex-wrap mt-1">
            <span v-if="groupByColumn" class="badge-personalizable">
                {{ groupByColumn }}
            </span>
            <span v-if="subGroupByColumn" class="badge-personalizable">
                {{ subGroupByColumn }}
            </span>
            <!-- Estado y Acciones -->
            <div 
              v-if="activeView" 
              class="view-status-wrapper position-relative"
              @mouseenter="isTooltipVisible = true"
              @mouseleave="isTooltipVisible = false"
            >
              <div class="pill-container d-flex align-items-center">
                <span class="badge-view-status">
                  {{ currentPermission === 'propietario' ? 'Vista' : 'Compartida' }}
                </span>
                
                <div class="action-divider"></div>

                <!-- Botones de Acción Minimalistas -->
                <div class="d-inline-flex align-items-center gap-1 px-1 action-group-minimal">
                  <IconButtonAction 
                    v-if="currentPermission === 'propietario'" 
                    iconName="icons/UCT_ADMIN/PERSON_PLUS" 
                    title="Compartir" 
                    @click="onShareView" 
                  />
                  <IconButtonAction 
                    v-if="currentPermission === 'propietario'" 
                    iconName="icons/TRASH" 
                    title="Eliminar" 
                    @click="onDeleteView" 
                  />
                  <IconButtonAction 
                    iconName="icons/CERRAR" 
                    title="Cerrar vista" 
                    extraClass="shadow-none"
                    @click="onResetView" 
                  />
                </div>
              </div>
              
              <!-- Tooltip-->
              <Tooltip 
                title="Información de la Vista" 
                :visible="isTooltipVisible"
                :rows="tooltipRows"
              />
            </div>
            <span v-if="!groupByColumn && !subGroupByColumn && !activeView" class="text-muted small opacity-50 uppercase fw-bold">Sin agrupación</span>
          </div>
        </div>
      </div>

      <!-- Lado Derecho: Selector de Modo y Acciones -->
      <div class="col-12 col-lg-6 d-flex justify-content-end align-items-center flex-wrap gap-2">
        <div class="d-flex gap-2 align-items-center flex-wrap justify-content-end">
          <!-- Mis Vistas -->
          <ActionExpandable
            v-if="ownViews.length > 0"
            icon="icons/list"
            label="Mis Vistas"
            :isExpanded="isOwnHovered"
            :items="ownViews"
            tooltip="Mis Vistas"
            @mouseenter="onHoverEnter('own')"
            @mouseleave="onHoverLeave('own')"
            @select="(view) => onViewSelect(view, 'own')"
          />

          <!-- Compartidas -->
          <ActionExpandable
            v-if="sharedViews.length > 0"
            icon="icons/People"
            label="Compartidas"
            iconWidth="18px"
            iconHeight="18px"
            :isExpanded="isSharedHovered"
            :items="sharedViews"
            tooltip="Compartidas"
            @mouseenter="onHoverEnter('shared')"
            @mouseleave="onHoverLeave('shared')"
            @select="(view) => onViewSelect(view, 'shared')"
          />

          <!-- Botón Guardar: visible si es admin O si puede actualizar una vista existente -->
          <ActionExpandable
            v-if="(isDataChartsAdmin && !activeView) || (activeView && currentPermission !== 'lectura')"
            icon="icons/GUARDAR"
            :label="activeView ? 'Actualizar' : 'Guardar'"
            :isExpanded="isSaveHovered"
            :tooltip="activeView ? 'Actualizar o Guardar como...' : 'Guardar vista'"
            @mouseenter="onHoverEnter('save')"
            @mouseleave="onHoverLeave('save')"
            @action="onSaveRequest"
          />
        </div>

        <TabButtons 
          :modelValue="isChartMode"
          :options="chartModeOptions"
          extraClass="me-auto me-lg-2"
          @update:modelValue="setChartMode"
        />
      </div>
    </div>
  </header>
</template>

<script>
import { defineComponent, computed, ref } from 'vue';
import DynamicSvgLoader from '@/components/LoaderSVG/LoaderSVG.vue';
import ButtonPrimary from '@/components/ButtonWithIcon/ButtonPrimary.vue';
import TabButtons from '@/components/TabsNav/TabButtons.vue';
import Tooltip from '@/components/Tooltip/Tooltip.vue';
import ActionExpandable from '@/components/ActionExpandable/ActionExpandable.vue';
import IconButtonAction from '@/components/ButtonWithIcon/IconButtonAction.vue';
import { useDataChartsPermisos } from '@/components/DataCharts/composables/useDataChartsPermisos.js';

export default defineComponent({
  name: 'VisualizerHeader',
  components: {
    DynamicSvgLoader,
    ButtonPrimary,
    Tooltip,
    ActionExpandable,
    IconButtonAction,
    TabButtons
  },
  props: {
    selectedTableName: String,
    isChartMode: Boolean,
    groupByColumn: String,
    subGroupByColumn: String,
    activeView: Object,
    currentPermission: { type: String, default: 'propietario' },
    savedViews: Array,
  },
  emits: ['update:isChartMode', 'toggle-sidebar', 'save-request', 'load-view', 'reset-view', 'delete-view', 'share-view'],
  setup(props, { emit }) {
    const { isDataChartsAdmin } = useDataChartsPermisos();
    const isOwnHovered = ref(false);
    const isSharedHovered = ref(false);
    const isSaveHovered = ref(false);
    const isTooltipVisible = ref(false);

    const chartModeOptions = [
      { label: 'Datos', value: false, icon: 'UCT_ADMIN/listOL.svg' },
      { label: 'Gráficas', value: true, icon: 'graph.svg' }
    ];

    const timers = { own: null, shared: null, save: null };

    const formatDateTime = (dateStr) => {
        if (!dateStr) return '';
        try {
            const date = new Date(dateStr);
            return new Intl.DateTimeFormat('es-MX', {
                day: '2-digit', month: '2-digit', year: 'numeric',
                hour: '2-digit', minute: '2-digit', hour12: false
            }).format(date);
        } catch (e) {
            return dateStr;
        }
    };

    const onHoverEnter = (type) => {
      // Mutual Exclusion: Cerrar inmediatamente cualquier otro que esté abierto
      Object.keys(timers).forEach(key => {
        if (timers[key]) clearTimeout(timers[key]);
        if (key !== type) {
            if (key === 'own') isOwnHovered.value = false;
            if (key === 'shared') isSharedHovered.value = false;
            if (key === 'save') isSaveHovered.value = false;
        }
      });

      if (timers[type]) clearTimeout(timers[type]);
      if (type === 'own') isOwnHovered.value = true;
      if (type === 'shared') isSharedHovered.value = true;
      if (type === 'save') isSaveHovered.value = true;
    };

    const onHoverLeave = (type) => {
      timers[type] = setTimeout(() => {
        if (type === 'own') isOwnHovered.value = false;
        if (type === 'shared') isSharedHovered.value = false;
        if (type === 'save') isSaveHovered.value = false;
      }, 300); // Hysteresis buffer
    };

    const onViewSelect = (view, type) => {
      if (view) emit('load-view', view);
      if (type === 'own') isOwnHovered.value = false;
      if (type === 'shared') isSharedHovered.value = false;
      if (timers[type]) clearTimeout(timers[type]);
    };

    const ownViews = computed(() => {
        return (props.savedViews || []).filter(v => v.tipo_permiso === 'propietario');
    });

    const sharedViews = computed(() => {
        return (props.savedViews || []).filter(v => v.tipo_permiso !== 'propietario');
    });

    const tooltipRows = computed(() => {
        if (!props.activeView) return [];
        return [
            { label: 'Nombre', value: props.activeView.nombre, class: 'fw-bold text-truncate ms-2' },
            { label: 'Dueño', value: props.activeView.propietario_nombre || 'Tú', class: 'fw-bold' },
            { label: 'Modificado por', value: props.activeView.modificador_nombre || 'Tú', class: 'text-muted small' },
            { label: 'Última edición', value: formatDateTime(props.activeView.ultima_fecha), class: 'text-muted small' },
            { 
              label: 'Acceso', 
              value: props.currentPermission === 'propietario' ? 'Propietario' : (props.currentPermission === 'lectura' ? 'Solo Lectura' : 'Editor'),
              type: 'badge',
              variant: props.currentPermission === 'propietario' ? 'primary' : (props.currentPermission === 'lectura' ? 'secondary' : 'success')
            }
        ];
    });

    // Helper functions for emissions
    const onToggleSidebar = () => emit('toggle-sidebar');
    const onShareView = () => emit('share-view', props.activeView);
    const onDeleteView = () => emit('delete-view', props.activeView);
    const onResetView = () => emit('reset-view');
    const onSaveRequest = () => emit('save-request');
    const setChartMode = (val) => emit('update:isChartMode', val);

    return {
      ownViews,
      sharedViews,
      tooltipRows,
      isOwnHovered,
      isSharedHovered,
      isSaveHovered,
      isTooltipVisible,
      onToggleSidebar,
      onShareView,
      onDeleteView,
      onResetView,
      onSaveRequest,
      setChartMode,
      onViewSelect,
      chartModeOptions,
      onHoverEnter,
      onHoverLeave,
      isDataChartsAdmin
    };
  }
});
</script>

<style scoped>
.workspace-header {
    position: relative;
    z-index: 100;
}
.workspace-title-block {
    border-left: 3px solid var(--purple-sb);
    padding-left: 12px;
    min-width: 0;
    flex: 1 1 auto;
}
@media (min-width: 992px) {
    .flex-nowrap-lg { flex-wrap: nowrap !important; }
}
.title-gt-c {color: var(--purple-sb);}
.badge-personalizable {
    font-size: 0.7rem;
    letter-spacing: 0.5px;
    padding: 1px 8px;
    border-radius: 20px;
    display: inline-flex;
    align-items: center;
    border: 1px solid transparent;
    box-shadow: 0 1px 3px rgba(0,0,0,0.05);
    background-color: var(--blueBerryGlass);
    color: var(--purple-sb);
    border-color: rgba(31, 30, 31, 0.1);
}
.pill-container {
    background: var(--bs-secondary-bg);
    padding: 1px;
    border-radius: 20px;
    border: 1px solid var(--bs-gray-200);
    transition: all 0.2s ease;
}

.pill-container:hover {
    background: white;
    border-color: var(--purple-sb);
    box-shadow: 0 4px 12px rgba(41, 41, 41, 0.1);
}
.badge-view-status {
    font-size: 0.7rem;
    font-weight: 700;
    padding: 4px 12px;
    display: inline-flex;
    align-items: center;
    cursor: default;
}

.view-status-wrapper:hover { color: var(--purple-sb); }

/* Botones de acción minimalistas */
.action-group-minimal { display: flex; }

.btn-text-tt { font-size: 0.85rem; color: var(--black); }
</style>
