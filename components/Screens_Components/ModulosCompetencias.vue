<template>
   <CompetenciaUsuario></CompetenciaUsuario>
</template>
    
<script>

import CompetenciaUsuario from "@/screens/UCT_Competencias/componentes/Competencia_Usuario.vue";


export default ({
    name: 'ModulosCompetencias',
    components:{
        CompetenciaUsuario
    },
    setup() {  

        return {     
            CompetenciaUsuario
        }
    }
})
</script>
    
<style>
</style>