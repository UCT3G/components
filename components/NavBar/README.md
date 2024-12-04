# NavBarPaginasUCT componente (Barra de Navegación)

## Description

La `NavBarPaginasUCT` representa una barra de navegación genérica que se puede utilizar en todas las páginas de la aplicación. La barra de navegación consta de una lista de elementos y, opcionalmente, una sección para elementos adicionales.

## Features

- **Elementos desplegables:** Incluye un botón desplegable para mostrar opciones adicionales.
- **Elementos opcionales:** Permite la inserción de elementos adicionales al final de la barra de navegación.

## Props

- `elementos_dropdown` (Booleano): Controla si se muestran los elementos desplegables en la barra de navegación. Por defecto, es `false`.

## Slots
- `elementos_dropdown`: Permite insertar elementos en el menú desplegable.
- `elementos_opcionales`: Permite insertar elementos opcionales al final de la barra de navegación.

## Usage

```vue
<template>
  <Navbar :elementos_dropdown="true">
    <template #elementos_dropdown>
      <!-- Inserta elementos en el menú desplegable -->
      <li></li>
      <li></li>
    </template>
    <template #elementos_opcionales>
      <!-- Inserta elementos opcionales al final de la barra de navegación -->
    </template>
  </Navbar>
</template>

<script>
import Navbar from '@/components/NavBar/NavBarPaginasUCT.vue';

export default {
  components: {
    Navbar,
  },
};
</script>
```

## Styling
Se aplican estilos CSS para personalizar la apariencia de la barra de navegación.

- `NavbarUCT` : Define el estilo de la barra de navegación, incluyendo el fondo y el borde.
- `NavbarUCT-button` : Estilo para el botón desplegable.
- `NavbarUCT-icono` : Estilo para el icono en el botón desplegable.
- `NavbarUCT-dropdown`: Define el estilo del menú desplegable.
- `NavbarUCT-dropdown ::v-deep .dropdown-item`: Estilo para los elementos del menú desplegable.
## Conclusion

Este componente proporciona flexibilidad para personalizar la barra de navegación según las necesidades de la página en la que se use.