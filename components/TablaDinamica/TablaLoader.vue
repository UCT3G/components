<template>
    <div class="table-responsive">
      <table class="table">
        <thead>
          <tr>
            <th scope="col" class="placeholder-glow">
              <span class="placeholder col-6"></span>
            </th>
            <th scope="col" class="placeholder-glow">
              <span class="placeholder col-6"></span>
            </th>
            <th scope="col" class="placeholder-glow">
              <span class="placeholder col-6"></span>
            </th>
          </tr>
        </thead>
        <tbody>
          <FilasCargando></FilasCargando>
        </tbody>
      </table>
    </div>
  </template>
  
  <script>
  import FilasCargando from './FilasLoader.vue'
  export default {
    name: 'TablaCargando',
    components:{
      FilasCargando
    }
  };
  </script>
  
  <style>
  .placeholder-glow .placeholder {
    /* Ajusta el color y otros estilos de los placeholders según tu diseño */
    background-color: var(--blueBerry);
    border-radius: 4px;
  }
  </style>
  