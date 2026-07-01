# FileDropZone Component

El componente `FileDropZone` (interno: `FileSelector`) proporciona una interfaz intuitiva para la selección de archivos mediante "drag & drop" o clic, con soporte integrado para la validación de tipos, descarga de archivos existentes desde el servidor, modo de selección múltiple y control de estados (como deshabilitado).

## Características

- **Drag & Drop**: Zona interactiva para soltar archivos con estados visuales reactivos al arrastrar (`is-dragover`).
- **Validación de Tipos**: Filtra archivos permitidos mediante extensiones o mimetypes en la selección y el arrastre.
- **Archivo existente vía Vuex**: En modo individual, puede mostrar y descargar automáticamente un archivo referenciado en el store.
- **Archivo existente vía URL directa**: Alternativamente, acepta una URL explícita calculada en el componente padre, teniendo prioridad sobre Vuex.
- **Modo Múltiple**: Soporta arrastrar/seleccionar múltiples archivos y gestionar una lista de archivos remotos ya existentes con opción de descarga y eliminación.
- **Estado Deshabilitado**: Deshabilita la interacción de carga y oculta los controles de eliminación para comportarse en modo de solo lectura.
- **Diseño Adaptable**: Permite mostrar la información a un lado (horizontal) o apilarla verticalmente mediante la opción `stacked`.
- **Información Detallada**: Muestra el nombre y tamaño formateado (Bytes, KB, MB) de los archivos locales o remotos.

---

## Uso Básico (Individual)

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

---

## Uso en Modo Múltiple

Ideal para subir y administrar múltiples archivos. Permite pasar un listado de archivos que ya están en el servidor.

```vue
<template>
  <FileDropZone 
    :multiple="true"
    :existingFiles="archivosExistentes"
    accept=".pdf,.docx,.xlsx"
    @files-selected="handleMultipleFiles"
    @delete-file="handleDeleteFile"
  />
</template>

<script setup>
import { ref } from 'vue';

const archivosExistentes = ref([
  { id: 1, name: "documento_viejo.pdf", size: 102400, url: "https://ejemplo.com/media/doc1.pdf" },
  { id: 2, name: "presupuesto.xlsx", size: 204850, url: "https://ejemplo.com/media/presupuesto.xlsx" }
]);

const handleMultipleFiles = (files) => {
  console.log("Archivos nuevos seleccionados:", files);
  // Procesar archivos para subida
};

const handleDeleteFile = (file) => {
  console.log("Eliminar archivo existente:", file);
  // Lógica para borrar archivo en backend y actualizar la lista archivosExistentes
};
</script>
```

### Estructura de los objetos en `existingFiles`

Cada elemento del arreglo `existingFiles` debe cumplir con la siguiente estructura:

- **`id`** *(Recomendado/Obligatorio)*: Se utiliza como identificador único para la clave (`key`) de renderizado de Vue y es fundamental en el evento `@delete-file` para saber cuál archivo debe ser removido (tanto en el frontend como en el backend).
- **`name`** *(Obligatorio)*: El nombre del archivo que se mostrará visualmente y que se usará para nombrar el archivo cuando se descargue.
- **`url`** *(Obligatorio)*: La URL pública de descarga. Se requiere para poder realizar la petición `fetch` y forzar la descarga del archivo.
- **`size`** *(Opcional)*: El tamaño del archivo en bytes. Si no se define, se omite el tamaño en la interfaz.

---

## Uso con Archivo Existente (Vuex - Individual)

Si el archivo existente se obtiene de un getter del store:

```vue
<FileDropZone
  getterPath="BSC/getPlantillaActual"
  basePath="media/plantillas/"
  @file-selected="onNewFile"
/>
```

---

## Uso con Archivo Existente (URL Directa - Individual)

Si la URL del archivo existente se calcula en el componente padre (por ejemplo, a partir de props o IDs), usa `directUrl`. Tiene prioridad sobre `getterPath`.

```vue
<FileDropZone
  accept=".html"
  :directUrl="htmlExistenteUrl"
  :stacked="true"
  @file-selected="onHtmlFileChange"
/>

<script setup>
import { computed } from 'vue';

const htmlExistenteUrl = computed(() => {
  if (!props.editingId) return null;
  return `https://ejemplo.com/media/Templates/Reportes/modulo_${props.moduloId}/estructuras/html/${props.editingId}.html`;
});
</script>
```

> **Nota**: Cuando `directUrl` está definida, el nombre del archivo se extrae automáticamente del último segmento de la URL.

---

## Uso Deshabilitado / Solo Lectura

Deshabilita la interacción de arrastrar/seleccionar archivos y las opciones de eliminación en el listado.

```vue
<FileDropZone
  :disabled="true"
  :directUrl="'https://ejemplo.com/media/evidencia.pdf'"
/>
```

---

## Props

| Prop | Tipo | Default | Descripción |
| :--- | :--- | :--- | :--- |
| `accept` | `String` | `""` | Extensiones o tipos MIME permitidos separados por coma (ej: `.xlsx,.xls`, `image/*`). |
| `initialFile` | `Object` | `null` | Archivo `File` local para inicializar el componente en modo individual. |
| `getterPath` | `String` | `null` | Ruta del getter en Vuex que devuelve el nombre del archivo guardado en el servidor (modo individual). |
| `basePath` | `String` | `""` | Ruta base en el servidor donde se aloja el archivo (se concatena con `DEV_BASE_URL`). Solo aplica con `getterPath`. |
| `directUrl` | `String` | `null` | URL directa del archivo existente. Tiene prioridad sobre `getterPath` (modo individual). |
| `stacked` | `Boolean` | `false` | Si es `true`, obliga a que la zona de carga y la información del archivo se apilen verticalmente. |
| `disabled` | `Boolean` | `false` | Si es `true`, deshabilita la zona de arrastre/clic y las opciones de eliminación. |
| `multiple` | `Boolean` | `false` | Si es `true`, permite seleccionar múltiples archivos a la vez. |
| `existingFiles` | `Array` | `() => []` | Lista de archivos remotos ya existentes para el modo múltiple. Cada objeto debe tener la estructura `{ id, name, url, size }`. |

## Prioridad de la URL (Modo Individual)

```
directUrl (si está definida)
  └── Tiene prioridad absoluta

getterPath (si directUrl es null)
  └── store.getters[getterPath] + DEV_BASE_URL + basePath

Ninguno
  └── No se muestra archivo existente
```

---

## Emits

| Evento | Payload | Descripción |
| :--- | :--- | :--- |
| `file-selected` | `File` | Se emite en modo individual al seleccionar un archivo local válido. |
| `files-selected` | `Array<File>` | Se emite en modo múltiple al seleccionar uno o más archivos locales válidos. |
| `delete-file` | `Object` | Se emite en modo múltiple cuando el usuario hace clic en el botón de eliminar un archivo de `existingFiles`. |

---

## Estilos y Personalización

El componente utiliza clases de Bootstrap y variables CSS globales para mantener consistencia visual:

- `--purple-sb`: Color de acento para la barra izquierda de información del archivo individual.
- `--bs-gray-*`: Utilidades de Bootstrap para bordes y fondos de la zona de drop.
- `.iconBtn`: Usado para dar estilo a los iconos de descarga y eliminación.
