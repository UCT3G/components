# FileDropZone Component

El componente `FileDropZone` (interno: `FileSelector`) proporciona una interfaz intuitiva para la selección de archivos mediante "drag & drop" o clic, con soporte integrado para la validación de tipos y la descarga de archivos existentes desde el servidor.

## Características

- **Drag & Drop**: Zona interactiva para soltar archivos con estados visuales de arrastre.
- **Validación de Tipos**: Filtra archivos permitidos mediante extensiones o mimetypes.
- **Integración con Vuex**: Puede mostrar y descargar automáticamente un archivo existente referenciado en el store.
- **Diseño Responsivo**: Soporta un modo normal (horizontal) y un modo `stacked` (vertical).
- **Información Detallada**: Muestra el nombre y tamaño (formateado) del archivo seleccionado o existente.

## Uso Básico

```vue
<template>
  <FileDropZone
    accept=".pdf,.docx"
    @file-selected="handleFile"
  />
</template>

<script setup>
const handleFile = (file) => {
  console.log("Archivo seleccionado:", file.name);
};
</script>
```

## Uso con Archivo Existente (Vuex)

Si el componente debe mostrar un archivo que ya fue subido anteriormente:

```vue
<FileDropZone
  getterPath="BSC/getPlantillaActual"
  basePath="archivos/plantillas/"
  @file-selected="onNewFile"
/>
```

## Props

| Prop | Tipo | Default | Descripción |
| :--- | :--- | :--- | :--- |
| `accept` | `String` | `""` | Extensiones permitidas separadas por coma (ej: `.xlsx,.xls`). |
| `getterPath` | `String` | `null` | Ruta del getter en Vuex que devuelve el nombre del archivo guardado. |
| `basePath` | `String` | `""` | Ruta base en el servidor donde se aloja el archivo (se concatena con `DEV_BASE_URL`). |
| `stacked` | `Boolean` | `false` | Si es `true`, obliga a que la zona de carga y la info se apilen verticalmente. |

## Emits

| Evento | Payload | Descripción |
| :--- | :--- | :--- |
| `file-selected` | `File` | Se emite cuando el usuario selecciona un archivo válido. |

## Estilos

El componente utiliza variables CSS globales para mantener la consistencia visual:
- `--purple-sb`: Color de acento para la información del archivo.
- `--bs-gray-*`: Utilidades de color de Bootstrap para bordes y fondos.
