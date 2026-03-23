<template>
  <div class="data-dashboard container-fluid p-0 bg-light-subtle h-100 d-flex flex-column overflow-hidden">
    <!-- Barra Superior de Filtros y Acciones -->
    <header class="dashboard-header d-flex align-items-center justify-content-between px-4 py-3 bg-white shadow-sm border-bottom">
        <div>
            <div class="d-flex align-items-center mb-1">
                <h1 class="title-gt-dashboard mb-0">{{ title }}</h1>
            </div>
            <p class="text-muted x-small mb-0 uppercase fw-bold opacity-75">Panel de Mosaicos Interactivos</p>
        </div>
        
        <!-- Filtros Globales Dynamicos -->
        <div class="dashboard-controls d-flex gap-3 align-items-center">
            <div class="global-filters-container d-flex gap-2 p-2 bg-light rounded-pill border px-3">
                <div class="d-flex align-items-center me-2">
                    <span class="x-small uppercase fw-bold text-muted">Filtros:</span>
                </div>
                
                <!-- Ejemplo de Filtro Global () -->
                <select v-model="filters.todas" class="form-select form-select-sm border-0 bg-transparent x-small" style="width: 140px;">
                    <option :value="null">Todas</option>
                    <option v-for="suc in avalilableAll" :key="suc" :value="suc">{{ suc }}</option>
                </select>

                <!-- Ejemplo de Filtro Temporal -->
                <select v-model="filters.periodo" class="form-select form-select-sm border-0 bg-transparent x-small" style="width: 110px;">
                    <option :value="null">Todo el tiempo</option>
                    <option value="2024">2024</option>
                    <option value="2023">2023</option>
                </select>
            </div>

            <div class="d-flex gap-2">
                <button class="btn btn-sm btn-outline-secondary rounded-pill px-3" @click="resetFilters">
                    Limpiar
                </button>
                <div class="vr my-1 mx-1"></div>
                <button class="btn btn-sm btn-primary shadow-sm px-3 rounded-pill fw-bold" @click="addView">
                    Añadir Gráfica
                </button>
            </div>
        </div>
    </header>

    <!-- Contenedor del Mosaico (Draggable Grid) -->
    <div class="dashboard-workspace flex-grow-1 overflow-auto p-4">
        <grid-layout
            v-if="views.length > 0"
            v-model:layout="localLayout"
            :col-num="12"
            :row-height="30"
            :is-draggable="true"
            :is-resizable="true"
            :vertical-compact="true"
            :use-css-transforms="true"
            @layout-updated="onLayoutUpdated"
        >
            <grid-item
                v-for="item in localLayout"
                :key="item.i"
                :x="item.x"
                :y="item.y"
                :w="item.w"
                :h="item.h"
                :i="item.i"
                class="grid-item-wrapper"
            >
                <DashboardTile 
                    :config="getViewByItemId(item.i)"
                    :globalFilters="filters"
                    @edit="editView(getViewByItemId(item.i))"
                />
            </grid-item>
        </grid-layout>

        <!-- Estado Vacío -->
        <div v-else class="empty-dashboard-state d-flex flex-column align-items-center justify-content-center h-100 animate__animated animate__fadeIn">
            <div class="empty-card text-center p-5 bg-white rounded-5 shadow-sm border-0" style="max-width: 500px;">
                <div class="icon-circle mb-4 mx-auto bg-primary-subtle text-primary">
                    
                </div>
                <h3 class="fw-bold text-dark mb-3">Tu Dashboard está listo</h3>
                <p class="text-muted mb-4 small">
                    Aquí puedes combinar gráficas y otras tablas en una sola vista mosaico. 
                    Comienza añadiendo una gráfica guardada desde el explorador.
                </p>
                <button class="btn btn-primary px-5 py-2 fw-bold shadow active-scale" @click="addView">
                    Crear Primer Mosaico
                </button>
            </div>
        </div>
    </div>
  </div>
</template>

