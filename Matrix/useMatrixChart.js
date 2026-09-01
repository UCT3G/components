import { computed } from 'vue';
import { getEmployeePhotoUrl } from '@/utils/utils';

const usuariosSvgPath = `M44.83.13c.37.06.73.15,1.06.27,1.19.41,2.32,1,3.33,1.76,2.03,1.51,3.54,3.68,4.15,6.15.99,3.96-.26,8.05-3.25,10.73-3.88,3.48-9.54,3.8-13.65.85s-5.7-8.29-3.68-13.13c1.42-3.43,4.6-6.24,8.36-6.64,1.16-.12,2.47-.18,3.68.02ZM50.95,10.98c0-4.49-3.64-8.14-8.14-8.14s-8.14,3.64-8.14,8.14,3.64,8.14,8.14,8.14,8.14-3.64,8.14-8.14Z M0,44.84v-1.59c3.34-9.18,13.94-13.81,23.07-9.87,4.51,1.94,7.95,5.56,9.42,10.24.3.95-.13,1.79-1.01,1.98-.76.16-1.46-.33-1.73-1.17-1.06-3.34-3.11-6.01-6.19-7.73-5.33-2.98-11.95-2.45-16.66,1.44C1.9,42.28,3.35,47.52,0,44.84Z M27.18,17.31c0,6.02-4.88,10.91-10.91,10.91s-10.91-4.88-10.91-10.91,4.88-10.91,10.91-10.91,10.91,4.88,10.91,10.91ZM24.41,17.31c0-4.49-3.64-8.14-8.14-8.14s-8.14,3.64-8.14,8.14,3.64,8.14,8.14,8.14,8.14-3.64,8.14-8.14Z M56.31,38.14c-1.19-3.75-3.63-6.65-7.17-8.3-5.12-2.39-11.14-1.59-15.48,1.84l-2.39-1.5c5.04-4.67,12.19-5.96,18.51-3.12,4.41,1.98,7.83,5.55,9.21,10.21.26.86-.15,1.7-.87,1.9-.67.19-1.52-.1-1.81-1.03Z`;

