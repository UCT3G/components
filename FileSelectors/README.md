# FileDropZone Component

El componente `FileDropZone` (interno: `FileSelector`) proporciona una interfaz intuitiva para la selección de archivos mediante "drag & drop" o clic, con soporte integrado para la validación de tipos, descarga de archivos existentes desde el servidor, modo de selección múltiple, control de estados (como deshabilitado), menú contextual de tres puntos personalizable y slots para personalización total de acciones.

---

## Características

- **Drag & Drop**: Zona interactiva para soltar archivos con estados visuales reactivos al arrastrar (`is-dragover`).
- **Validación de Tipos**: Filtra archivos permitidos mediante extensiones o mimetypes en la selección y el arrastre (`accept`).
- **Archivo existente vía Vuex**: En modo individual, puede mostrar y descargar automáticamente un archivo referenciado en el store.
- **Archivo existente vía URL directa**: Alternativamente, acepta una URL explícita calculada en el componente padre, teniendo prioridad sobre Vuex (`directUrl`).
- **Modo Múltiple**: Soporta arrastrar/seleccionar múltiples archivos y gestionar una lista de archivos remotos ya existentes con menú contextual de opciones (`existingFiles`).
- **Menú Contextual de Tres Puntos**: Integra `DropDownTrespuntos` con icono vertical para una interfaz limpia y compacta.
- **Acciones Flexibles (Inversión de Control)**: Permite que el padre defina las acciones mediante un `Array` fijo o una `Function` que evalúe permisos o estados por cada archivo.
- **Scoped Slot `#file-actions`**: Permite sobreescribir la UI de acciones por completo si en una pantalla no se desea el menú de tres puntos.
- **Estado Deshabilitado**: Deshabilita la interacción de carga y oculta los controles de eliminación o edición para comportarse en modo de solo lectura (`disabled`).
- **Diseño Adaptable**: Permite mostrar la información a un lado (horizontal) o apilarla verticalmente mediante la opción `stacked`.
- **Información Detallada**: Muestra el nombre y tamaño formateado (Bytes, KB, MB) de los archivos locales o remotos.

---

## 1. Uso Básico (Modo Individual)

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

## 2. Uso con Archivo Existente (Individual)

### Vía URL Directa (Recomendado)
```vue
<template>
  <FileDropZone
    accept=".html"
    :directUrl="htmlExistenteUrl"
    :stacked="true"
    @file-selected="onHtmlFileChange"
  />
</template>
```

### Vía Vuex Store
```vue
<template>
  <FileDropZone
    getterPath="BSC/getPlantillaActual"
    basePath="media/plantillas/"
    @file-selected="onNewFile"
  />
</template>
```

---

## 3. Uso en Modo Múltiple

Ideal para subir y administrar listas de archivos. Se activa con `:multiple="true"` y gestiona la lista de archivos remotos mediante `existingFiles`.

```vue
<template>
  <FileDropZone 
    multiple 
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
};

const handleDeleteFile = (file) => {
  console.log("Eliminar archivo:", file);
  archivosExistentes.value = archivosExistentes.value.filter(f => f.id !== file.id);
};
</script>
```

### Estructura de los objetos en `existingFiles`:
- **`id`** *(Obligatorio/Recomendado)*: Identificador único para el renderizado y borrado.
- **`name`** *(Obligatorio)*: Nombre mostrado y usado en la descarga.
- **`url`** *(Obligatorio)*: URL pública para descarga o previsualización.
- **`size`** *(Opcional)*: Tamaño en bytes (se formatea automáticamente a KB/MB).

---

## 4. Gestión de Acciones en Modo Múltiple (`acciones` y `@accion`)

Por defecto, cada archivo en la lista muestra un menú de tres puntos con `['Descargar', 'Eliminar']` (o solo `['Descargar']` si `disabled="true"`).

A través de la prop `acciones`, el componente padre puede tomar el control total de las opciones del menú:

### Forma A: Opciones Estáticas Fijas (Array)
Para cuando todos los archivos de la lista deben compartir las mismas opciones:

```vue
<template>
  <FileDropZone 
    multiple 
    :existingFiles="archivos"
    :acciones="['Descargar', 'Copiar enlace']"
    @accion="onAccion"
  />
</template>

<script setup>
import { toast } from 'vue3-toastify';

const onAccion = ({ accion, file }) => {
  if (accion === 'Copiar enlace') {
    navigator.clipboard.writeText(file.url);
    toast.success('Enlace copiado');
  }
  // 'Descargar' lo maneja el componente automáticamente
};
</script>
```

