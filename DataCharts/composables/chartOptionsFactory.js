/**
 * chartOptionsFactory.js
 * Módulo de funciones puras para generar configuraciones de ECharts.
 * Contiene todos los builders de gráficas organizados con Strategy Pattern.
 */

// ========== CHART BUILDERS (Strategy Pattern) ==========
const chartBuilders = {
    /**
     * Builder para gráficas de barras verticales
     */
    bar: (aggregatedDataset, config, xAxisData, series, title) => {
        const valueAxis = {};
        if (config.yMin !== null && config.yMin !== undefined) valueAxis.min = config.yMin;
        if (config.yMax !== null && config.yMax !== undefined) valueAxis.max = config.yMax;
        if (config.yInterval !== null && config.yInterval !== undefined) valueAxis.interval = config.yInterval;

        return {
            title: { text: title, left: 'center', top: '10px', textStyle: { color: '#333333', fontSize: 14 } },
            tooltip: { trigger: 'axis' },
            legend: { bottom: 0, type: 'scroll' },
            grid: { left: '5%', right: '5%', bottom: '25%', top: title ? '60px' : '30px', containLabel: true },
            xAxis: { type: 'category', data: xAxisData, axisLabel: { interval: 0 } },
            yAxis: { type: 'value', ...valueAxis },
            series: series
        };
    },

    /**
     * Builder para gráficas de líneas (reutiliza config de barras)
     */
    line: (aggregatedDataset, config, xAxisData, series, title) => {
        return chartBuilders.bar(aggregatedDataset, config, xAxisData, series, title);
    },

    /**
     * Builder para grÃ¡ficas de pastel
     */
    pie: (aggregatedDataset, config, xAxisData, series, title) => {
        const pieSeries = Array.isArray(series) && series.length > 0 ? series[0] : { data: [] };
        return {
            title: { text: title, left: 'center', top: '10px', textStyle: { color: '#333333', fontSize: 14 } },
            tooltip: { trigger: 'item', formatter: '{b}: {c} ({d}%)' },
            legend: { bottom: 0, type: 'scroll' },
            series: [
                {
                    name: pieSeries.name || 'Serie',
                    type: 'pie',
                    radius: ['40%', '68%'],
                    center: ['50%', title ? '46%' : '43%'],
                    avoidLabelOverlap: true,
                    itemStyle: {
                        borderRadius: 6,
                        borderColor: '#ffffff',
                        borderWidth: 2
                    },
                    label: {
                        show: true,
                        formatter: '{b}\n{d}%'
                    },
                    emphasis: {
                        label: {
                            show: true,
                            fontWeight: 'bold'
                        }
                    },
                    data: pieSeries.data || []
                }
            ],
            media: [
                {
                    query: { maxHeight: 280 },
                    option: {
                        series: [
                            {
                                radius: ['28%', '44%'],
                                center: ['50%', title ? '42%' : '40%']
                            }
                        ]
                    }
                }
            ]
        };
    },

    /**
     * Builder para gráficas de líneas horizontales
     */
    horizontal_line: (aggregatedDataset, config, xAxisData, series, title) => {
        const valueAxis = {};
        if (config.yMin !== null && config.yMin !== undefined) valueAxis.min = config.yMin;
        if (config.yMax !== null && config.yMax !== undefined) valueAxis.max = config.yMax;
        if (config.yInterval !== null && config.yInterval !== undefined) valueAxis.interval = config.yInterval;

        return {
            title: { text: title, left: 'center', top: '10px', textStyle: { color: '#333333', fontSize: 14 } },
            tooltip: { trigger: 'axis' },
            legend: { bottom: 0, type: 'scroll' },
            grid: { left: '5%', right: '5%', bottom: '15%', top: title ? '60px' : '30px', containLabel: true },
            xAxis: { type: 'value', ...valueAxis },
            yAxis: { type: 'category', data: xAxisData, inverse: true, axisLabel: { interval: 0 } },
            series: series
        };
    },

    /**
     * Builder para gráficas tipo radar
     */
    radar: (aggregatedDataset, config, xAxisData, yCols, title) => {
        const rMin = config.radarMin !== null && config.radarMin !== undefined ? config.radarMin : 0;
        const rMax = config.radarMax !== null && config.radarMax !== undefined ? config.radarMax : 100;

        const indicator = xAxisData.map(xVal => ({ name: xVal, min: rMin, max: rMax }));
        const radarData = yCols.map(yCol => {
            const sConf = config.seriesConfigs?.[yCol] || {};
            return {
                name: sConf.alias || yCol,
                value: aggregatedDataset.map(r => {
                    const rawVal = r[yCol];
                    if (rawVal === null || rawVal === undefined) return null;
                    // Clampeamos el valor para evitar que valores inferiores al mínimo
                    // generen radios negativos y se dibujen en el cuadrante opuesto de la gráfica
                    return Math.max(rMin, Math.min(rMax, rawVal));
                }),
                lineStyle: sConf.color ? { color: sConf.color } : undefined,
                itemStyle: sConf.color ? { color: sConf.color } : undefined
            };
        });

        let labelCounter = 0;
        const ticksPerAxis = (config.radarSplitNumber || 5) + 1;

        const radarConfig = {
            indicator,
            radius: '65%',
            center: ['50%', '48%'],
            shape: 'polygon',
            axisLabel: {
                show: true,
                color: '#999',
                fontSize: 10,
                formatter: (value) => {
                    const current = labelCounter;
                    labelCounter++;
                    Promise.resolve().then(() => {
                        labelCounter = 0;
                    });
                    if (current < ticksPerAxis) {
                        return value;
                    }
                    return '';
                }
            }
        };

        if (config.radarSplitNumber !== null && config.radarSplitNumber !== undefined) {
            radarConfig.splitNumber = config.radarSplitNumber;
        }

        return {
            title: { text: title || '', left: 'center', top: '5%', textStyle: { color: '#333333', fontSize: 14 } },
            tooltip: {},
            legend: { bottom: 0, type: 'scroll' },
            radar: radarConfig,
            series: [{ type: 'radar', data: radarData }],
            media: [
                {
                    query: { maxHeight: 280 },
                    option: {
                        radar: {
                            radius: '58%',
                            center: ['50%', '42%']
                        }
                    }
                }
            ]
        };
    }
};

