
## Documentación del Componente `SideBarGeneral`

### Introducción
El componente `SideBarGeneral` es una implementación personalizada de un offcanvas de Bootstrap en Vue 3. Permite mostrar un panel lateral (o desde arriba/abajo) que se puede controlar externamente y personalizar su contenido mediante slots. Este componente es versátil y puede emerger desde cualquier lado de la pantalla: derecha, izquierda, arriba o abajo.

### Importación
Para utilizar este componente en tu proyecto Vue, primero debes importarlo:

```javascript
import SideBarGeneral from '@/components/sidebar/SideBarGeneral.vue';
```

### Propiedades
El componente `SideBarGeneral` acepta las siguientes propiedades:

- **show** (`Boolean`): Controla la visibilidad del offcanvas. Si es `true`, el offcanvas se mostrará; si es `false`, se ocultará.
- **position** (`String`): Determina desde qué lado emergerá el offcanvas. Los valores posibles son:
  - `'start'` para la izquierda
  - `'end'` para la derecha (valor por defecto)
  - `'top'` para la parte superior
  - `'bottom'` para la parte inferior

### Ejemplo de Uso
A continuación se muestra un ejemplo simple de cómo usar el componente `SideBarGeneral` en un componente Vue:

```vue
<template>
  <div>
    <button class="btn btn-primary" @click="toggleOffcanvas('end')">Toggle right offcanvas</button>
    <button class="btn btn-primary" @click="toggleOffcanvas('bottom')">Toggle bottom offcanvas</button>
    <button class="btn btn-primary" @click="toggleOffcanvas('top')">Toggle top offcanvas</button>
    <button class="btn btn-primary" @click="toggleOffcanvas('start')">Toggle left offcanvas</button>
    
    <SideBarGeneral :show="isOffcanvasVisible" :position="offcanvasPosition">
      <p>Contenido personalizado del offcanvas</p>
    </SideBarGeneral>
  </div>
</template>

<script>
import { ref } from 'vue';
import SideBarGeneral from '@/components/sidebar/SideBarGeneral.vue';

export default {
  components: {
    SideBarGeneral
  },
  setup() {
    const isOffcanvasVisible = ref(false);
    const offcanvasPosition = ref('end');

    const toggleOffcanvas = (position) => {
      if (offcanvasPosition.value === position && isOffcanvasVisible.value) {
        isOffcanvasVisible.value = false;
      } else {
        offcanvasPosition.value = position;
        isOffcanvasVisible.value = true;
      }
    };

    return {
      isOffcanvasVisible,
      offcanvasPosition,
      toggleOffcanvas
    };
  }
};
</script>
```

### Explicación del Ejemplo
En este ejemplo, hemos importado y registrado el componente `SideBarGeneral`. Luego, utilizamos cuatro botones para controlar la visibilidad y la posición del offcanvas. Al hacer clic en un botón, se llama a la función `toggleOffcanvas` con la posición correspondiente, alternando la visibilidad del offcanvas.

El contenido del offcanvas es personalizado utilizando el slot, lo que permite insertar cualquier elemento HTML o componentes adicionales dentro del `offcanvas-body`.

### Consideraciones Adicionales
- **CSS Scoped**: El estilo en el componente está scoped, lo que significa que cualquier estilo definido aquí no afectará a otros componentes.
- **Eventos de Bootstrap**: El componente escucha los eventos `hide.bs.offcanvas`, `hidden.bs.offcanvas` y `show.bs.offcanvas` de Bootstrap para mantener la sincronización del estado de visibilidad.

Esta documentación proporciona una guía completa para integrar y utilizar el componente `SideBarGeneral` en tu proyecto Vue, con ejemplos claros y una explicación de sus propiedades y uso.
```