# ReadExcel Component

El componente `ReadExcel` es una utilidad robusta diseñada para procesar archivos de Excel (`.xlsx`, `.xls`) y convertir su contenido en una estructura JSON organizada y validada. Soporta tanto mapeos simples basados en nombres de columnas como estructuras complejas con celdas combinadas.

## Características

- **Detección Automática de Estructura**: Identifica si el archivo sigue un formato simple (una fila de encabezados) o complejo (encabezados con celdas combinadas o grupos específicos).
- **Mapeo de Columnas**: Visualiza en tiempo real qué columnas del Excel han sido detectadas y a qué campo del sistema corresponden.
- **Soporte para Anidamiento**: Permite agrupar datos mediante una sintaxis especial en los encabezados del Excel.
- **Modo Complejo con Merges**: Capacidad para leer archivos donde los encabezados ocupan múltiples filas o tienen celdas combinadas (típico en exportaciones de reportes).

## Uso Básico

```vue
<template>
  <ReadExcel
    :grupos="['Información General', 'Resultados']"
    @update:json="handleData"
    @excel-loaded="onLoadComplete"
  />
</template>

<script setup>
const handleData = (json) => {
  console.log("Datos procesados:", json);
};

const onLoadComplete = () => {
  console.log("Archivo cargado y procesado con éxito.");
};
</script>
```

## Props

| Prop | Tipo | Default | Descripción |
| :--- | :--- | :--- | :--- |
| `grupos` | `Array` | `['Datos']` | Lista de nombres de grupos permitidos. El primero actúa como grupo por defecto si no se especifica uno en el Excel. |
| `extraComplexGroups` | `Array` | `[]` | Configuración adicional para la detección de campos específicos en archivos de estructura muy irregular. |

## Emits

| Evento | Payload | Descripción |
| :--- | :--- | :--- |
| `update:json` | `Array` | Se emite al finalizar el procesamiento. Contiene un arreglo de objetos con los datos del Excel. |
| `excel-loaded` | - | Se emite inmediatamente después de procesar el archivo, indicando que la operación terminó. |

## Estructura del Excel (Modo Simple)

El componente busca patrones en los encabezados para organizar el JSON resultante:

1.  **Formato Simple**: `Nombre de Columna`
    - Genera: `{ "Datos": { "Nombre de Columna": valor } }` (usando el grupo por defecto).
2.  **Formato de Grupo**: `Grupo - Nombre de Columna`
    - Genera: `{ "Grupo": { "Nombre de Columna": valor } }`
3.  **Formato Anidado**: `Grupo(Subgrupo) - Nombre de Columna`
    - Genera: `{ "Grupo": { "Subgrupo": { "Nombre de Columna": valor } } }`

## Dependencias

- `xlsx`: Biblioteca base para la lectura de documentos Excel.
- `FileDropZone`: Componente interno para la selección de archivos (drag & drop).