// ========== HELPER FUNCTIONS ==========

/**
 * ESCENARIO 4: Pivot dinámico de formato largo a series.
 * Convierte una columna de dimensión (ej. 'departamento') en múltiples series,
 * usando otra columna como valor (ej. 'promedio_calificacion').
 * Columnas adicionales en yAxisColumns se incluyen como series fijas.
 */
function buildDimensionToSeriesOption(registros, state, config, allKeys) {
    const xCol = config.xAxisColumn || allKeys[0];
    const dimCol = state.dimensionColumn.value;
    const valCol = state.valueColumn.value;
    const vizType = config.visualizationType || 'line';

    // Columnas fijas adicionales, excluyendo las de pivot
    const exclude = [xCol, dimCol, valCol];
    const fixedYCols = (config.yAxisColumns && config.yAxisColumns.length > 0)
        ? config.yAxisColumns.filter(c => !exclude.includes(c))
        : allKeys.filter(c => !exclude.includes(c)).slice(0, 2);

    // Valores únicos de la dimensión → nombres de series
    const uniqueDims = [...new Set(registros.map(r => r[dimCol]).filter(v => v != null))];

    // Agrupar por xCol
    const grouped = {};
    const xOrder = [];
    registros.forEach(row => {
        const xVal = String(row[xCol] ?? 'N/A');
        if (!grouped[xVal]) {
            grouped[xVal] = { _fixed: {}, _dims: {} };
            xOrder.push(xVal);
        }
        // Columnas fijas: primer valor encontrado por grupo
        fixedYCols.forEach(fc => {
            if (grouped[xVal]._fixed[fc] === undefined && row[fc] != null)
                grouped[xVal]._fixed[fc] = parseFloat(row[fc]) || 0;
        });
        // Dimensión: asignar valor
        const dimVal = row[dimCol];
        if (dimVal != null)
            grouped[xVal]._dims[String(dimVal)] = parseFloat(row[valCol]) || 0;
    });

    const xAxisData = xOrder;
    const series = [];

    // Series fijas
    fixedYCols.forEach(fc => {
        const sConf = config.seriesConfigs?.[fc] || {};
        series.push({
            name: sConf.alias || fc,
            type: vizType === 'horizontal_line' ? 'line' : vizType,
            data: xAxisData.map(x => grouped[x]._fixed[fc] ?? null),
            smooth: true, symbol: 'circle', symbolSize: 8,
            lineStyle: { width: 3, color: sConf.color || undefined },
            itemStyle: { color: sConf.color || undefined }
        });
    });

    // Series de dimensión (dinámicas)
    uniqueDims.forEach(dim => {
        const sConf = config.seriesConfigs?.[String(dim)] || {};
        series.push({
            name: sConf.alias || String(dim),
            type: vizType === 'horizontal_line' ? 'line' : vizType,
            data: xAxisData.map(x => grouped[x]._dims[String(dim)] ?? null),
            smooth: true, symbol: 'circle', symbolSize: 8,
            lineStyle: { width: 3, color: sConf.color || undefined },
            itemStyle: { color: sConf.color || undefined }
        });
    });

    const valueAxis = {};
    if (config.yMin != null) valueAxis.min = config.yMin;
    if (config.yMax != null) valueAxis.max = config.yMax;
    if (config.yInterval != null) valueAxis.interval = config.yInterval;

    const base = {
        title: { text: '', left: 'center', top: '10px', textStyle: { color: '#333333', fontSize: 14 } },
        tooltip: { trigger: 'axis' },
        legend: { bottom: 0, type: 'scroll' },
        grid: { left: '5%', right: '5%', bottom: '25%', top: '60px', containLabel: true },
        series
    };

    if (vizType === 'horizontal_line') {
        return { ...base, xAxis: { type: 'value', ...valueAxis }, yAxis: { type: 'category', data: xAxisData, inverse: true, axisLabel: { interval: 0 } } };
    }
    return { ...base, xAxis: { type: 'category', data: xAxisData, axisLabel: { interval: 0 } }, yAxis: { type: 'value', ...valueAxis } };
}

