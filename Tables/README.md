# Tables Components Documentation

Este directorio contiene componentes reutilizables basados en tablas dinámicas para la gestión de datos en el sistema Gestión de Talento (GT).

---

# 1. EditingTable Component

## Description

`EditingTable` es un componente Vue 3 que permite renderizar una **tabla dinámica editable** con controles avanzados, ideal para formularios complejos donde se necesita interacción entre selects y filas de tabla.

### Features

- Selects dinámicos filtrables
- Validaciones numéricas (0–100)
- Suma total de columnas con reglas de validación
- Botones dinámicos por fila (Iconos, SVG, Dropdown)
- Modal de catálogo para agregar filas (o evento personalizado)
- Loading overlay y switch de control de edición

## Props

| Prop                | Tipo    | Default | Descripción                                                                                                                                                      |
| :------------------ | :------ | :------ | :--------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `selects`           | Array   | `[]`    | Arreglo de selects dinámicos: `{ key, label, options, required, default, visible }`.                                                                             |
| `columns`           | Array   | `[]`    | Definición de columnas: `{ key, label, editable, renderButtons, headerAlign, align, inputType, validateNumbers, min, max, required, allowDecimals, formatter }`. |
| `rows`              | Array   | `[]`    | Datos de filas a mostrar en la tabla.                                                                                                                            |
| `editable`          | Boolean | `false` | Habilita o deshabilita la posibilidad de editar.                                                                                                                 |
| `loading`           | Boolean | `false` | Muestra overlay de carga.                                                                                                                                        |
| `validateNumbers`   | Boolean | `false` | Activa validación numérica (0-100) global para inputs editables.                                                                                                 |
| `sumRules`          | Array   | `[]`    | Reglas de suma: `{ column, target, validation }`.                                                                                                                |
| `requireInputs`     | Boolean | `false` | Marca los inputs como requeridos por defecto.                                                                                                                    |
| `catalogoOptions`   | Array   | `[]`    | Opciones para el catálogo de "Agregar".                                                                                                                          |
| `mensaje`           | String  | `""`    | Mensaje de advertencia opcional arriba de la tabla.                                                                                                              |
| `useCustomAddEvent` | Boolean | `false` | Si es `true`, el botón `+` emite `onAddCustom` en lugar de abrir el catálogo.                                                                                    |
| `hideActions`       | Boolean | `false` | Oculta los botones de Guardar y Cancelar.                                                                                                                        |

## Emits

| Evento                   | Parámetros | Descripción                                                          |
| :----------------------- | :--------- | :------------------------------------------------------------------- |
| `fetch-data`             | `Object`   | Devuelve los valores de los selects cuando cambian o se inicializan. |
| `save-data`              | `Object`   | Devuelve los datos de la tabla y los selects al pulsar Guardar.      |
| `editing-changed`        | `Boolean`  | Indica si el switch de edición ha cambiado de estado.                |
| `onButtonAction`         | `Object`   | `{ action, row }` cuando se pulsa un botón dinámico.                 |
| `onAddRowsPonderaciones` | `Object`   | Filas seleccionadas desde el catálogo interno.                       |
| `onAddCustom`            | `Object`   | Emitido al pulsar `+` si `useCustomAddEvent` es `true`.              |

## Usage Example (EditingTable)

