import { computed } from 'vue';
import { getEmployeePhotoUrl } from '@/utils/utils';

const usuarioSvgPaths = `
  <path d="M0,38.43v-1.59c3.34-9.18,13.94-13.81,23.07-9.87,4.51,1.94,7.95,5.56,9.42,10.24.3.95-.13,1.79-1.01,1.98-.76.16-1.46-.33-1.73-1.17-1.06-3.34-3.11-6.01-6.19-7.73-5.33-2.98-11.95-2.45-16.66,1.44C1.9,35.87,3.35,41.12,0,38.43Z"/>
  <path d="M27.18,10.91c0,6.02-4.88,10.91-10.91,10.91s-10.91-4.88-10.91-10.91S10.25,0,16.27,0s10.91,4.88,10.91,10.91ZM24.41,10.9c0-4.49-3.64-8.14-8.14-8.14s-8.14,3.64-8.14,8.14,3.64,8.14,8.14,8.14,8.14-3.64,8.14-8.14Z"/>
`;

const getBadgeSvgUri = (count) => {
  const numStr = String(count);
  const totalWidth = Math.round(22 + numStr.length * 6.8);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${totalWidth}" height="18" viewBox="0 0 ${totalWidth} 18">
    <rect width="${totalWidth}" height="18" rx="9" fill="#ffffff" stroke="#cbd5e1" stroke-width="1"/>
    <g transform="translate(5, 3.8) scale(0.24)" fill="#334155">
      ${usuarioSvgPaths}
    </g>
    <text x="15.5" y="12.5" text-anchor="start" fill="#0f172a" font-family="-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif" font-size="9.5" font-weight="400">${count}</text>
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
 * Envuelve el título de la caja de forma adaptativa y generosa según el ancho real de la celda:
 * - maxL1: límite de caracteres para la línea 1 (descuenta badge si está activo).
 * - maxRest: límite de caracteres para las líneas siguientes (ancho completo de la celda).
 * - Admite hasta 3 líneas naturales antes de aplicar elipsis si el texto es muy largo.
 * - Reconoce separadores comunes (/ y -) como saltos naturales.
 */
const wrapBoxTitle = (text, maxL1 = 26, maxRest = 32, maxLines = 3) => {
  if (!text) return [];

  // Normalizar separadores comunes para permitir quiebres limpios
  const normalized = text
    .replace(/\//g, ' / ')
    .replace(/-/g, ' - ')
    .replace(/\s+/g, ' ')
    .trim();

  const words = normalized.split(' ').filter(Boolean);
  if (!words.length) return [];

  const lines = [];
  let currentLine = '';
  let wordIndex = 0;

  while (wordIndex < words.length && lines.length < maxLines) {
    const isFirstLine = lines.length === 0;
    const currentMax = isFirstLine ? maxL1 : maxRest;
    const isLastAllowedLine = lines.length === maxLines - 1;
    const word = words[wordIndex];

    if (!currentLine) {
      if (word.length <= currentMax) {
        currentLine = word;
        wordIndex++;
      } else {
        if (isLastAllowedLine) {
          currentLine = word.slice(0, currentMax - 1) + '…';
          wordIndex = words.length;
        } else {
          currentLine = word;
          wordIndex++;
        }
      }
    } else {
      if ((currentLine + ' ' + word).length <= currentMax) {
        currentLine += ' ' + word;
        wordIndex++;
      } else {
        lines.push(currentLine);
        currentLine = '';
      }
    }
  }

  if (currentLine && lines.length < maxLines) {
    if (wordIndex < words.length && !currentLine.endsWith('…')) {
      const currentMax = lines.length === 0 ? maxL1 : maxRest;
      if (currentLine.length + 1 <= currentMax) {
        currentLine += '…';
      } else {
        currentLine = currentLine.slice(0, currentMax - 1).trim() + '…';
      }
    }
    lines.push(currentLine);
  }

  return lines;
};

/**
 * Composable para manejar la lógica del gráfico ECharts de la Matriz de Talento.
 * Separa la configuración visual del componente de UI.
 */
export function useMatrixChart({ config, colaboradores, verRejilla, cuadranteFiltro, busqueda, ranges, containerWidth, onSelectColaborador, onSelectCuadrante, click_perfil, click_cuadrante, colaboradores_seleccionados, colaborador_seleccionado }) {

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
    // El jitter debe ser sutil y proporcional al rango para no falsear calificaciones (desfase sutil de ~4 a 5px)
    const factor = (axis === 'x' ? xRange.value : yRange.value) * 0.007;
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

  /**
   * Renderizador visual unificado para los elementos de colaboradores (burbujas, avatares y puntos).
   * Se reutiliza entre la serie base y la serie seleccionada.
   */
  const renderColaboradorItem = (params, api, dataset) => {
    const center = api.coord([api.value(0), api.value(1)]);
    const data = dataset?.[params.dataIndex];
    if (!data) return;

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
      // COLABORADOR SELECCIONADO EN MODO LOCAL: Renderizar Avatar Destacado con Foto Proporcional
      const cx = Math.round(center[0]);
      const cy = Math.round(center[1]);
      const avatarSize = Math.round(Math.max(38, r * 1.35));
      const avatarRadius = avatarSize / 2;
      const innerRadius = avatarRadius - 1.5;
      const innerDiameter = innerRadius * 2;

      // Círculo base blanco con sombra y borde de estado
      children.push({
        type: 'circle',
        z: 20,
        shape: { cx, cy, r: avatarRadius },
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
        // Las fotos institucionales de RH tienen proporción vertical 3:4 (~1.33).
        // Calculamos el alto proporcional para cubrir el círculo sin aplastar ni deformar el rostro:
        const imgWidth = innerDiameter;
        const imgHeight = Math.round(imgWidth * 1.333);
        const imgX = cx - innerRadius;
        // Centrado vertical compensado al 42% para enfocar el rostro:
        const imgY = cy - Math.round(imgHeight * 0.42);

        children.push({
          type: 'image',
          z: 21,
          style: {
            image: getEmployeePhotoUrl(data.no_empleado),
            x: imgX,
            y: imgY,
            width: imgWidth,
            height: imgHeight
          },
          clipPath: {
            type: 'circle',
            shape: { cx, cy, r: innerRadius }
          }
        });
      } else {
        const inis = iniciales(data.nombre);
        children.push({
          type: 'circle',
          z: 21,
          shape: { cx, cy, r: innerRadius },
          style: { fill: strokeColor }
        });
        children.push({
          type: 'text',
          z: 22,
          style: {
            text: inis,
            x: cx,
            y: cy,
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
  };

  // ── Generación de Opciones de ECharts ───────────────────────────────
  const echartsOption = computed(() => {
    if (!config.value?.cajas) return {};
    const n = N.value;
    const cfg = config.value;
    const rawSel = colaboradores_seleccionados?.value ?? colaborador_seleccionado?.value;
    const idsSeleccionados = Array.isArray(rawSel)
      ? rawSel
      : (rawSel != null ? [rawSel] : []);

    const esModoTrayectoria = (colaboradoresFiltrados.value || []).some(c => !!c.etiqueta_trayectoria);

    // Cálculo reactivo del ancho real por cuadrante y caracteres disponibles
    const N_val = N.value || 3;
    const currentContainerW = containerWidth?.value || 750;
    const gridNetW = Math.max(280, currentContainerW - (verRejilla.value ? 90 : 60));
    const cellW = gridNetW / N_val;
    const usefulCellW = Math.max(40, cellW - 16);
    const fontSize = cuadranteFiltro.value ? 12.5 : (N_val === 2 ? 13 : N_val === 3 ? 10.5 : 9);
    const avgCharW = Math.max(4.6, fontSize * 0.58);

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

      const showBadge = !esModoTrayectoria && countInBox > 0;
      const badgeUri = showBadge ? getBadgeSvgUri(countInBox) : '';
      const badgeWidth = showBadge ? Math.round(22 + String(countInBox).length * 6.8) : 0;

      // Límites dinámicos exactos calculados a partir de los píxeles reales del cuadrante
      const maxL1 = showBadge
        ? Math.max(8, Math.floor((usefulCellW - badgeWidth - 6) / avgCharW))
        : Math.max(12, Math.floor(usefulCellW / avgCharW));
      const maxRest = Math.max(12, Math.floor(usefulCellW / avgCharW));

      const rawName = caja.nombre_caja || '';
      const wrappedLines = wrapBoxTitle(rawName, maxL1, maxRest, 3);

      const boxLabelFormatter = () => {
        if (!wrappedLines.length) return '';
        if (showBadge) {
          const [first, ...rest] = wrappedLines;
          if (!rest.length) {
            return `{badge|}  {boxName|${first}}`;
          }
          return `{badge|}  {boxName|${first}}\n` + rest.map(line => `{boxName|${line}}`).join('\n');
        }
        return wrappedLines.map(line => `{boxName|${line}}`).join('\n');
      };

      return [
        {
          name: [caja.icono, caja.nombre_caja].filter(Boolean).join(' ') || '—',
          xAxis: areaXMin, yAxis: areaYMin,
          label: {
            show: activa,
            position: 'insideTopLeft',
            distance: 8,
            formatter: boxLabelFormatter,
            rich: {
              badge: {
                backgroundColor: {
                  image: badgeUri
                },
                width: badgeWidth,
                height: 18
              },
              boxName: {
                fontSize: cuadranteFiltro.value ? 12.5 : (N.value === 2 ? 13 : N.value === 3 ? 10.5 : 9),
                fontStyle: 'normal',
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

    // 2. Scatter: colaboradores con jittering (máximo 10 por cuadrante en modo general para evitar saturar)
    const MAX_PUNTOS_POR_CUADRANTE = 10;

    let colaboradoresParaGraficar = colaboradoresFiltrados.value || [];

    if (!esModoTrayectoria && colaboradoresParaGraficar.length > 0) {
      const porCaja = new Map();
      colaboradoresParaGraficar.forEach(c => {
        const key = c.id_caja ?? 'sin_caja';
        if (!porCaja.has(key)) porCaja.set(key, []);
        porCaja.get(key).push(c);
      });

      const listaLimitada = [];
      porCaja.forEach(colabs => {
        if (colabs.length <= MAX_PUNTOS_POR_CUADRANTE) {
          listaLimitada.push(...colabs);
        } else {
          // Priorizar siempre los colaboradores seleccionados para que nunca desaparezcan
          const seleccionados = colabs.filter(c => idsSeleccionados.includes(c.id));
          const noSeleccionados = colabs.filter(c => !idsSeleccionados.includes(c.id));

          const cuposRestantes = Math.max(0, MAX_PUNTOS_POR_CUADRANTE - seleccionados.length);
          const muestra = noSeleccionados.slice(0, cuposRestantes);

          listaLimitada.push(...muestra, ...seleccionados);
        }
      });

      colaboradoresParaGraficar = listaLimitada;
    }

    const scatterData = colaboradoresParaGraficar.map(c => {
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
        puesto: c.puesto || '',
        id: c.id,
        id_usuario_evaluacion: c.id_usuario_evaluacion,
        id_caja: c.id_caja,
        no_empleado: c.no_empleado,
        etiqueta_trayectoria: c.etiqueta_trayectoria,
        es_mas_reciente: c.es_mas_reciente,
        color_borde: c.color_borde,
        status: c.status,
        ejercicio: c.ejercicio,
        periodo: c.periodo,
        nombre_perfil: c.nombre_perfil,
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

    // Separamos en dos capas independientes:
    // 1. Capa base (puntos normales y trayectoria histórica) con z: 10
    // 2. Capa seleccionada (colaboradores seleccionados con foto y evaluación más reciente) con z: 50
    // Al manejar capas con niveles 'z' independientes en ECharts, el motor Canvas dibuja
    // físicamente la serie seleccionada DESPUÉS de todos los puntos base, garantizando
    // que ningún punto cercano o con coordenadas idénticas tape la foto del colaborador.
    const scatterDataPuntos = scatterData.filter(d => !d.es_seleccionado && !d.es_mas_reciente);
    const scatterDataSeleccionados = scatterData.filter(d => d.es_seleccionado || d.es_mas_reciente);

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
        // Capa 1: Puntos normales no seleccionados y cuadrantes de fondo (z: 10)
        {
          name: 'colaboradores-base',
          type: 'custom',
          z: 10,
          renderItem: (params, api) => renderColaboradorItem(params, api, scatterDataPuntos),
          data: scatterDataPuntos.map(d => ({
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
        },
        // Capa 2: Colaborador(es) seleccionado(s) con avatar/foto (z: 50)
        // Al estar en una serie independiente con nivel z superior (z: 50 > z: 10),
        // ECharts/ZRender garantiza en Canvas que la foto siempre se pinte encima de cualquier punto.
        {
          name: 'colaboradores-seleccionados',
          type: 'custom',
          z: 50,
          renderItem: (params, api) => renderColaboradorItem(params, api, scatterDataSeleccionados),
          data: scatterDataSeleccionados.map(d => ({
            name: d.nombre,
            value: d.value,
            ...d
          }))
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
        // En la matriz general, hacer clic sobre la foto o punto de un colaborador abre el cuadrante al que pertenece
        if (params.data?.id_caja) {
          const caja = config.value?.cajas?.find(c => c.id_caja === params.data.id_caja);
          if (caja) {
            onSelectCuadrante(caja);
          }
        }
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