/**
 * Ordena un conjunto de datos agregados por categoría (Eje X) o valor de métrica (Eje Y).
 */
function sortDataset(dataset, xCol, valueCol, sortBy, sortOrder) {
    if (!sortBy || sortBy === 'natural' || dataset.length === 0) return dataset;
    
    const isDesc = sortOrder === 'desc';
    
    return [...dataset].sort((a, b) => {
        if (sortBy === 'category') {
            const valA = String(a[xCol] || '');
            const valB = String(b[xCol] || '');
            return isDesc ? valB.localeCompare(valA) : valA.localeCompare(valB);
        }
        
        if (sortBy === 'value' && valueCol) {
            let valA = parseFloat(a[valueCol]);
            let valB = parseFloat(b[valueCol]);
            
            // Tolerancia a valores nulos o inválidos
            if (Number.isNaN(valA)) valA = isDesc ? -Infinity : Infinity;
            if (Number.isNaN(valB)) valB = isDesc ? -Infinity : Infinity;
            
            return isDesc ? valB - valA : valA - valB;
        }
        
        return 0;
    });
}

/**
 * Agrega un conjunto de datos agrupando por una columna y aplicando la operación correspondiente.
 */
function aggregateDataset(dataset, xCol, yCols, aggregationType = 'AVG', sortBy = 'natural', sortOrder = 'asc') {
    const groupedData = {};
    dataset.forEach(r => {
        const xVal = String(r[xCol] ?? 'N/A');
        if (!groupedData[xVal]) {
            groupedData[xVal] = { _count: 0 };
            yCols.forEach(yCol => {
                groupedData[xVal][yCol] = {
                    sum: 0,
                    count: 0,
                    min: Infinity,
                    max: -Infinity
                };
            });
        }

        yCols.forEach(yCol => {
            const val = parseFloat(r[yCol]);
            if (Number.isFinite(val)) {
                const node = groupedData[xVal][yCol];
                node.sum += val;
                node.count++;
                if (val < node.min) node.min = val;
                if (val > node.max) node.max = val;
            }
        });
        groupedData[xVal]._count++;
    });

    const xAxisDataRaw = Object.keys(groupedData);
    const aggregatedDataset = xAxisDataRaw.map(xVal => {
        const row = { [xCol]: xVal };
        yCols.forEach(yCol => {
            const node = groupedData[xVal][yCol];
            if (node.count === 0) {
                row[yCol] = 0;
            } else {
                switch (aggregationType) {
                    case 'SUM':
                        row[yCol] = node.sum;
                        break;
                    case 'COUNT':
                        row[yCol] = node.count;
                        break;
                    case 'MIN':
                        row[yCol] = node.min;
                        break;
                    case 'MAX':
                        row[yCol] = node.max;
                        break;
                    case 'AVG':
                    default:
                        row[yCol] = node.sum / node.count;
                        break;
                }
            }
        });
        return row;
    });

    // Aplicar ordenamiento
    const sortedDataset = sortDataset(aggregatedDataset, xCol, yCols[0], sortBy, sortOrder);
    
    // Mapear los nombres de categoría resultantes del ordenamiento
    const xAxisData = sortedDataset.map(row => row[xCol]);

    return { xAxisData, aggregatedDataset: sortedDataset, yCols };
}

