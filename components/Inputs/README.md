# InputGenerico Component

## Description

The `InputGenerico` component is a customizable and reactive input based on Vue 3, designed for integration in forms. It features dynamic interaction and asynchronous data update. It includes auto-update with debounce, change confirmation, and pre/post update hooks.

## Features

- **Customizable Input Type and Placeholder:** Configurable for different input types (text, number, email, etc.) with a custom placeholder.
- **Automatic Update (Debounce):** Auto-updates data after a configurable inactivity interval.
- **Change Confirmation:** Option to request confirmation before making updates.
- **Pre and Post Update Hooks:** Functions executed before and after data update.
- **Axios Integration:** Uses Axios for sending data to a specified URL.
- **Authentication Support:** Supports including authentication credentials, like JWT tokens, in requests.

## Properties

- `type` (String): Input type (default: 'text').
- `placeholder` (String): Placeholder text.
- `value` (String): Initial input value.
- `onchangeUpdate` (Boolean): Enables automatic update (default: false).
- `functionConfirm` (Boolean): Enables confirmation before update (default: false).
- `functionPreUpdate` (Function): Function executed before update.
- `functionPostUpdate` (Function): Function executed after update.
- `url` (String): URL for sending data.
- `getCredenciales` (Function): Function returning authentication credentials.
- `timeAutoSave` (String): Time in milliseconds for auto-saving.

## Usage

```vue
<template>
  <div>
    <h1>Test Form</h1>
    <form @submit.prevent="handleSubmit">
      <InputGenerico
        v-model="inputValue"
        :onchangeUpdate="true"
        :functionConfirm="confirmUpdate"
        :functionPreUpdate="preUpdate"
        :functionPostUpdate="postUpdate"
        :url="url"
        :getCredenciales="getCredenciales"
        placeholder="Type something here"
        type="text"
        maxlength="5"
      />
      <button type="submit">Submit</button>
    </form>
  </div>
</template>
```

# SelectGenerico Component

## Description

`SelectGenerico` es un componente de Vue personalizado para crear un elemento `<select>` interactivo y reactivo. Proporciona características como actualización automática, confirmación de cambios y ganchos para acciones pre y post actualización. Este componente es ideal para integrarse en formularios que requieren una selección de opciones.

## Features

- **Customizable Options:** Configurable con un array de opciones.
- **Automatic Update (Debounce):** Auto-actualiza los datos después de un intervalo de inactividad.
- **Change Confirmation:** Opción para solicitar confirmación antes de realizar actualizaciones.
- **Pre and Post Update Hooks:** Funciones ejecutadas antes y después de la actualización de datos.
- **Axios Integration:** Utiliza Axios para enviar datos a una URL especificada.
- **Authentication Support:** Soporta la inclusión de credenciales, como tokens JWT, en las peticiones.

## Properties

- `modelValue` ([String, Number]): Valor seleccionado actual.
- `options` (Array): Array de objetos para las opciones del select, cada objeto tiene `value` y `text`.
- `onchangeUpdate` (Boolean): Activa la actualización automática.
- `functionConfirm` (Boolean): Activa la confirmación antes de actualizar.
- `functionPreUpdate` (Function): Función ejecutada antes de la actualización.
- `functionPostUpdate` (Function): Función ejecutada después de la actualización.
- `url` (String): URL a la que se envían los datos.
- `getCredenciales` (Function): Función que retorna credenciales de autenticación.
- `timeAutoSave` (Number): Tiempo en milisegundos para el guardado automático.

## Usage

```vue
<template>
  <SelectGenerico
    v-model="selectedValue"
    :options="optionsList"
    :onchangeUpdate="true"
    :functionConfirm="confirmUpdate"
    :functionPreUpdate="preUpdate"
    :functionPostUpdate="postUpdate"
    :url="yourUrl"
    :getCredenciales="getCredenciales"
  />
</template>

<script>
export default {
  data() {
    return {
      selectedValue: '',
      optionsList: [
        { value: 'option1', text: 'Option 1' },
        { value: 'option2', text: 'Option 2' }
        // Más opciones...
      ],
      yourUrl: 'http://your-api-url.com/endpoint'
      // Otros datos y métodos...
    };
  },
  methods: {
    confirmUpdate() {
      // Lógica para confirmar la actualización
    },
    preUpdate() {
      // Lógica antes de la actualización
    },
    postUpdate() {
      // Lógica después de la actualización
    },
    getCredenciales() {
      // Retorna credenciales, como un JWT
    }
  }
};
</script>
```

## Dependencias
Vue 3
DatePicker
datejs


# DatePickerInput Component Documentation

## Descripción

El componente `DatePickerInput` es un selector de fecha personalizable basado en `v-calendar` y `dayjs` para Vue.js. Este componente permite seleccionar una fecha mediante un calendario desplegable y formatear esta fecha según el formato especificado en las props. Es ideal para implementaciones que requieren un formato específico para la manipulación de fechas.

## Propiedades

- **`valorInput`**: `String` — Define el valor inicial de la fecha. Debe estar en el formato `YYYY-MM-DD`. Por defecto es una cadena vacía.
- **`formato`**: `String` — Especifica el formato de fecha deseado para la salida. El valor predeterminado es `YYYY-MM-DD`, pero puede ajustarse a cualquier formato compatible con `dayjs`.

## Eventos

- **`update:fechaActualizada`**: Este evento se emite cada vez que se selecciona una nueva fecha. Proporciona la fecha en el formato especificado por la propiedad `formato`.

## Ejemplo de Uso

El siguiente ejemplo muestra cómo usar el `DatePickerInput` en un componente Vue:

```vue
<template>
  <div>
    <DatePickerInput
      @update:fechaActualizada="testFecha"
      class="form-control"
      :valorInput="fecha"
      formato="YYYY-MM-DD"
    />
  </div>
</template>

<script>
import { ref } from 'vue';
import DatePickerInput from '@/components/Inputs/DatePikerInput.vue';

export default {
  components: {
    DatePickerInput
  },
  setup() {
    const fecha = ref('2015-10-25');

    const testFecha = (formattedDate) => {
      console.log(formattedDate);  // Maneja la fecha formateada
      fecha.value = formattedDate;  // Actualiza el valor de la fecha
    };

    return {
      fecha,
      testFecha
    };
  }
}
</script>
```
