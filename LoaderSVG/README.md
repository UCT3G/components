# DynamicSvgLoader Component

El componente `DynamicSvgLoader` es un componente Vue.js diseñado para cargar dinámicamente archivos SVG desde tu directorio de activos y mostrarlos con estilos y dimensiones personalizables.

## Características

- Carga dinámica de archivos SVG utilizando el nombre del archivo como propiedad.
- Personalización del ancho y alto del icono SVG.
- Aplicación de clases dinámicas basadas en el estado activo del icono.
- Gestión de errores con un SVG predeterminado en caso de fallo de carga.

## Instalación

Este componente está diseñado para ser utilizado dentro de un proyecto Vue.js. Asegúrate de que tu proyecto ya esté configurado con Vue.js.

1. Copia el componente `DynamicSvgLoader.vue` en tu directorio de componentes, por ejemplo: `src/components/`.
2. Asegúrate de que tus archivos SVG estén ubicados en `src/assets/images/`.

## Uso

Para utilizar el componente `DynamicSvgLoader` en tu proyecto Vue, simplemente necesitas importarlo en tu componente y registrarlos localmente o globalmente, según tus necesidades.

### Ejemplo de Uso

A continuación, se muestra un ejemplo de cómo utilizar el componente `DynamicSvgLoader` para cargar un icono SVG llamado `example-icon`:

```vue
<template>
  <div>
    <DynamicSvgLoader
      fileName="icons/ellipsis-vertical"
      width_icon="50px"
      height_icon="50px"
      :icon_active="true"
    />
  </div>
</template>

<script>
import DynamicSvgLoader from '@/components/DynamicSvgLoader.vue';

export default {
  components: {
    DynamicSvgLoader,
  },
};
</script>
