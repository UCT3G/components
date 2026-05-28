# DropZoneV2

Componente reutilizable para seleccionar archivos con boton o arrastrar y soltar. No hace llamadas HTTP; solo valida, muestra previews y emite los archivos seleccionados para que el componente padre los suba mediante store.

## Uso basico

```vue
<DropZoneV2
  v-model="archivos"
  title="Evidencias"
  button-text="Agregar evidencias"
  accept="image/jpeg,image/png,image/webp"
  :max-files="2"
  :max-size-mb="15"
  @change="onArchivos"
  @error="onError"
/>
```

## Props principales

- `modelValue`: arreglo de archivos seleccionados.
- `accept`: formatos permitidos. Ejemplo: `image/jpeg,image/png,image/webp`.
- `maxFiles`: numero maximo de archivos.
- `maxSizeMb`: tamano maximo por archivo.
- `disabled`: desactiva seleccion y drag and drop.
- `showToast`: muestra errores con toast.

## Eventos

- `update:modelValue`: actualiza el `v-model`.
- `change`: emite el arreglo de archivos.
- `error`: emite mensaje de validacion.
- `remove`: emite el archivo removido.
- `clear`: se dispara al limpiar seleccion.

## Nota

Para evidencias de evaluacion, este componente solo debe capturar archivos. La subida debe hacerse desde el store `EvaluacionesEstado`, usando `subirEvidenciasEvaluacion`.
