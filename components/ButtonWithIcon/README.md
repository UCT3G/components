# BotonIconoPrimary Component

## Desarrollado por y actualizaciones:
Isaias Morales

## Overview
`BotonIconoPrimary` es un componente Vue.js que renderiza un botón personalizado con un icono SVG que puede ser dinámicamente cargado y controlado. Está diseñado para ser flexible y fácilmente integrable en cualquier parte de una aplicación Vue.js.

## Props

### `iconName`
- **Type:** `String`
- **Required:** Yes
- **Description:** Nombre del archivo del icono SVG que se quiere mostrar en el botón. Debe ser el nombre del archivo ubicado en el directorio `/assets/images/icons/`. El componente intentará cargar el SVG correspondiente al nombre proporcionado.

### `isDisabled`
- **Type:** `Boolean`
- **Required:** No
- **Default:** `false`
- **Description:** Controla si el botón está deshabilitado. Si está desactivado, el botón no emitirá eventos de clic y cambiará su estilo para indicar que no está interactivo.

## Events

### `clickPrymary`
- **Description:** Este evento se emite cuando el botón es clickeado, a menos que el botón esté desactivado. Esto permite a los componentes padres manejar el evento según sea necesario.

## Example Usage

```vue
<template>
  <div>
    <BotonIconoPrimary
      iconName="example-icon.svg"
      :isDisabled="false"
      @clickPrymary="handlePrimaryClick"
    >
      Click Me!
    </BotonIconoPrimary>
  </div>
</template>

<script>
export default {
  methods: {
    handlePrimaryClick() {
      alert('Botón clickeado!');
    }
  }
}
</script>
```