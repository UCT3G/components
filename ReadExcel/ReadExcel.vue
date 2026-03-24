<template>
  <div class="row">
    <!-- Lado izquierdo: Selector de archivo -->
    <div class="col-12 col-md-4 mb-1">
      <div class="sticky-top" style="top:1rem;">
        <FileDropZone stacked accept=".xlsx,.xls" @file-selected="processFile" />
      </div>
    </div>

    <!-- Lado derecho: Resultados -->
    <div class="col-12 col-md-8 result-scroll">
      <div v-if="detectedMode" class="d-flex flex-wrap gap-3">
        <div v-for="grupo in detectedMode === 'simple' ? gruposOrdenados : complexStructure"
              :key="detectedMode === 'simple' ? grupo : grupo.nombre"
              class="group-panel shadow-sm">

          <div class="group-header d-flex justify-content-between align-items-center"
                @click="toggleGrupo(detectedMode === 'simple' ? grupo : grupo.nombre)">
            <span>{{ detectedMode === 'simple' ? grupo : grupo.nombre }}</span>
            <span class="toggle-icon">{{ grupoAbierto[detectedMode === 'simple' ? grupo : grupo.nombre] ? '-' : '+' }}</span>
          </div>

          <div v-show="grupoAbierto[detectedMode === 'simple' ? grupo : grupo.nombre]" class="group-body">
            <table class="table table-hover table-sm mb-0">
              <thead class="table-light">
                <tr>
                  <th>#</th>
                  <th>Campo</th>
                  <th>Columna</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(field, idx) in detectedMode === 'simple' ? columnasPorGrupo[grupo] : grupo.campos"
                    :key="detectedMode === 'simple' ? field.original : field.nombre">
                  <td>{{ idx + 1 }}</td>
                  <td>{{ detectedMode === 'simple' ? field.displayName || field.original : field.nombre }}</td>
                  <td>{{ detectedMode === 'simple' ? field.columna : field.columna || 'No detectada' }}</td>
                </tr>
              </tbody>
            </table>
          </div>

        </div>
      </div>
    </div>

  </div>
</template>

<script>
import { defineComponent, ref, computed } from "vue";
import FileDropZone from "@/components/FileSelectors/FileDropZone.vue";
import * as XLSX from "xlsx";

