# EditingTable Component

## Description

`EditingTable` es un componente Vue 3 que permite renderizar una **tabla dinámica editable** con controles avanzados, como:

- Selects dinámicos filtrables
- Validaciones numéricas (0–100)
- Suma total de columnas con reglas de validación
- Botones dinámicos por fila
- Modal de catálogo para agregar filas
- Loading overlay
- Control de edición mediante switch

Ideal para formularios complejos donde se necesita **interacción entre selects y filas de tabla**.

---

## Features

- **Dynamic Selects:** Muestra selects configurables dinámicamente, con validación de campos obligatorios.
- **Editable Table:** Permite editar celdas si `editable` es true y los selects requeridos están completos.
- **Validation Rules:** Validación de suma de columnas con reglas definidas en `sumRules`.
- **Buttons per Row:** Renderiza botones dinámicos o íconos en cada fila según la configuración.
- **Catalog Modal:** Modal para agregar filas desde un catálogo externo.
- **Loading Overlay:** Cubre toda la pantalla mientras `loading` es true.
- **Cancel/Save:** Permite guardar o cancelar cambios.

---

## Props

| Prop | Tipo | Default | Descripción |
|------|------|--------|------------|
| `selects` | Array | [] | Array de selects dinámicos `{ key, label, options, required, default }` |
| `inputType` | String | `"text"` | Tipo de input para celdas editables |
| `columns` | Array | [] | Definición de columnas `{ key, label, editable, renderButtons }` |
| `rows` | Array | [] | Datos de filas a mostrar en la tabla |
| `editable` | Boolean | false | Habilita o deshabilita la edición de la tabla |
| `loading` | Boolean | false | Muestra overlay de carga |
| `validateNumbers` | Boolean | false | Activa validación de 0–100 en inputs |
| `sumRules` | Array | [] | Reglas de suma para columnas `{ column, target, validation }` |
| `requireInputs` | Boolean | false | Marca los inputs como requeridos |
| `catalogoOptions` | Array | [] | Opciones del catálogo para agregar filas |

---

## Emits

| Evento | Parámetros | Descripción |
|--------|-----------|------------|
| `fetch-data` | Object | Devuelve los valores seleccionados de los selects |
| `save-data` | Object | Devuelve los datos de tabla y selects al guardar |
| `editing-changed` | Boolean | Indica si la edición está activa |
| `onButtonAction` | Object | Acción y fila cuando se hace click en un botón |
| `onAddRowsPonderaciones` | Object | Filas seleccionadas desde el modal catálogo |

---

## Usage

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
import EditingTable from '@/components/EditingTable.vue';

export default {
  components: { EditingTable },
  data() {
    return {
      selectOptions: [
        { key: 'categoria', label: 'Categoría', options: ['A','B'], required: true },
      ],
      tableColumns: [
        { key: 'nombre', label: 'Nombre', editable: true },
        { key: 'porcentaje', label: 'Porcentaje', editable: true, renderButtons: (row)=>[] },
      ],
      tableRows: [
        { nombre: 'Item 1', porcentaje: 30 },
        { nombre: 'Item 2', porcentaje: 70 },
      ],
      catalogoItems: [
        { id: 1, label: 'Extra 1' },
        { id: 2, label: 'Extra 2' },
      ],
      sumRules: [
        { column: 'porcentaje', target: 100, validation: true }
      ],
      isLoading: false
    };
  },
  methods: {
    handleFetch(data) { console.log('Fetch:', data); },
    handleSave(data) { console.log('Save:', data); },
    handleEditingChange(isEditing) { console.log('Editing:', isEditing); },
    handleButtonAction(action) { console.log('Button:', action); },
    handleAddRows(data) { console.log('Add Rows:', data); },
  }
};
</script>