### Forma B: Opciones Dinámicas Condicionadas por Archivo (Function)
Para cuando las opciones dependen de las propiedades o estado de cada archivo individual:

```vue
<template>
  <FileDropZone 
    multiple 
    :existingFiles="evidencias"
    :acciones="calcularOpcionesPorArchivo"
    @accion="onAccion"
  />
</template>

<script setup>
const calcularOpcionesPorArchivo = (file) => {
  const opciones = ['Descargar'];

  // 1. Si es PDF o imagen, permitir previsualizar
  if (file.name.endsWith('.pdf') || file.name.match(/\.(png|jpg|jpeg)$/i)) {
    opciones.unshift('Previsualizar');
  }

  // 2. Si no está aprobado, permitir eliminar
  if (!file.aprobado) {
    opciones.push('Eliminar');
  }

  return opciones;
};

const onAccion = ({ accion, file }) => {
  if (accion === 'Previsualizar') {
    abrirModalVisor(file.url);
  } else if (accion === 'Eliminar') {
    borrarEnServidor(file.id);
  }
};
</script>
```

### Forma C: Sin Opciones (Ocultar el menú de tres puntos)
Si solo se desea mostrar la lista de archivos informativamente sin ningún menú:

```vue
<FileDropZone 
  multiple 
  :existingFiles="archivos"
  :acciones="[]"
/>
```

---

## 5. Personalización Total de UI con Scoped Slot (`#file-actions`)

Si en una pantalla específica no deseas el menú desplegable de tres puntos y prefieres mostrar botones visibles directos o etiquetas de estado:

```vue
<template>
  <FileDropZone multiple :existingFiles="archivos">
    <template #file-actions="{ file, acciones }">
      <div class="d-flex align-items-center gap-2">
        <span v-if="file.aprobado" class="badge bg-success">Aprobado</span>
        <button 
          class="btn btn-sm btn-outline-primary py-1 px-2"
          @click="procesarArchivo(file)"
        >
          Procesar
        </button>
      </div>
    </template>
  </FileDropZone>
</template>
```

---

## 6. Modo Deshabilitado / Solo Lectura

Deshabilita la zona de arrastre/clic y las opciones de eliminación en el listado de archivos:

```vue
<FileDropZone
  :disabled="true"
  multiple
  :existingFiles="archivos"
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
| `stacked` | `Boolean` | `false` | Si es `true`, apila verticalmente la zona de carga y la lista de archivos (`col-12`). |
| `disabled` | `Boolean` | `false` | Si es `true`, deshabilita la zona de arrastre/clic y limita las acciones a solo lectura. |
| `multiple` | `Boolean` | `false` | Si es `true`, permite seleccionar y gestionar múltiples archivos a la vez. |
| `existingFiles` | `Array` | `() => []` | Lista de archivos remotos ya existentes para el modo múltiple. Objetos `{ id, name, url, size }`. |
| `acciones` | `Array \| Function` | `null` | Lista de opciones para el menú de tres puntos o función `(file) => Array<string>`. Si es `null`, usa `['Descargar', 'Eliminar']` (o `['Descargar']` si `disabled`). |

---

## Slots

| Slot | Scoped Props | Descripción |
| :--- | :--- | :--- |
| `#file-actions` | `{ file: Object, acciones: Array<string> }` | Permite reemplazar completamente el menú de tres puntos de cada fila en modo múltiple con botones o elementos personalizados. |

---

## Emits

| Evento | Payload | Descripción |
| :--- | :--- | :--- |
| `file-selected` | `File` | Se emite en modo individual al seleccionar un archivo local válido. |
| `files-selected` | `Array<File>` | Se emite en modo múltiple al seleccionar uno o más archivos locales válidos. |
| `delete-file` | `Object` | Se emite al seleccionar la acción nativa de eliminación sobre un archivo de `existingFiles`. |
| `accion` | `{ accion: String, file: Object }` | Se emite al seleccionar **cualquier** opción del menú contextual de tres puntos en modo múltiple. |

---

## Estilos y Tokens Visuales

El componente utiliza clases de Bootstrap y variables CSS globales del proyecto:

- `--purple-sb`: Color de acento para la barra izquierda de cada tarjeta `.file-info`.
- `--bs-gray-100` / `--bs-gray-200`: Fondos sutiles de la zona de drop y tarjetas de archivos.
- `--bs-gray-400`: Borde discontinuo (dashed) de la zona de arrastre.
- `DropDownTrespuntos`: Menú desplegable con efecto translúcido `backdrop-filter: blur`, compatible con temas claros y oscuros.