/**
 * Prepara y agrega los datos para la gráfica.
 * Agrupa por xCol y calcula el valor de agregación para cada yCol.
 */
function prepareChartData(dataset, config, allKeys, groupByColumn) {
    const xCol = config.xAxisColumn || allKeys[0];

    // Excluir columnas de agrupación
    const excludeCols = [xCol, groupByColumn, config.subGroupByColumn];
    const yCols = (config.yAxisColumns && config.yAxisColumns.length > 0)
        ? config.yAxisColumns
        : allKeys.filter(k => !excludeCols.includes(k));

    const aggType = config.aggregationType || 'AVG';
    const sortBy = config.sortBy || 'natural';
    const sortOrder = config.sortOrder || 'asc';
    
    const { xAxisData, aggregatedDataset } = aggregateDataset(dataset, xCol, yCols, aggType, sortBy, sortOrder);

    return { xAxisData, aggregatedDataset, yCols };
}

/**
 * Convierte un color en formato HEX (ej: '#FFA500') a HSL (Hue, Saturation, Lightness).
 */
function hexToHsl(hex) {
    if (!hex || typeof hex !== 'string' || !hex.startsWith('#')) {
        return { h: 220, s: 70, l: 50 }; // Fallback azul
    }
    let r = parseInt(hex.slice(1, 3), 16) / 255;
    let g = parseInt(hex.slice(3, 5), 16) / 255;
    let b = parseInt(hex.slice(5, 7), 16) / 255;

    let max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;

    if (max === min) {
        h = s = 0;
    } else {
        let d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
    }
    return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
}

/**
 * Genera una paleta de colores degradados monocromáticos a partir de un color HEX base.
 * Va desde el tono más oscuro (para los valores más grandes) al más claro.
 */
function generateMonochromaticPalette(hexColor, steps) {
    const { h, s, l } = hexToHsl(hexColor);
    const colors = [];
    if (steps <= 0) return colors;
    if (steps === 1) return [`hsl(${h}, ${s}%, ${l}%)`];

    const startL = Math.max(25, l - 15);
    const endL = Math.min(85, l + 30);
    const stepL = (endL - startL) / (steps - 1);

    for (let i = 0; i < steps; i++) {
        const currentL = Math.round(startL + (stepL * i));
        colors.push(`hsl(${h}, ${s}%, ${currentL}%)`);
    }
    return colors;
}