<script>
import { defineComponent, ref, reactive, watch, onMounted } from 'vue';
import { GridLayout, GridItem } from 'vue3-grid-layout';
import DashboardTile from './DashboardTile.vue';

export default defineComponent({
  name: 'Dashboard',
  components: { 
    GridLayout, 
    GridItem, 
    DashboardTile 
  },
  props: {
    // Título principal del Dashboard
    title: {
        type: String,
        default: 'Dashboard Estratégico'
    },
    // Lista de vistas (mosaicos) a mostrar
    // Cada objeto contiene el id, nombre, configuración de DataCharts y layout (posicionamiento)
    views: {
        type: Array,
        default: () => [] 
    },
    // Opciones para el filtro global de "Todas"
    avalilableAll: {
        type: Array,
        default: () => ['']
    }
  },
  emits: ['add-view', 'edit-view', 'layout-changed'],
  setup(props, { emit }) {
    // Objeto reactivo que contiene los valores de los filtros globales
    // Estos se pasan a cada DashboardTile para afectar sus datos
    const filters = reactive({
        todas: null,
        periodo: null
    });

    // Estado local para manejar las posiciones de la malla (GridLayout)
    const localLayout = ref([]);

    /**
     * SINCRO DE LAYOUT:
     * Siempre que las 'views' cambien desde fuera, actualizamos el mapa local 
     * que entiende el componente de rejilla (vue3-grid-layout).
     */
    watch(() => props.views, (newViews) => {
        localLayout.value = newViews.map(v => ({
            i: String(v.id), // Identificador único de la celda
            x: v.layout?.x || 0, // Posición horizontal (0-11)
            y: v.layout?.y || 0, // Posición vertical
            w: v.layout?.w || 4, // Ancho en columnas
            h: v.layout?.h || 8  // Altura en unidades de fila
        }));
    }, { immediate: true, deep: true });

    // Busca la configuración completa de una vista basándose en el ID de la rejilla
    const getViewByItemId = (id) => {
        return props.views.find(v => String(v.id) === String(id));
    };

    // Reinicia los filtros a su estado inicial
    const resetFilters = () => {
        filters.todas = null;
        filters.periodo = null;
    };

    /**
     * Evento que se dispara cuando el usuario termina de arrastrar o redimensionar un mosaico.
     * Notificamos al padre para que persista los nuevos valores de x, y, w, h.
     */
    const onLayoutUpdated = (newLayout) => {
        emit('layout-changed', newLayout);
    };

    // Emite el evento para añadir una nueva vista
    const addView = () => {
        emit('add-view');
    };

    // Emite el evento para editar una vista existente
    const editView = (view) => {
        emit('edit-view', view);
    };

    return { 
        filters, 
        localLayout, 
        getViewByItemId, 
        resetFilters, 
        onLayoutUpdated,
        addView,
        editView
    };
  }
});
</script>

<style scoped>
.title-gt-dashboard {
    color: var(--purple-sb);
    font-family: 'MonserratBoldItalic', sans-serif;
    font-size: 1.35rem;
    line-height: 1.2;
}

.dashboard-workspace {
    background-color: var(--bs-gray-100);
    background-image: radial-gradient(var(--bs-gray-200) 1px, transparent 1px);
    background-size: 20px 20px;
}

.grid-item-wrapper {
    touch-action: none;
}

.icon-circle {
    width: 80px;
    height: 80px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 2.5rem;
}

.x-small { font-size: 0.65rem; }
.uppercase { text-transform: uppercase; letter-spacing: 0.8px; }

.empty-card {
    border: 1px solid rgba(0,0,0,0.05) !important;
}

.active-scale:active {
    transform: scale(0.95);
}

.bg-primary-subtle {
    background-color: var(--blueBerryPastel) !important;
}

/* Estilos para el grid-layout placeholders */
:deep(.vue-grid-placeholder) {
    background: var(--purple-sb) !important;
    opacity: 0.1 !important;
    border-radius: 12px !important;
}
</style>
