# DropDownTrespuntos Component

El componente `DropDownTrespuntos` es un menú desplegable personalizado para Vue.js que permite a los usuarios seleccionar una opción de una lista. Se utiliza para proporcionar una interfaz de usuario compacta y eficiente para acciones adicionales en una fila de datos o en cualquier otro contexto.

## Propiedades

- **lista**: Array | String
  - Define las opciones disponibles en el menú desplegable. Puede ser un array de strings o una string separada por comas.
  - Default: `[]`

- **data**: Object
  - Objeto de datos que se puede pasar para ser utilizado en el evento emitido.
  - Default: `{}`

- **iconName**: String (Requerido)
  - Nombre del archivo SVG utilizado como ícono en el botón desplegable.

- **width_icon**: String
  - Ancho del icono SVG. Ajusta el tamaño del icono visualizado.
  - Default: `'10px'`

## Eventos Emitidos

- **elementoSeleccionado**
  - Se emite cuando un usuario selecciona una opción. Retorna un objeto con el nombre de la opción, el índice y los datos adicionales proporcionados.

## Ejemplo de Uso

Este ejemplo muestra cómo usar `DropDownTrespuntos` en un listado de usuarios, permitiendo acciones específicas en cada fila:

```html
<template v-for="(registro, index) in TB_UsuarioADM.registros" :key="'dropdown-' + registro.id">
  <teleport :to="`#TB_UsuarioADM tbody tr:nth-child(${index + 1}) td:last-child`" >
    <DropDownTrespuntos
      @elementoSeleccionado="accionDropDown(registro)" 
      width_icon="24px"
      :iconName="'ellipsis-horizontal.svg'"
      :lista="['Permisos por modulo','Asignacion Competencias']" />
  </teleport>
</template>
´´´
