# TextoLargo Component

El componente `TextoLargo` es una solución para mostrar textos largos de forma truncada, con la capacidad de revelar el texto completo al pasar el puntero por encima. También incluye un espacio para un valor fijo que siempre se muestra a la derecha.

## Creador
Creado por: Isaias Morales

## Propiedades

| Propiedad | Tipo   | Requerido | Por Defecto | Descripción |
|-----------|--------|-----------|-------------|-------------|
| text      | String | Sí        | N/A         | El texto largo que se debe mostrar de manera truncada y completa. |
| maxHeight | Number | No        | 55          | La altura máxima del contenedor truncado. |

## Ejemplo de Uso

```vue
<template>
  <div>
    <TextoLargo :text="textoLargo">
      45
    </TextoLargo>
  </div>
</template>

<script>
import { defineComponent } from 'vue';
import TextoLargo from '@/components/ContenedorTextoLargo/TextoLargo.vue';

export default defineComponent({
  name: 'ComponentePadre',
  components: {
    TextoLargo
  },
  setup() {
    const textoLargo = 'Este es un ejemplo de un texto muy largo que se debe truncar en la vista inicial. Al pasar el ratón por encima o al hacer clic, se debe mostrar el texto completo para que el usuario pueda leerlo sin problemas.';
    
    return {
      textoLargo
    };
  }
});
</script>