function preparePieChartData(dataset, config, allKeys, groupByColumn = null) {
    const xCol = config.xAxisColumn || allKeys[0];
    const excludeCols = [xCol, groupByColumn, config.subGroupByColumn];
    const yCols = (config.yAxisColumns && config.yAxisColumns.length > 0)
        ? config.yAxisColumns
        : allKeys.filter(k => !excludeCols.includes(k));
    const valueCol = yCols[0];

    if (!valueCol) {
        return { series: [], valueCol: null };
    }

    const aggType = config.aggregationType || 'AVG';
    const colorMode = config.pieColorMode || 'multicolor';

    // Para pastel monocromático forzamos orden por valor descendente, de lo contrario usamos la config de la vista
    const sortBy = colorMode === 'monochromatic' ? 'value' : (config.sortBy || 'natural');
    const sortOrder = colorMode === 'monochromatic' ? 'desc' : (config.sortOrder || 'asc');

    const { aggregatedDataset } = aggregateDataset(dataset, xCol, [valueCol], aggType, sortBy, sortOrder);

    let chartData;
    if (colorMode === 'monochromatic') {
        const sConf = config.seriesConfigs?.[valueCol] || {};
        const baseColor = sConf.color || '#ffa500';
        const colors = generateMonochromaticPalette(baseColor, aggregatedDataset.length);

        chartData = aggregatedDataset.map((row, index) => ({
            name: row[xCol],
            value: row[valueCol],
            itemStyle: {
                color: colors[index]
            }
        }));
    } else {
        // Modo Multicolor: ECharts aplica su paleta automática sobre el set ordenado
        chartData = aggregatedDataset.map(row => ({
            name: row[xCol],
            value: row[valueCol]
        }));
    }

    const sConf = config.seriesConfigs?.[valueCol] || {};
    return {
        valueCol,
        series: [
            {
                name: sConf.alias || valueCol,
                data: chartData
            }
        ]
    };
}

/**
 * Construye las series para gráficas estándar (barras, líneas).
 */
function buildSeries(aggregatedDataset, yCols, config, vizType) {
    return yCols.map(yCol => {
        const sConf = config.seriesConfigs?.[yCol] || {};

        return {
            name: sConf.alias || yCol,
            type: vizType === 'horizontal_line' ? 'line' : vizType,
            data: aggregatedDataset.map(r => r[yCol]),
            smooth: true,
            symbol: 'circle',
            symbolSize: 8,
            lineStyle: {
                width: 3,
                type: 'solid',
                color: sConf.color || undefined
            },
            itemStyle: {
                color: sConf.color || undefined
            }
        };
    });
}

// ========== EXPORTED FUNCTIONS ==========

/**
 * Genera una opción de ECharts de forma pura basado en un dataset y su configuración.
 * Selecciona el builder correcto usando Strategy Pattern.
 */
export function createStaticOption(dataset, title = '', config, allKeys = [], groupByColumn = null) {
    if (!dataset || dataset.length === 0) return {};

    const vizType = config.visualizationType;

    if (vizType === 'pie') {
        const builder = chartBuilders.pie;
        const { series } = preparePieChartData(dataset, config, allKeys, groupByColumn);
        return builder(dataset, config, [], series, title);
    }

    const { xAxisData, aggregatedDataset, yCols } = prepareChartData(dataset, config, allKeys, groupByColumn);

    // Strategy Pattern: Seleccionar el builder correcto
    const builder = chartBuilders[vizType] || chartBuilders.bar;

    // El builder de radar tiene una firma diferente
    if (vizType === 'radar') {
        return builder(aggregatedDataset, config, xAxisData, yCols, title);
    }

    // Para otros tipos, construir series primero
    const series = buildSeries(aggregatedDataset, yCols, config, vizType);
    return builder(aggregatedDataset, config, xAxisData, series, title);
}