```vue
<template>
  <EditingTable
    :selects="selectOptions"
    :columns="tableColumns"
    :rows="tableRows"
    :editable="true"
    :loading="isLoading"
    :validateNumbers="true"
    :sumRules="sumRules"
    :requireInputs="true"
    :catalogoOptions="catalogoItems"
    @fetch-data="handleFetch"
    @save-data="handleSave"
    @editing-changed="handleEditingChange"
    @onButtonAction="handleButtonAction"
    @onAddRowsPonderaciones="handleAddRows"
  />
</template>

<script>
import EditingTable from "@/components/Tables/TableEditing.vue";

export default {
  components: { EditingTable },
  data() {
    return {
      selectOptions: [
        {
          key: "categoria",
          label: "Categoría",
          options: ["A", "B"],
          required: true,
          visible: true,
        },
      ],
      tableColumns: [
        { key: "nombre", label: "Nombre", editable: false },
        {
          key: "porcentaje",
          label: "Porcentaje",
          editable: true,
          inputType: "number",
          validateNumbers: true,
          renderButtons: (row) => [
            {
              type: "icon",
              icono: "trash.svg",
              action: "delete",
              label: "Eliminar",
            },
          ],
        },
      ],
      tableRows: [
        { nombre: "Item 1", porcentaje: 30 },
        { nombre: "Item 2", porcentaje: 70 },
      ],
      catalogoItems: [
        { id: 1, label: "Extra 1" },
        { id: 2, label: "Extra 2" },
      ],
      sumRules: [{ column: "porcentaje", target: 100, validation: true }],
      isLoading: false,
    };
  },
  methods: {
    handleFetch(data) {
      console.log("Fetch:", data);
    },
    handleSave(data) {
      console.log("Save:", data);
    },
    handleEditingChange(isEditing) {
      console.log("Editing:", isEditing);
    },
    handleButtonAction({ action, row }) {
      console.log("Action:", action, "Row:", row);
    },
    handleAddRows(data) {
      console.log("Add Rows:", data);
    },
  },
};
</script>
```

---

# 2. TableSelect Component

## Description

`TableSelect` es una utilidad diseñada para integrarse con `TablaDinamica` y el módulo `reporteador` de Vuex. Permite seleccionar registros de una tabla (individualmente o por lotes) para procesos de asignación masiva.

### Features

- **Integración con Reporteador**: Lee las configuraciones de tabla directamente desde Vuex.
- **Paginación Dinámica**: Permite cambiar el número de registros visibles de forma interactiva.
- **Modos de Selección**: Soporta selección múltiple (Checkboxes + Botonera) o selección individual (Botón directo).
- **Filtros Dinámicos**: Permite inyectar filtros de estado o parámetros SQL (`queryData`) antes de renderizar la tabla.
- **Teleporting**: Inyecta los controles de selección en la última columna de la tabla de forma automática.

## Props

| Prop           | Tipo     | Default      | Descripción                                                        |
| :------------- | :------- | :----------- | :----------------------------------------------------------------- |
| `tablaNombre`  | `String` | **Required** | Nombre de la tabla en el store (ej: `TB_GT_OFICINAS`).             |
| `campoId`      | `String` | **Required** | Nombre de la columna que actúa como ID (ej: `id_oficina`).         |
| `modo`         | `String` | `"multiple"` | Tipo de selección: `"multiple"` o `"individual"`.                  |
| `filtroEstado` | `Object` | `null`       | Objeto opcional `{ campo, valor }` para filtrar al cargar.         |
| `queryData`    | `Array`  | `null`       | Parámetros SQL (`id_usuario`, etc.) para tablas que los requieran. |

## Emits

| Evento            | Payload  | Descripción                                                                  |
| :---------------- | :------- | :--------------------------------------------------------------------------- |
| `onAddMultiples`  | `Array`  | Arreglo de los IDs seleccionados cuando se pulsa "Agregar" en modo múltiple. |
| `onAddIndividual` | `Object` | Objeto de la fila completa cuando se pulsa "Seleccionar" en modo individual. |

## Usage Example (TableSelect)

```vue
<template>
  <TableSelect
    tablaNombre="TB_GT_OFICINAS"
    campoId="id_oficina"
    modo="multiple"
    :filtroEstado="{ campo: 'ignorar_estado', valor: 'A' }"
    @onAddMultiples="asignarOficinas"
  />
</template>

<script setup>
const asignarOficinas = (ids) => {
  console.log("IDs seleccionados para asignar:", ids);
};
</script>
```
