
# Componente DynamicAccordion

## Descripción

`DynamicAccordion` es un componente de Vue 3 que crea dinámicamente un acordeón basado en un arreglo de objetos. Cada elemento del acordeón se crea usando un slot para una inserción flexible de contenido.

## Uso

### Props

- **data_acordeon** (Array, requerido): Un arreglo de objetos donde cada objeto debe tener al menos una propiedad `id` y `titulo`.
- **comportamiento** (String, por defecto: 'desplegado'): Determina el estado inicial de los elementos del acordeón. Puede ser:
  - `'desplegado'`: Todos los elementos están expandidos.
  - `'cerrado'`: Todos los elementos están colapsados.
  - `'tema1'`: Solo el primer elemento está expandido.

### Slots

- **collapseX**: Reemplaza `X` con el índice del elemento del acordeón (comenzando desde 0). Usa estos slots para insertar contenido personalizado en el cuerpo de cada elemento del acordeón.

### Ejemplo

```vue
<template>
  <DynamicAccordion :data_acordeon="accordionData" :comportamiento="'tema1'">
    <template #collapse0>
      <p>Contenido para el primer elemento del acordeón.</p>
    </template>
    <template #collapse1>
      <p>Contenido para el segundo elemento del acordeón.</p>
    </template>
    <!-- Agrega más slots según sea necesario -->
  </DynamicAccordion>
</template>

<script>
import DynamicAccordion from '@/components/DynamicAccordion.vue';


export default {
  components: {
    DynamicAccordion,
    
  },
  data() {
    return {
      accordionData: [
        { id: 1, titulo: 'Primer Ítem' },
        { id: 2, titulo: 'Segundo Ítem' }
        // Agrega más elementos según sea necesario
      ]
    };
  }
};
</script>
```



Esta documentación proporciona una visión general de cómo usar el componente `DynamicAccordion`, incluyendo un ejemplo de su uso, las props que acepta y cómo usar slots para contenido personalizado.
