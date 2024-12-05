
# PopUp Component README.md

## Overview

The PopUp component is a Vue.js component designed to display a modal or popup overlay within an application. It offers customizable options for size, visibility, confirmation actions, and titles, making it a versatile component for various use cases like confirmations, notifications, or custom content display.

## Features

- **Visibility Control**: Toggle the visibility of the popup with a `visible` prop.
- **Size Customization**: Choose between `small`, `medium`, `large`, or `fulls` sizes for the popup.
- **Confirmation Actions**: Optional confirmation and cancellation buttons with customizable actions.
- **Title Customization**: Set titles for the popup and the optional confirmation section.
- **Esc Key Support**: Close the popup by pressing the Escape key.
- **Slot Support**: Use default slot to insert custom content inside the popup body.
- **Transition Effects**: Smooth fade-in and fade-out animations for the popup appearance.

## Props

- `visible` (Boolean, required): Controls the visibility of the popup.
- `confirm` (Boolean, optional): Enables the display of confirmation and cancellation buttons. Default: `false`.
- `confirmFunction` (Function, optional): Function to execute on confirmation action. Default: `null`.
- `size` (String, optional): Sets the size of the popup. Options: `small`, `medium`, `large`, `fulls`. Default: `medium`.
- `titulo` (String, optional): Title displayed on the popup header. Default: `''`.
- `titulo_b` (String, optional): Secondary title, typically used in the confirmation section. Default: `'Busqueda'`.

## Events

- `update:visible`: Emits when the visibility of the popup changes, particularly when closing the popup.

## Usage

Here's a basic example of how to use the PopUp component in your Vue.js application:

```html
<template>
  <div>
    <button @click="showPopup">Show Popup</button>
    <PopUp :visible="isPopupVisible" @update:visible="isPopupVisible = $event" titulo="Example Popup">
      <p>This is a custom content inside the popup.</p>
    </PopUp>
  </div>
</template>

<script>
import PopUp from './PopUp.vue';

export default {
  components: {
    PopUp
  },
  data() {
    return {
      isPopupVisible: false,
    };
  },
  methods: {
    showPopup() {
      this.isPopupVisible = true;
    },
  },
};
</script>
```

## Styling

The component uses scoped styles for customization and ensures that the popup's appearance does not conflict with the global styles of your application. You can further customize the styles as per your needs by modifying the scoped styles within the component.

## Conclusion

The PopUp component is designed to be easily integrated and customizable within your Vue.js projects, providing a flexible solution for displaying overlays or modal dialogs with various content.

# Integración de Componente PopUp con Componente Padre en Vue.js

Este documento explica cómo configurar la interacción entre un componente padre y un componente PopUp en Vue.js, permitiendo que acciones específicas se ejecuten cuando se confirme una acción en el PopUp.

## Componente Padre

El componente padre maneja la visibilidad del PopUp y define la acción que se ejecutará cuando el usuario confirme en el PopUp.
```vue
<template>
  <PopUp :visible="ventanaConformacion" 
         size="small" 
         @update:visible="ventanaConformacion = $event" 
         :confirmFunction="EjecutarAccion"
         titulo="" 
         titulo_b="Confirme" 
         confirm>
    <p>This is a custom content inside the popup.</p>
  </PopUp>
</template>

<script>
import { ref } from 'vue';
import { useStore } from 'vuex';
import PopUp from './PopUp.vue'; // Asegúrate de importar correctamente el PopUp

export default {
  components: {
    PopUp
  },
  setup() {
    const ventanaConformacion = ref(false); // Cambiado a false inicialmente para no mostrar el popup automáticamente
    const EjecutarAccion = () => {
      console.log('Acción confirmada');
      // Aquí puedes agregar la lógica que necesites ejecutar cuando se confirme
    };

    // Otras variables de estado y funciones

    return {
      ventanaConformacion,
      EjecutarAccion
    };
  }
};
</script>
```


## Componente PopUp COMPETENCIAS


### Características Adicionales

- **Ícono Opcional**: Permite agregar un ícono dinámico en el encabezado del popup, con acción asociada al hacer clic.
- **Diseño Moderno**: Incluye un encabezado dividido y botones estilizados, mejorando la experiencia visual del usuario.

### Propiedades Adicionales

- `icono_name` (String, opcional): Permite especificar el nombre del archivo SVG del ícono a mostrar. Predeterminado: `''`.

### Eventos Adicionales

- `AccionIcono`: Se emite cuando el usuario interactúa con el ícono, permitiendo vincular una acción específica.

### Ejemplo de Uso

Este es un ejemplo de cómo implementar el `PopUpCompetencias` en tu aplicación Vue.js, mostrando el uso del ícono y personalización avanzada:

```vue
 <PopUpCompetencias 
      :visible="true" 
      size="fulls" 
      icono_name="TEMARIO-24"
      @update:visible="ventanaModulosCompetencias = $event" 
      titulo="INTRODUCCION">
        <div style="height: 1000px;background-color: silver;">
          COMTENIDO
        </div>
    </PopUpCompetencias>

´´´

# PopUpSolido

Componente de ventana modal con opciones de confirmación.

## Propiedades

- `visible` (Boolean, requerido): Controla la visibilidad del popup.
- `confirm` (Boolean, opcional, por defecto: false): Muestra botones de confirmación y cancelación.
- `confirmFunction` (Function, opcional): Función que se ejecuta al confirmar.
- `size` (String, opcional, por defecto: 'medium'): Tamaño del popup (`small`, `medium`, `large`, `fulls`).
- `titulo` (String, opcional, por defecto: 'HOLA'): Título del popup.

## Ejemplo de uso

```vue
<PopUpSolido :visible="VentanaConfirmar"
             size="small"
             :confirm="true"
             :confirmFunction="EliminarRegistrosSelected"
             @update:visible="VentanaConfirmar = $event"
             titulo="Confirmar">
  <div class="d-flex justify-content-center flex-column">
    <p>¿Está seguro de eliminar los registros seleccionados?</p>
    <p>No registros: {{ usuariosSelected.length }}</p>
  </div>
</PopUpSolido>