export default defineComponent({
  name: "ExcelReader",
  components:{FileDropZone},
  props: {
    grupos: { type: Array, default: () => ["Datos"] },
    extraComplexGroups: { type: Array, default: () => [] }
  },
  emits: ["update:json", "excel-loaded"],
  setup(props, { emit }) {
    const columnas = ref([]);
    const filas = ref([]);
    const jsonFinal = ref(null);
    const columnMappings = ref([]);
    const grupoAbierto = ref({});
    const detectedMode = ref(null);
    const complexStructure = ref([]);
    const rawSheetData = ref(null);
    
    const gruposOrdenados = computed(() => {
      const todosGrupos = [...new Set(columnMappings.value.map(c => c?.grupo).filter(Boolean))];
      props.grupos.forEach(g => { if (!todosGrupos.includes(g)) todosGrupos.push(g); });
      return todosGrupos;
    });

    const columnasPorGrupo = computed(() => {
      const obj = {};
      gruposOrdenados.value.forEach(g => (obj[g] = []));
      columnMappings.value.forEach(c => { 
        if (c) {
          const displayName = c.subgrupo 
            ? `${c.subgrupo} → ${c.campo}` 
            : c.campo;
          obj[c.grupo].push({
            ...c,
            displayName
          });
        }
      });
      return obj;
    });

    const toggleGrupo = (grupo) => { grupoAbierto.value[grupo] = !grupoAbierto.value[grupo]; };

    const processFile = (file) => {
      const reader = new FileReader();
      reader.onload = (evt) => {
        const data = new Uint8Array(evt.target.result);
        const workbook = XLSX.read(data, { type: "array" });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        rawSheetData.value = sheet;
        detectStructure(sheet);
      };
      reader.readAsArrayBuffer(file);
    };

    const detectStructure = (sheet) => {
      const hasMergedCells = sheet['!merges'] && sheet['!merges'].length > 0;
      if (hasMergedCells) { detectedMode.value = 'complex'; processComplexExcel(sheet); }
      else {
        const range = XLSX.utils.decode_range(sheet['!ref']);
        let extraExists = false;
        props.extraComplexGroups.forEach(gr => {
          gr.campos.forEach(campo => {
            for (let row = range.s.r; row <= range.e.r; row++)
              for (let col = range.s.c; col <= range.e.c; col++)
                if (sheet[XLSX.utils.encode_cell({ r: row, c: col })]?.v === campo) extraExists = true;
          });
        });
        if (extraExists) { detectedMode.value = 'complex'; processComplexExcel(sheet); }
        else { detectedMode.value = 'simple'; processSimpleExcel(sheet); }
      }
    };

    const processSimpleExcel = (sheet) => {
      const json = XLSX.utils.sheet_to_json(sheet, { header: 1 });
      columnas.value = json[0] || [];
      filas.value = json.slice(1) || [];
      buildMappings();
      rebuildJSON();
    };

    const processComplexExcel = (sheet) => {
      const merges = sheet['!merges'] || [];
      const range = XLSX.utils.decode_range(sheet['!ref']);
      const headers = [];

      for (let col = range.s.c; col <= range.e.c; col++) {
        const cell = sheet[XLSX.utils.encode_cell({ r: range.s.r, c: col })]; if (!cell) continue;
        const merge = merges.find(m => m.s.c <= col && m.e.c >= col && m.s.r <= range.s.r && m.e.r >= range.s.r);
        if (merge) {
          const mainHeaderCell = XLSX.utils.encode_cell({ r: merge.s.r, c: merge.s.c });
          const mainHeader = sheet[mainHeaderCell]?.v;
          const subHeaders = [];
          for (let subCol = merge.s.c; subCol <= merge.e.c; subCol++) {
            const subCell = sheet[XLSX.utils.encode_cell({ r: merge.s.r + 1, c: subCol })];
            if (subCell) subHeaders.push({ nombre: subCell.v, columna: XLSX.utils.encode_col(subCol) });
          }
          if (mainHeader && !headers.find(h => h.nombre === mainHeader)) headers.push({ nombre: mainHeader, campos: subHeaders });
        }
      }

      const extraGroups = props.extraComplexGroups.map(g => ({
        nombre: g.nombre,
        campos: g.campos.map(c => ({ nombre: c, columna: null }))
      }));

      extraGroups.forEach(gr => {
        gr.campos.forEach((campo, idx) => {
          for (let col = range.s.c; col <= range.e.c; col++)
            for (let row = range.s.r; row <= range.s.r + 1; row++)
              if (sheet[XLSX.utils.encode_cell({ r: row, c: col })]?.v === campo.nombre)
                gr.campos[idx].columna = XLSX.utils.encode_col(col);
        });
      });

      complexStructure.value = [...headers, ...extraGroups];
      processComplexData(sheet, complexStructure.value);
    };

    const processComplexData = (sheet, structure) => {
      const range = XLSX.utils.decode_range(sheet['!ref']);
      const dataRows = [];

      for (let row = range.s.r + 2; row <= range.e.r; row++) {
        const rowData = { id: dataRows.length + 1 };
        let hasData = false;

        structure.forEach(grupo => {
          const grupoData = {};

          grupo.campos.forEach(campo => {
            if (!campo.columna) return;
            const cell = sheet[XLSX.utils.encode_cell({
              r: row,
              c: XLSX.utils.decode_col(campo.columna)
            })];

            if (cell?.v !== undefined && cell.v !== "") {
              grupoData[campo.nombre] = cell.v;
              hasData = true;
            }
          });

          if (Object.keys(grupoData).length)
            rowData[grupo.nombre] = grupoData;
        });

        if (hasData) dataRows.push(rowData);
      }

      jsonFinal.value = dataRows;
      emit("update:json", jsonFinal.value);
      emit("excel-loaded");
    };


    const buildMappings = () => {
      columnMappings.value = columnas.value.map((col, idx) => {
        // Si la columna está vacía o es undefined, skip
        if (!col || col.toString().trim() === '') {
          return null;
        }
        
        // Verificar si tiene datos en alguna fila
        const tieneValor = filas.value.some(row => {
          const valor = row[idx];
          return valor !== undefined && valor !== null && valor !== "";
        });
        
        if (!tieneValor) {
          return null;
        }
        
        // Parsear el nombre de la columna
        const colStr = col.toString().trim();
        
        if (colStr.includes("-")) {
          const [grupoCompleto, campo] = colStr.split("-").map(s => s.trim());
          
          // Detectar estructura anidada: Grupo(Subgrupo)
          if (grupoCompleto.includes("(") && grupoCompleto.includes(")")) {
            const match = grupoCompleto.match(/^(.+?)\((.+?)\)$/);
            if (match) {
              const [, grupoPrincipal, subgrupo] = match;
              return { 
                original: colStr, 
                grupo: grupoPrincipal.trim(),
                subgrupo: subgrupo.trim(),
                campo, 
                columna: XLSX.utils.encode_col(idx),
                indice: idx 
              };
            }
          }
          
          // Estructura simple: Grupo-Campo
          return { 
            original: colStr, 
            grupo: grupoCompleto, 
            campo, 
            columna: XLSX.utils.encode_col(idx),
            indice: idx 
          };
        }
        
        const defaultGrupo = props.grupos[0] || "Datos";
        console.log(`Mapeando: "${colStr}" → Grupo: "${defaultGrupo}", Campo: "${colStr}", Índice: ${idx}`);
        return { 
          original: colStr, 
          grupo: defaultGrupo, 
          campo: colStr, 
          columna: XLSX.utils.encode_col(idx),
          indice: idx 
        };
      }).filter(c => c !== null);
      
      gruposOrdenados.value.forEach(g => { grupoAbierto.value[g] = false; });
    };

    const rebuildJSON = () => {
      if (detectedMode.value === 'simple') {
        jsonFinal.value = filas.value.map((row, rowIdx) => {
          const obj = { __fila: rowIdx + 1 };
          
          columnMappings.value.forEach((map) => {
            if (!map) return;
            
            const valor = row[map.indice];
            const valorFinal = valor !== undefined && valor !== null ? valor : null;
            
            // Inicializar el grupo principal si no existe
            if (!obj[map.grupo]) {
              obj[map.grupo] = {};
            }
            
            // Si tiene subgrupo, crear estructura anidada
            if (map.subgrupo) {
              if (!obj[map.grupo][map.subgrupo]) {
                obj[map.grupo][map.subgrupo] = {};
              }
              obj[map.grupo][map.subgrupo][map.campo] = valorFinal;
            } else {
              // Estructura simple
              obj[map.grupo][map.campo] = valorFinal;
            }
          });
          
          return obj;
        });
        
        emit("update:json", jsonFinal.value);
        emit("excel-loaded");
      }
    };

    return {
      columnas, 
      filas, 
      columnMappings, 
      grupoAbierto, 
      detectedMode, 
      complexStructure, 
      gruposOrdenados, 
      columnasPorGrupo,
      toggleGrupo, 
      rebuildJSON, 
      processFile
    };
  }
});
</script>

<style scoped>
.sticky-top {
  z-index: 1 !important;
}

.result-scroll {
  max-height: calc(100vh - 235px); 
  overflow-y: auto;
  padding-right: 8px;
  padding-bottom: 50px;
}

.group-panel {
  flex: 1 1 300px;
  background-color: white;
  border-radius: 0.5rem;
  overflow: hidden;
  min-width: 200px;
}

.group-header {
  background-color: var(--blueBerryPastel);
  color: white;
  font-weight: bold;
  padding: 0.5rem 1rem;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.group-header:hover {
  background-color: var(--purple-sb-70);
}

.group-body {
  max-height: 250px;
  overflow-y: auto;
  padding: 0.3rem;
}

.table-hover tbody tr:hover {
  background-color: var(--bs-gray-200);
}

.toggle-icon {
  font-weight: bold;
}
</style>