# FileDropZone Component

El componente `FileDropZone` (interno: `FileSelector`) proporciona una interfaz intuitiva para la selección de archivos mediante "drag & drop" o clic, con soporte integrado para la validación de tipos y la descarga de archivos existentes desde el servidor.

## Características

- **Drag & Drop**: Zona interactiva para soltar archivos con estados visuales de arrastre.
- **Validación de Tipos**: Filtra archivos permitidos mediante extensiones o mimetypes.
- **Archivo existente vía Vuex**: Puede mostrar y descargar automáticamente un archivo referenciado en el store.
- **Archivo existente vía URL directa**: Alternativamente, acepta una URL explícita calculada en el componente padre (sin necesidad de Vuex).
- **Diseño Responsivo**: Soporta un modo normal (horizontal) y un modo `stacked` (vertical).
- **Información Detallada**: Muestra el nombre y tamaño (formateado) del archivo seleccionado o existente.

## Uso Básico

```vue
<template>
  <FileDropZone accept=".pdf,.docx" @file-selected="handleFile" />
</template>

<script setup>
const handleFile = (file) => {
  console.log("Archivo seleccionado:", file.name);
};
</script>
```

## Uso con Archivo Existente (Vuex)

Si el archivo existente se obtiene de un getter del store:

```vue
<FileDropZone
  getterPath="BSC/getPlantillaActual"
  basePath="media/plantillas/"
  @file-selected="onNewFile"
/>
```

## Uso con Archivo Existente (URL Directa)

Si la URL del archivo existente se calcula en el componente padre (por ejemplo, a partir de props o IDs), usa `directUrl`. Tiene prioridad sobre `getterPath`.

```vue
<FileDropZone
  accept=".html"
  :directUrl="htmlExistenteUrl"
  :stacked="true"
  @file-selected="onHtmlFileChange"
/>

<script setup>
// La URL se computa desde props — sin necesidad de un getter en Vuex
const htmlExistenteUrl = computed(() => {
  if (!props.editingId) return null;
  return `${DEV_BASE_URL}media/Templates/Reportes/modulo_${props.moduloId}/estructuras/html/${props.editingId}.html`;
});
</script>
```

> Cuando `directUrl` está definida, el nombre del archivo se extrae automáticamente del último segmento de la URL.

## Props

| Prop         | Tipo      | Default | Descripción                                                                                           |
| :----------- | :-------- | :------ | :---------------------------------------------------------------------------------------------------- |
| `accept`     | `String`  | `""`    | Extensiones permitidas separadas por coma (ej: `.xlsx,.xls`).                                         |
| `getterPath` | `String`  | `null`  | Ruta del getter en Vuex que devuelve el nombre del archivo guardado.                                  |
| `basePath`   | `String`  | `""`    | Ruta base en el servidor donde se aloja el archivo (se concatena con `DEV_BASE_URL`). Solo aplica con `getterPath`. |
| `directUrl`  | `String`  | `null`  | URL directa del archivo existente. Tiene prioridad sobre `getterPath`. Útil cuando la URL se calcula desde props del padre. |
| `stacked`    | `Boolean` | `false` | Si es `true`, obliga a que la zona de carga y la info se apilen verticalmente.                        |

## Prioridad de la URL del archivo existente

```
directUrl (si está definida)
  └── tiene prioridad absoluta

getterPath (si directUrl es null)
  └── store.getters[getterPath] + DEV_BASE_URL + basePath

ninguno → no se muestra archivo existente
```

## Emits

| Evento          | Payload | Descripción                                              |
| :-------------- | :------ | :------------------------------------------------------- |
| `file-selected` | `File`  | Se emite cuando el usuario selecciona un archivo válido. |

## Estilos

El componente utiliza variables CSS globales para mantener la consistencia visual:

- `--purple-sb`: Color de acento para la información del archivo.
- `--bs-gray-*`: Utilidades de color de Bootstrap para bordes y fondos.