const getBadgeSvgUri = (count) => {
  const numStr = String(count);
  const totalWidth = Math.round(30 + numStr.length * 7.5);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${totalWidth}" height="20" viewBox="0 0 ${totalWidth} 20">
    <rect width="${totalWidth}" height="20" rx="10" fill="#ffffff" stroke="#cbd5e1" stroke-width="1"/>
    <g transform="translate(6, 4.5) scale(0.22)" fill="#334155">
      <path d="${usuariosSvgPath}"/>
    </g>
    <text x="24" y="14" text-anchor="start" fill="#0f172a" font-family="-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif" font-size="10.5" font-weight="500">${count}</text>
  </svg>`.trim();
  return `data:image/svg+xml;base64,${btoa(svg)}`;
};

const resolveCanvasColor = (color) => {
  if (!color) return null;
  if (color === 'var(--bs-success)') return '#198754';
  if (color === 'var(--bs-warning)') return '#ffc107';
  if (color === 'var(--bs-danger)') return '#dc3545';
  if (color === 'var(--bs-primary)') return '#0d6efd';
  if (color === 'var(--bs-info)') return '#0dcaf0';
  if (color === 'var(--bs-gray-600)' || color === 'var(--bs-secondary)') return '#6c757d';
  return color;
};

/**
 * Ajusta el texto insertando saltos de línea (\n) respetando límites de caracteres
 * y evitando cortar palabras a la mitad.
 */
const wrapText = (text, maxChars = 15) => {
  if (!text) return '';
  const words = text.split(' ');
  let currentLine = '';
  const lines = [];

  words.forEach(word => {
    if (word.length > maxChars) {
      if (currentLine) {
        lines.push(currentLine.trim());
        currentLine = '';
      }
      lines.push(word);
      return;
    }

    if ((currentLine + word).length > maxChars) {
      if (currentLine) lines.push(currentLine.trim());
      currentLine = word + ' ';
    } else {
      currentLine += word + ' ';
    }
  });

  if (currentLine) {
    lines.push(currentLine.trim());
  }

  return lines.join('\n');
};

/**
 * Composable para manejar la lógica del gráfico ECharts de la Matriz de Talento.
 * Separa la configuración visual del componente de UI.
 */
export function useMatrixChart({ config, colaboradores, verRejilla, cuadranteFiltro, busqueda, ranges, onSelectColaborador, onSelectCuadrante, click_perfil, click_cuadrante, colaboradores_seleccionados, colaborador_seleccionado }) {

  const N = computed(() => Math.round(Math.sqrt(config.value?.tipo_grid || 9)));

  // Rangos dinámicos
  const x_min = computed(() => ranges?.value?.x_min ?? 0);
  const x_max = computed(() => ranges?.value?.x_max ?? 100);
  const y_min = computed(() => ranges?.value?.y_min ?? 0);
  const y_max = computed(() => ranges?.value?.y_max ?? 100);

  const xRange = computed(() => x_max.value - x_min.value);
  const yRange = computed(() => y_max.value - y_min.value);
  const pasoX = computed(() => xRange.value / N.value);
  const pasoY = computed(() => yRange.value / N.value);

  // ── Utilidades Internas ──────────────────────────────────────────────
  const iniciales = (nombre = '') =>
    nombre.split(' ').slice(0, 2).map(w => w[0]?.toUpperCase() || '').join('');

  const getJitter = (id, axis = 'x') => {
    if (verRejilla?.value) return 0;
    const numericId = typeof id === 'number' ? id : (String(id || '').split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) || 1);
    const seed = axis === 'x' ? 12.9898 : 78.233;
    // El jitter debe ser proporcional al rango para que no se note demasiado o muy poco
    const factor = (axis === 'x' ? xRange.value : yRange.value) * 0.02;
    return (Math.abs(Math.sin(numericId * seed)) * factor * 2 - factor);
  };

  // ── Computeds de Datos ───────────────────────────────────────────────
  const colaboradoresFiltrados = computed(() => {
    let list = colaboradores.value || [];
    if (busqueda.value.trim()) {
      const q = busqueda.value.toLowerCase();
      list = list.filter(c => c.nombre?.toLowerCase().includes(q));
    }
    // Solo graficar colaboradores que tienen una caja válida asignada por el backend
    return list.filter(c => c.id_caja != null);
  });

  // ── Generación de Opciones de ECharts ───────────────────────────────
  const echartsOption = computed(() => {
    if (!config.value?.cajas) return {};
    const n = N.value;
    const cfg = config.value;
    const rawSel = colaboradores_seleccionados?.value ?? colaborador_seleccionado?.value;
    const idsSeleccionados = Array.isArray(rawSel)
      ? rawSel
      : (rawSel != null ? [rawSel] : []);

    // 1. Zonas coloreadas (markArea)
    const markAreaData = cfg.cajas.map(caja => {
      const areaXMin = x_min.value + (caja.columna - 1) * pasoX.value;
      const areaXMax = x_min.value + caja.columna * pasoX.value;
      const areaYMin = y_min.value + (caja.fila - 1) * pasoY.value;
      const areaYMax = y_min.value + caja.fila * pasoY.value;

      const activa = !cuadranteFiltro.value
        || (cuadranteFiltro.value.fila === caja.fila && cuadranteFiltro.value.columna === caja.columna);

      const opacityDefault = verRejilla.value ? 0.35 : 0.82;
      const opacityInactive = verRejilla.value ? 0.12 : 0.22;

      const countInBox = (colaboradoresFiltrados.value || []).filter(c => {
        return c.id_caja && caja.id_caja ? c.id_caja === caja.id_caja : false;
      }).length;

      const rawName = caja.nombre_caja || '';
      const maxChars = N.value === 4 ? 18 : N.value === 3 ? 26 : 34;
      const wrappedLines = wrapText(rawName, maxChars).split('\n');
      const boxNameText = wrappedLines.map(line => `{boxName|${line}}`).join('\n');

      const badgeUri = getBadgeSvgUri(countInBox);
      const badgeWidth = Math.round(30 + String(countInBox).length * 7.5);

      return [
        {
          name: [caja.icono, caja.nombre_caja].filter(Boolean).join(' ') || '—',
          xAxis: areaXMin, yAxis: areaYMin,
          label: {
            show: activa,
            position: 'insideTopLeft',
            distance: 8,
            formatter: () => countInBox > 0 ? `{badge|}  ${boxNameText}` : boxNameText,
            rich: {
              badge: {
                backgroundColor: {
                  image: badgeUri
                },
                width: badgeWidth,
                height: 20
              },
              boxName: {
                fontSize: cuadranteFiltro.value ? 12.5 : (N.value === 2 ? 13 : N.value === 3 ? 10.5 : 9),
                fontStyle: 'italic',
                fontWeight: '500',
                color: 'black',
                lineHeight: 14,
                padding: [4, 0, 0, 0]
              }
            }
          },
          itemStyle: {
            color: caja.color_hex || '#e9ecef',
            opacity: activa ? opacityDefault : opacityInactive
          }
        },
        { xAxis: areaXMax, yAxis: areaYMax }
      ];
    });

    // 2. Scatter: colaboradores con jittering
    const scatterData = colaboradoresFiltrados.value.map(c => {
      const q = c.id_caja ? config.value?.cajas?.find(caja => caja.id_caja === c.id_caja) || null : null;
      const enFiltro = !cuadranteFiltro.value
        || (cuadranteFiltro.value.fila === q?.fila && cuadranteFiltro.value.columna === q?.columna);

      const color = q?.color_hex || '#546e7a';
      const rawX = Number(c.valor_x ?? 0);
      const rawY = Number(c.valor_y ?? 0);

      const posX = rawX + getJitter(c.id, 'x');
      const posY = rawY + getJitter(c.id, 'y');
      const esSeleccionado = idsSeleccionados.includes(c.id);

      return {
        value: [posX, posY],
        nombre: c.nombre, 
        cargo: c.cargo || '', 
        id: c.id,
        id_caja: c.id_caja,
        no_empleado: c.no_empleado,
        etiqueta_trayectoria: c.etiqueta_trayectoria,
        es_mas_reciente: c.es_mas_reciente,
        color_borde: c.color_borde,
        status: c.status,
        valor_x: rawX, 
        valor_y: rawY,
        es_seleccionado: esSeleccionado,
        itemStyle: {
          color: '#ffffff',
          borderColor: color,
          borderWidth: 2,
          opacity: enFiltro ? 1 : 0.15,
          shadowBlur: enFiltro ? 10 : 0,
          shadowColor: 'rgba(0,0,0,0.3)'
        }
      };
    });

    return {
      backgroundColor: 'transparent',
      animation: true,
      animationDuration: 750,
      animationEasing: 'cubicInOut',
      grid: {
        top: 20,
        right: 25,
        bottom: verRejilla.value ? 55 : 35,
        left: verRejilla.value ? 55 : 35
      },
      tooltip: {
        show: false
      },
      xAxis: {
        type: 'value', min: x_min.value, max: x_max.value,
        name: cfg.titulo_eje_x || 'Eje X',
        nameLocation: 'middle',
        nameGap: verRejilla.value ? 35 : 18,
        nameTextStyle: { fontWeight: 700, fontSize: 12, color: '#64748b', fontStyle: 'italic' },
        interval: xRange.value / 10,
        axisLabel: { show: verRejilla.value, color: '#64748b', fontSize: 10, fontWeight: 600, formatter: '{value}.00' },
        axisTick: { show: verRejilla.value, length: 5, lineStyle: { color: '#94a3b8', width: 1.5 } },
        axisLine: { show: false },
        splitLine: { show: verRejilla.value, lineStyle: { color: '#fff', width: 1 } }
      },
      yAxis: {
        type: 'value', min: y_min.value, max: y_max.value,
        name: cfg.titulo_eje_y || 'Eje Y',
        nameLocation: 'middle',
        nameGap: verRejilla.value ? 40 : 20,
        nameTextStyle: { fontWeight: 700, fontSize: 12, color: '#64748b', fontStyle: 'italic' },
        interval: yRange.value / 10,
        axisLabel: { show: verRejilla.value, color: '#64748b', fontSize: 10, fontWeight: 600, formatter: '{value}.00' },
        axisTick: { show: verRejilla.value, length: 5, lineStyle: { color: '#94a3b8', width: 1.5 } },
        axisLine: { show: false },
        splitLine: { show: verRejilla.value, lineStyle: { color: '#fff', width: 1 } }
      },
      series: [
        // Serie de números de cuadrantes al fondo
        {
          type: 'scatter',
          z: 1,
          silent: true,
          symbolSize: 0,
          data: cfg.cajas.map(caja => {
            const cell_num = (caja.fila - 1) * n + caja.columna;
            return {
              value: [
                x_min.value + (caja.columna - 0.5) * pasoX.value,
                y_min.value + (caja.fila - 0.70) * pasoY.value
              ],
              label: {
                show: !cuadranteFiltro.value,
                position: 'inside',
                formatter: () => cell_num.toString(),
                fontSize: N.value === 2 ? 68 : N.value === 3 ? 54 : 36,
                fontWeight: 900,
                color: '#ffffff'
              }
            };
          })
        },
        {
          type: 'custom',
          z: 10,
          renderItem: (params, api) => {
            const center = api.coord([api.value(0), api.value(1)]);
            const data = scatterData[params.dataIndex];
            const n = N.value;
            const baseSize = n === 2 ? 46 : n === 3 ? 38 : 30;
            const size = cuadranteFiltro.value ? baseSize * 1.35 : baseSize;
            const r = size / 2;
            const q = data.id_caja ? config.value?.cajas?.find(caja => caja.id_caja === data.id_caja) || null : null;
            const color = q?.color_hex || '#546e7a';
            const enFiltro = !cuadranteFiltro.value || (cuadranteFiltro.value.fila === q?.fila && cuadranteFiltro.value.columna === q?.columna);
            const opacity = enFiltro ? 1 : 0.15;

            const strokeColor = resolveCanvasColor(data.color_borde) || color || '#546e7a';
            const children = [];

            const esSeleccionado = data.es_seleccionado;

            if (data.etiqueta_trayectoria) {
              const textLabel = String(data.etiqueta_trayectoria);
              const isLatest = data.es_mas_reciente;
              const bgFill = '#ffffff';
              const strokeWidth = isLatest ? 2.2 : 1.6;
              const textFill = isLatest ? '#0f172a' : '#334155';
              const trajectoryRadius = Math.max(16, r * 0.95);

              children.push({
                type: 'circle',
                z: 1,
                shape: { cx: center[0], cy: center[1], r: trajectoryRadius },
                style: {
                  fill: bgFill,
                  stroke: strokeColor,
                  lineWidth: strokeWidth,
                  opacity: opacity,
                  shadowBlur: 3,
                  shadowColor: 'rgba(15, 23, 42, 0.15)',
                  shadowOffsetY: 1
                }
              });

              const fontSize = Math.round(trajectoryRadius * 0.65);
              children.push({
                type: 'text',
                z: 3,
                style: {
                  text: textLabel,
                  x: center[0],
                  y: center[1],
                  fill: textFill,
                  align: 'center',
                  verticalAlign: 'middle',
                  font: `700 ${fontSize}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`,
                  opacity: opacity
                }
              });
            } else if (esSeleccionado) {
              // COLABORADOR SELECCIONADO EN MODO LOCAL: Renderizar Avatar Destacado con Foto
              const avatarSize = Math.max(36, r * 1.35);
              const avatarRadius = avatarSize / 2;

              // Círculo base blanco con sombra y borde de estado
              children.push({
                type: 'circle',
                z: 20,
                shape: { cx: center[0], cy: center[1], r: avatarRadius },
                style: {
                  fill: '#ffffff',
                  stroke: strokeColor,
                  lineWidth: 3,
                  shadowBlur: 12,
                  shadowColor: 'rgba(0, 0, 0, 0.35)',
                  shadowOffsetY: 2
                }
              });

              // Imagen con foto o iniciales
              if (data.no_empleado) {
                children.push({
                  type: 'image',
                  z: 21,
                  style: {
                    image: getEmployeePhotoUrl(data.no_empleado),
                    x: center[0] - avatarRadius + 1.5,
                    y: center[1] - avatarRadius + 1.5,
                    width: avatarSize - 3,
                    height: avatarSize - 3
                  },
                  clipPath: {
                    type: 'circle',
                    shape: { cx: center[0], cy: center[1], r: avatarRadius - 1.5 }
                  }
                });
              } else {
                const inis = iniciales(data.nombre);
                children.push({
                  type: 'circle',
                  z: 21,
                  shape: { cx: center[0], cy: center[1], r: avatarRadius - 1.5 },
                  style: { fill: strokeColor }
                });
                children.push({
                  type: 'text',
                  z: 22,
                  style: {
                    text: inis,
                    x: center[0],
                    y: center[1],
                    fill: '#ffffff',
                    align: 'center',
                    verticalAlign: 'middle',
                    font: `700 13px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`
                  }
                });
              }
            } else {
              // MODO MATRIZ GENERAL: Siempre renderizar puntos limpios (círculos)
              const dotRadius = Math.max(4, Math.min(6, r * 0.32));
              const dotColor = resolveCanvasColor(data.color_borde || data.color) || strokeColor || '#0f172a';

              children.push({
                type: 'circle',
                z: 2,
                silent: true,
                shape: { cx: center[0], cy: center[1], r: dotRadius },
                style: {
                  fill: dotColor,
                  stroke: '#ffffff',
                  lineWidth: 1,
                  opacity: opacity,
                  shadowBlur: enFiltro ? 4 : 0,
                  shadowColor: 'rgba(15, 23, 42, 0.25)'
                }
              });
            }

            return {
              type: 'group',
              children: children
            };
          },
          data: scatterData.map(d => ({
            name: d.nombre,
            value: d.value,
            ...d
          })),
          markArea: {
            z: -1, 
            silent: click_cuadrante ? !click_cuadrante.value : false,
            emphasis: { disabled: true },
            label: {
              show: true, position: 'insideTopLeft', distance: 10,
              fontSize: N.value === 2 ? 14 : N.value === 3 ? 11 : 9, // Tamaño discreto y limpio
              fontWeight: 'normal', color: '#334155', // Normal (no negrita), gris oscuro
              formatter: (params) => {
                const maxChars = N.value === 2 ? 25 : N.value === 3 ? 18 : 12;
                return wrapText(params.name, maxChars);
              }
            },
            data: markAreaData
          }
        }
      ]
    };
  });

  const handleChartClick = (params) => {
    if (params.componentType === 'markArea') {
      const caja = config.value?.cajas?.[params.dataIndex];
      if (caja) {
        onSelectCuadrante(caja);
      }
    } else if (params.componentType === 'series' && (params.componentSubType === 'scatter' || params.componentSubType === 'custom')) {
      if (!cuadranteFiltro.value && !params.data?.etiqueta_trayectoria) {
        return;
      }
      onSelectColaborador(params.data);
    }
  };

  return {
    echartsOption,
    handleChartClick,
    iniciales,
    getJitter
  };
}