/**
 * Función principal de orquestación.
 * Detecta si hay agrupaciones activas y decide si generar una sola gráfica,
 * un array de gráficas simples, o una estructura de secciones completas.
 */
export function generateEChartsOption(state, data_table) {
    if (!data_table || !data_table.registros || data_table.registros.length === 0) {
        state.chartOption.value = {};
        state.chartOptions.value = [];
        state.chartSections.value = [];
        return;
    }

    const firstRow = data_table.registros[0];
    const allKeys = Object.keys(firstRow).filter(k => !k.startsWith('ignorar_'));

    // ESCENARIO 4: Pivot Dimensión → Series (formato largo a series múltiples)
    const dimCol = state.dimensionColumn?.value;
    const valCol = state.valueColumn?.value;
    if (dimCol && valCol && allKeys.includes(dimCol) && allKeys.includes(valCol)) {
        state.chartOption.value = buildDimensionToSeriesOption(
            data_table.registros, state, state.configs.value.Global, allKeys
        );
        state.chartOptions.value = [];
        state.chartSections.value = [];
        return;
    }

    // ESCENARIO 1: Hay Agrupación por Secciones (groupByColumn)
    if (state.groupByColumn.value && allKeys.includes(state.groupByColumn.value)) {
        const sections = {};
        data_table.registros.forEach(row => {
            const sKey = row[state.groupByColumn.value];
            if (!sections[sKey]) sections[sKey] = [];
            sections[sKey].push(row);
        });

        state.chartSections.value = Object.keys(sections).map(sKey => {
            const sectionData = sections[sKey];
            const sectionConfig = state.configs.value[sKey] || state.configs.value.Global;
            const subGroupCol = sectionConfig.subGroupByColumn;

            // Si la sección tiene además una sub-agrupación (Dimensiones)
            if (subGroupCol && allKeys.includes(subGroupCol)) {
                const subGroups = {};
                sectionData.forEach(row => {
                    const subKey = row[subGroupCol];
                    if (!subGroups[subKey]) subGroups[subKey] = [];
                    subGroups[subKey].push(row);
                });

                return {
                    title: `${state.groupByColumn.value}: ${sKey}`,
                    configKey: sKey,
                    charts: Object.keys(subGroups).map(subKey => ({
                        id: subKey,
                        option: createStaticOption(subGroups[subKey], subKey, sectionConfig, allKeys, state.groupByColumn.value)
                    }))
                };
            }

            // Sección simple sin sub-agrupación
            return {
                title: `${state.groupByColumn.value}: ${sKey}`,
                configKey: sKey,
                charts: [{
                    id: sKey,
                    option: createStaticOption(sectionData, '', sectionConfig, allKeys, state.groupByColumn.value)
                }]
            };
        });
        state.chartOption.value = {};
        state.chartOptions.value = [];
    }
    // ESCENARIO 2: No hay secciones, pero hay sub-agrupación global (Dimensiones)
    else if (state.configs.value.Global.subGroupByColumn && allKeys.includes(state.configs.value.Global.subGroupByColumn)) {
        const subGroupCol = state.configs.value.Global.subGroupByColumn;
        const subGroups = {};
        data_table.registros.forEach(row => {
            const subKey = row[subGroupCol];
            if (!subGroups[subKey]) subGroups[subKey] = [];
            subGroups[subKey].push(row);
        });

        state.chartOptions.value = Object.keys(subGroups).map(subKey => {
            const subConfig = state.configs.value[subKey] || state.configs.value.Global;
            return {
                id: subKey,
                configKey: subKey,
                option: createStaticOption(subGroups[subKey], subKey, subConfig, allKeys, state.groupByColumn.value)
            };
        });
        state.chartOption.value = {};
        state.chartSections.value = [];
    }
    // ESCENARIO 3: Gráfica única (Vista estándar)
    else {
        state.chartOption.value = createStaticOption(
            data_table.registros,
            '',
            state.configs.value.Global,
            allKeys,
            state.groupByColumn.value
        );
        state.chartOptions.value = [];
        state.chartSections.value = [];
    }
}
