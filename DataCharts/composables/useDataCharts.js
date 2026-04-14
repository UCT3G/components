import { ref, computed, reactive } from 'vue';
import { useStore } from 'vuex';
import { TablaBase } from '@/store/ReporteadorReactive/TablaDinamica.js';
import { createStaticOption, generateEChartsOption } from './chartOptionsFactory.js';

/**
 * useDataCharts
 * Composable central para la gestión del explorador de datos y gráficas.
 * Maneja el estado de la tabla seleccionada, configuraciones de ejes,
 * agrupaciones. La lógica de generación de opciones está en chartOptionsFactory.
 */
export function useDataCharts() {
    const store = useStore();
    
    // Estado Central
    const selectedTableName = ref(null); // Nombre de la tabla de datos seleccionada
    const isChartMode = ref(false);      // Define si se muestra la tabla o las gráficas
    const chartOption = ref({});         // Opción de ECharts para vista simple
    const chartOptions = ref([]);        // Array de opciones para múltiples mini-gráficas
    const loading = ref(false);          // Estado de carga
    const maxRecords = ref(20);         // Cantidad máxima de registros a solicitar
    
    const groupByColumn = ref(null);     // Columna principal para agrupar (Secciones del Dashboard)
    const dimensionColumn = ref(null);   // Columna de dimensión para pivot → series (Escenario 4)
    const valueColumn = ref(null);       // Columna de valor para pivot → series (Escenario 4)
    const activeConfigKey = ref('Global'); // Llave de configuración activa (Global o por Sección)
    const chartSections = ref([]);       // Estructura de secciones con sus respectivas gráficas
    const activeView = ref(null);        // Almacena { id_vista, nombre } de la vista actual cargada
    const currentPermission = ref('propietario'); // 'propietario', 'editar', o 'lectura'

    // Mapa de configuraciones independientes. Permite tener ajustes distintos por cada sección
    const configs = ref({
        Global: {
            visualizationType: 'bar',
            xAxisColumn: null,
            yAxisColumns: [],
            subGroupByColumn: null,
            seriesConfigs: {}, // Colores y alias por cada serie
            // Configuración de escala para gráficas de barras/líneas
            yMin: null,
            yMax: null,
            yInterval: null,
            // Configuración de escala para radar
            radarMin: null,
            radarMax: null,
            radarSplitNumber: null
        }
    });

    // Referencia reactiva a la base de datos de la tabla (desde Vuex)
    const tableBase = computed(() => {
        if (!selectedTableName.value) return TablaBase(0);
        const existingTable = store.getters['reporteador/getTablaPorNombre'](selectedTableName.value);
        return existingTable || TablaBase(0);
    });

    const ensureConfig = (key) => {
        if (!key || key === 'Global') return configs.value.Global;
        if (!(key in configs.value)) {
            // Clonamos el estado global como punto de partida para la sección
            configs.value[key] = JSON.parse(JSON.stringify(configs.value.Global));
        }
        return configs.value[key];
    };

    const visualizationType = computed({
        get: () => configs.value[activeConfigKey.value]?.visualizationType || configs.value.Global.visualizationType,
        set: (val) => { ensureConfig(activeConfigKey.value).visualizationType = val; }
    });

    const xAxisColumn = computed({
        get: () => configs.value[activeConfigKey.value]?.xAxisColumn || configs.value.Global.xAxisColumn,
        set: (val) => { ensureConfig(activeConfigKey.value).xAxisColumn = val; }
    });

    const yAxisColumns = computed({
        get: () => configs.value[activeConfigKey.value]?.yAxisColumns || configs.value.Global.yAxisColumns,
        set: (val) => { ensureConfig(activeConfigKey.value).yAxisColumns = val; }
    });

    const subGroupByColumn = computed({
        get: () => configs.value[activeConfigKey.value]?.subGroupByColumn || configs.value.Global.subGroupByColumn,
        set: (val) => { ensureConfig(activeConfigKey.value).subGroupByColumn = val; }
    });

    const seriesConfigs = computed({
        get: () => configs.value[activeConfigKey.value]?.seriesConfigs || configs.value.Global.seriesConfigs,
        set: (val) => { ensureConfig(activeConfigKey.value).seriesConfigs = val; }
    });

    const currentYCols = computed(() => {
        const config = configs.value[activeConfigKey.value] || configs.value.Global;

        // Lógica de fallback idéntica a createOption
        const tablaData = store.getters['reporteador/getTablaPorNombre'](selectedTableName.value);
        if (!tablaData || !tablaData.registros || tablaData.registros.length === 0) return [];

        const firstRow = tablaData.registros[0];
        const allKeys = Object.keys(firstRow).filter(k => !k.startsWith('ignorar_'));
        const xCol = config.xAxisColumn || allKeys[0];

        // ESCENARIO 4: columnas fijas + valores únicos de la dimensión
        if (dimensionColumn.value && valueColumn.value) {
            const exclude = [xCol, dimensionColumn.value, valueColumn.value];
            const fixedCols = (config.yAxisColumns && config.yAxisColumns.length > 0)
                ? config.yAxisColumns.filter(c => !exclude.includes(c))
                : allKeys.filter(c => !exclude.includes(c)).slice(0, 2);
            const uniqueDims = [...new Set(
                tablaData.registros.map(r => r[dimensionColumn.value]).filter(v => v != null)
            )].map(String);
            return [...fixedCols, ...uniqueDims];
        }

        // Escenario estándar
        if (config.yAxisColumns && config.yAxisColumns.length > 0) return config.yAxisColumns;
        const excludeCols = [xCol, groupByColumn.value, config.subGroupByColumn, dimensionColumn.value, valueColumn.value];
        return allKeys.filter(k => !excludeCols.includes(k)).slice(0, 5);
    });

    const availableConfigKeys = computed(() => {
        const keys = new Set(['Global']);
        chartSections.value.forEach(s => { if (s.configKey) keys.add(s.configKey); });
        chartOptions.value.forEach(o => { if (o.configKey) keys.add(o.configKey); });
        
        // Mantener la llave activa actual si ya existe en configs
        if (activeConfigKey.value && !keys.has(activeConfigKey.value)) {
            if (configs.value[activeConfigKey.value]) keys.add(activeConfigKey.value);
        }
        
        return Array.from(keys);
    });

    // Getters from store
    const availableTables = computed(() => store.state.reporteador.tablas_nombres);
    
    // --- ACCIONES ---
    const selectDataTable = async (tableName) => {
        loading.value = true;
        selectedTableName.value = tableName;
        
        const existingTable = store.getters['reporteador/getTablaPorNombre'](tableName);
        if (!existingTable) {
            console.warn(`Table ${tableName} not found in store.`);
        }
        
        loading.value = false;
    };

    const toggleViewMode = () => {
        isChartMode.value = !isChartMode.value;
    };

    /**
     * Resetea el visualizador a un estado limpio (Nuevo).
     * Borra ejes, agrupaciones, configuración de series y filtros de la tabla.
     */
    const resetToNew = () => {
        activeView.value = null;
        currentPermission.value = 'propietario';
        
        // Reset de agrupaciones
        groupByColumn.value = null;
        dimensionColumn.value = null;
        valueColumn.value = null;
        maxRecords.value = 20;
        activeConfigKey.value = 'Global';
        
        // Limpiar configuraciones adicionales (por sección)
        Object.keys(configs.value).forEach(key => {
            if (key !== 'Global') delete configs.value[key];
        });
        
        // Reset de configuración Global
        configs.value.Global.visualizationType = 'bar';
        configs.value.Global.xAxisColumn = null;
        configs.value.Global.yAxisColumns = [];
        configs.value.Global.subGroupByColumn = null;
        configs.value.Global.seriesConfigs = {};
        configs.value.Global.yMin = null;
        configs.value.Global.yMax = null;
        configs.value.Global.yInterval = null;
        configs.value.Global.radarMin = null;
        configs.value.Global.radarMax = null;
        configs.value.Global.radarSplitNumber = null;
        
        // Limpiar filtros de la tabla directamente en el store
        if (tableBase.value.json_tabla) {
            try {
                const json = JSON.parse(tableBase.value.json_tabla);
                if (json && json.columnas) {
                    json.columnas.forEach(col => col.valor = null);
                    tableBase.value.json_tabla = JSON.stringify(json);
                }
            } catch (e) {}
        }
    };

    const getSerializableConfig = () => {
        let tableFilters = [];
        try {
            // Leemos directamente del store ya que la tabla ahora permanece montada (v-show)
            const json = JSON.parse(tableBase.value.json_tabla);
            if (json && json.columnas) {
                tableFilters = json.columnas.map(col => ({
                    campo_nombre: col.campo_nombre,
                    valor: col.valor
                })).filter(f => f.valor !== null && f.valor !== '' && f.valor !== undefined);
            }
        } catch (e) {
            console.error("Error al serializar filtros:", e);
        }

        return {
            tableName: selectedTableName.value,
            isChartMode: isChartMode.value,
            visualizationType: visualizationType.value,
            xAxisColumn: xAxisColumn.value,
            yAxisColumns: [...yAxisColumns.value],
            groupByColumn: groupByColumn.value,
            dimensionColumn: dimensionColumn.value,
            valueColumn: valueColumn.value,
            subGroupByColumn: subGroupByColumn.value,
            maxRecords: maxRecords.value,
            activeConfigKey: activeConfigKey.value,
            seriesConfigs: JSON.parse(JSON.stringify(seriesConfigs.value)),
            // Configuraciones de escala
            yMin: configs.value[activeConfigKey.value]?.yMin ?? null,
            yMax: configs.value[activeConfigKey.value]?.yMax ?? null,
            yInterval: configs.value[activeConfigKey.value]?.yInterval ?? null,
            radarMin: configs.value[activeConfigKey.value]?.radarMin ?? null,
            radarMax: configs.value[activeConfigKey.value]?.radarMax ?? null,
            radarSplitNumber: configs.value[activeConfigKey.value]?.radarSplitNumber ?? null,
            tableFilters
        };
    };

    const applySavedConfig = async (config, viewInfo = null) => {
        if (!config) return;
        
        // 0. Registrar vista activa y sus permisos
        if (viewInfo && viewInfo.id_vista) {
            activeView.value = { 
                id_vista: viewInfo.id_vista, 
                nombre: viewInfo.nombre,
                propietario_nombre: viewInfo.propietario_nombre,
                ultima_fecha: viewInfo.ultima_fecha,
                modificador_nombre: viewInfo.modificador_nombre
            };
            currentPermission.value = viewInfo.tipo_permiso || 'propietario';
        }

        // 1. Cambiar tabla si es necesario
        if (config.tableName && config.tableName !== selectedTableName.value) {
            await selectDataTable(config.tableName);
        }

        // 2. Restaurar Filtros directamente al store
        if (tableBase.value.json_tabla) {
            try {
                const json = JSON.parse(tableBase.value.json_tabla);
                if (json && json.columnas) {
                    // PRIMERO: Limpiar TODOS los filtros existentes
                    json.columnas.forEach(col => col.valor = null);
                    
                    // SEGUNDO: Aplicar los filtros guardados en la vista (si existen)
                    if (config.tableFilters && config.tableFilters.length > 0) {
                        config.tableFilters.forEach(f => {
                            const col = json.columnas.find(c => c.campo_nombre === f.campo_nombre);
                            if (col) col.valor = f.valor;
                        });
                    }
                    
                    tableBase.value.json_tabla = JSON.stringify(json);
                }
            } catch (e) {
                console.error("Error al restaurar filtros:", e);
            }
        }

        // 3. Restaurar Configuraciones de Gráfica
        isChartMode.value = config.isChartMode ?? isChartMode.value;
        visualizationType.value = config.visualizationType ?? visualizationType.value;
        xAxisColumn.value = config.xAxisColumn ?? null;
        yAxisColumns.value = config.yAxisColumns ?? [];
        groupByColumn.value = config.groupByColumn ?? null;
        dimensionColumn.value = config.dimensionColumn ?? null;
        valueColumn.value = config.valueColumn ?? null;
        subGroupByColumn.value = config.subGroupByColumn ?? null;
        maxRecords.value = config.maxRecords ?? 20;
        activeConfigKey.value = config.activeConfigKey ?? 'Global';
        if (config.seriesConfigs) {
            seriesConfigs.value = JSON.parse(JSON.stringify(config.seriesConfigs));
        }
        
        // Restaurar configuraciones de escala
        const currentConfig = ensureConfig(activeConfigKey.value);
        if (config.yMin !== undefined) currentConfig.yMin = config.yMin;
        if (config.yMax !== undefined) currentConfig.yMax = config.yMax;
        if (config.yInterval !== undefined) currentConfig.yInterval = config.yInterval;
        if (config.radarMin !== undefined) currentConfig.radarMin = config.radarMin;
        if (config.radarMax !== undefined) currentConfig.radarMax = config.radarMax;
        if (config.radarSplitNumber !== undefined) currentConfig.radarSplitNumber = config.radarSplitNumber;
    };

    /**
     * Resetea una configuración de sección para que vuelva a heredar de Global.
     * Elimina la configuración personalizada de esa sección.
     */
    const resetConfigToGlobal = (configKey) => {
        if (configKey && configKey !== 'Global' && configs.value[configKey]) {
            delete configs.value[configKey];
            // El watcher de configs en DataVisualizer se encargará del refresh
        }
    };

    // Crear un objeto de estado para pasar al factory
    const state = {
        selectedTableName,
        groupByColumn,
        dimensionColumn,
        valueColumn,
        configs,
        chartOption,
        chartOptions,
        chartSections
    };

    // Wrapper para generateEChartsOption que pasa el estado
    const generateChartOptions = (data_table) => {
        generateEChartsOption(state, data_table);
    };

    return {
        selectedTableName, tableBase, isChartMode, chartOption, chartOptions, chartSections,
        visualizationType, xAxisColumn, yAxisColumns, groupByColumn, subGroupByColumn,
        dimensionColumn, valueColumn, maxRecords,
        activeConfigKey, availableConfigKeys, configs, seriesConfigs, currentYCols,
        activeView, currentPermission, loading, availableTables, selectDataTable, toggleViewMode, resetToNew,
        generateEChartsOption: generateChartOptions, createStaticOption, getSerializableConfig, applySavedConfig, resetConfigToGlobal
    };
}
