<template>
    <div class="btnSistema-ListModulos">
        LUGAR PARA LOS MODULOS {{ name_sistema }}
        <div v-for="(pantalla, index) in pantallas" :key="index">
            {{ pantalla.nombre }}
            {{ pantalla.descripcion }}
        </div>
    </div>
</template>

<script>
    import {defineComponent } from 'vue';

    export default defineComponent({
        name:'PantallaModulo',
        props: {
            sistema_activo: {
                type: String,
                default: 'UCT COMPETENCIAS'
            },
            name_sistema: {
                type: String,
                default: ''
            },
            pantallas:{
                type: Array,
                default:()=>{[{nombre: 'ASIGNACION COMPETENCIAS', nivel: 1, descripcion:'descripcion de la pantalla' }]}
            }

        },
        setup(props){
            console.log(props)
            return{

            }
        }
    });
</script>

<style scoped>
    .btnSistema-ListModulos{
        /*background-color: var(--babyBlue_7);*/
        position: absolute;
        width: calc(100% - 48px);
        width: 100%;
        height: 100%;
        right: 0;
        z-index: 1;
        /*backdrop-filter: blur(10px);*/

    }
</style>