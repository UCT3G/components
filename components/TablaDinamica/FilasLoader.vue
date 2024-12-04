<template>
    <tr v-for="n in columnas" :key="n">
        <td v-for="d in columnas" :key="d" class="placeholder-glow">            
            <span class="placeholder w-100"></span>
        </td>
       
    </tr>
</template>

<script>
  
  export default {
    name: 'FilasCargando',
    props:{
        columnas:{
            type: Number,
            default: 5
        }
    }
  };
  </script>


<style scoped>

.placeholder-glow span{
    height: 40px;
    background-color: var(--blueBerry);
}
</style>