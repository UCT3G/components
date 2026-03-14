# DataCharts — Módulo de Visualización de Datos

Módulo completo para explorar, graficar y guardar vistas de datos directamente desde el store de Vuex (`reporteador`). El componente principal es `DataVisualizer.vue`, que integra un panel de configuración lateral, una barra de cabecera y un workspace de visualización.

---

## Tabla de Contenido

1. [Uso básico](#uso-básico)
2. [Props disponibles](#props-disponibles)
3. [Casos de uso comunes](#casos-de-uso-comunes)
4. [Escenarios de gráfica](#escenarios-de-gráfica)
5. [Tipos de visualización](#tipos-de-visualización)
6. [Vistas guardadas](#vistas-guardadas)
7. [Arquitectura del módulo](#arquitectura-del-módulo)

---

## Uso básico

Importa y monta `DataVisualizer` en cualquier página. El componente asume que la tabla ya está registrada en el store de Vuex (`reporteador`).

```vue
<template>
  <DataVisualizer />
</template>

<script>
import DataVisualizer from '@/componentes_gt/DataCharts/DataVisualizer/DataVisualizer.vue';
export default {
  components: { DataVisualizer }
};
</script>
```

El usuario verá un panel lateral para seleccionar la tabla de datos y configurar los ejes, y el workspace mostrará la tabla o la gráfica según el modo activo.

---

## Props disponibles

| Prop | Tipo | Default | Descripción |
|---|---|---|---|
| `fixedTableName` | `String` | `null` | Fija la tabla de datos. **El selector lateral queda bloqueado** y el usuario no puede cambiarla. |
| `externalDataTrigger` | `Boolean` | `false` | Disparador externo (desde el padre) para forzar una recarga de datos. Útil al combinar con filtros de fecha u otros controles externos. |
| `tableParams` | `Array` | `null` | Parámetros que se inyectan automáticamente en el campo `json_tabla.data` de la tabla activa. Se actualiza de forma reactiva. Ejemplo: `[id_sucursal, id_periodo]`. |
| `allowedTables` | `Array` | `null` | Lista blanca de nombres de tablas que aparecerán en el selector lateral. Si se omite, se muestran todas las tablas del store. |

---

## Casos de uso comunes

### 1. Visualizador libre (sin restricciones)

El usuario puede seleccionar cualquier tabla del store y explorarla libremente.

```vue
<DataVisualizer />
```

### 2. Fijar la tabla de origen

Ideal para dashboards donde la tabla ya está definida por el contexto de la página.

```vue
<DataVisualizer fixedTableName="TB_GT_BSC_RESULTADOS" />
```

### 3. Pasar parámetros dinámicos

Cuando la tabla requiere filtros (como un ID de sucursal o periodo) que vienen del padre. El componente los inyecta automáticamente en `json_tabla.data` y recarga los datos cada vez que cambian.

```vue
<template>
  <DataVisualizer
    fixedTableName="TB_GT_ENCUESTAS_DETALLE"
    :tableParams="[sucursalSeleccionada, periodoActual]"
  />
</template>

<script>
export default {
  data() {
    return {
      sucursalSeleccionada: 5,
      periodoActual: '2024-10'
    };
  }
};
</script>
```

### 4. Limitar las tablas disponibles

Útil para que el usuario solo pueda explorar un subconjunto de tablas relacionadas a un módulo específico.

```vue
<DataVisualizer :allowedTables="['TB_GT_BSC_RESULTADOS', 'TB_GT_BSC_RANKING_SUCURSALES']" />
```

### 5. Disparador externo de recarga

Cuando la recarga depende de una acción del padre (ej. al presionar un botón "Actualizar").

```vue
<template>
  <button @click="triggerReload">Actualizar</button>
  <DataVisualizer
    fixedTableName="TB_GT_KPIS"
    :externalDataTrigger="trigger"
  />
</template>

<script>
export default {
  data() { return { trigger: false }; },
  methods: {
    triggerReload() {
      this.trigger = false;
      this.$nextTick(() => { this.trigger = true; });
    }
  }
};
</script>
```

### 6. Escuchar cuando se carga una vista guardada

```vue
<DataVisualizer @load-view="onViewLoaded" />
```

---

## Escenarios de gráfica

El motor de gráficas (`chartOptionsFactory.js`) detecta automáticamente el escenario según la configuración activa:

| # | Condición | Resultado |
|---|---|---|
| **Escenario 1** | `groupByColumn` activo | Una sección por cada valor único de la columna, cada una con su propia gráfica. Permite configurar estilos **por sección**. |
| **Escenario 2** | `subGroupByColumn` activo (sin `groupByColumn`) | Un grid de mini-gráficas, una por cada valor único de la sub-agrupación. |
| **Escenario 3** | Sin agrupaciones | Gráfica única global. El modo más simple. |
| **Escenario 4** | `dimensionColumn` + `valueColumn` activos | **Pivot dinámico**: convierte los valores únicos de la columna de dimensión en series independientes. Ideal para datos en formato largo (long format). |

---

## Tipos de visualización

Se seleccionan desde el panel lateral (Tab *Estilo*):

| Tipo | Descripción |
|---|---|
| `bar` | Barras verticales agrupadas |
| `line` | Líneas con marcadores circulares |
| `horizontal_line` | Líneas horizontales (ejes invertidos) |
| `radar` | Gráfica tipo araña/radar |

---

## Vistas guardadas

El componente incluye un sistema completo de persistencia de vistas:

- **Guardar**: Salva la configuración actual (tabla, ejes, agrupaciones, filtros, estilos y colores de series) con un nombre.
- **Cargar**: Restaura una vista guardada incluyendo los filtros de columna de la tabla.
- **Actualizar**: Sobreescribe la vista activa con la configuración actual.
- **Eliminar**: Borra una vista del backend.
- **Compartir**: Permite compartir una vista con otros usuarios con distintos niveles de permiso (`lectura`, `editar`).

Las vistas se almacenan en el backend y se consultan automáticamente al activar una tabla. Se encuentran accesibles desde la barra de cabecera del workspace.

---

## Arquitectura del módulo

```
DataCharts/
├── DataVisualizer/
│   ├── DataVisualizer.vue       # Componente raíz (punto de entrada)
│   ├── VisualizerHeader.vue     # Barra superior: modos, vistas guardadas, compartir
│   ├── VisualizerWorkspace.vue  # Área de renderizado: tabla o gráficas
│   ├── VisualizerForm.vue       # Formulario del modal "Guardar Vista"
│   └── VisualizerShare.vue      # Panel de compartir vista
├── ChartsConfig/
│   ├── ChartsConfig.vue         # Panel lateral colapsable de configuración
│   ├── TabConsulta.vue          # Tab: Origen, ejes y agrupaciones
│   ├── TabEstilo.vue            # Tab: Tipo de gráfica, colores y escala
│   └── ConfigSection.vue        # Acordeón reutilizable dentro del panel
├── composables/
│   ├── useDataCharts.js         # Estado central y lógica de negocio
│   ├── chartOptionsFactory.js   # Generación pura de opciones ECharts (Strategy Pattern)
│   └── useChartsAccordion.js    # Estado de acordeones del panel lateral
├── Dashboard/
│   ├── Dashboard.vue            # Vista modo dashboard (grid de tiles)
│   └── DashboardTile.vue        # Tile individual del dashboard
└── EChartsVisualizer.vue        # Wrapper reactivo de ECharts con ResizeObserver
```

### Flujo de datos resumido

```
Padre
  └── DataVisualizer.vue  (props: fixedTableName, tableParams, ...)
        ├── useDataCharts.js  →  estado reactivo + chartOptionsFactory
        ├── ChartsConfig      →  modifica ejes/agrupaciones via v-model
        └── VisualizerWorkspace
              ├── Tabla dinámica (modo tabla)
              └── EChartsVisualizer.vue  (modo gráfica)
```
