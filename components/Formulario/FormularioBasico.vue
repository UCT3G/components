<template>
    <div class="formulario">
        <div class="titulo-formulario">
            {{ tituloFormulario }}
        </div>
        <div class="body-formulario">
            <slot></slot>
        </div>
    </div>
</template>

<script>
    import { defineComponent } from 'vue';

    export default defineComponent({
        name: 'FormularioBasico',
        props: {
            tituloFormulario: {
                type: String,
                required: true
            }
        }
    });
</script>

<style scoped>
.formulario {
    margin: 15px;
    font-weight: bolder;
    box-shadow: rgba(50, 50, 93, 0.25) 0px 2px 5px -1px, rgba(0, 0, 0, 0.3) 0px 1px 3px -1px;
    border-radius: 10px;
}
.titulo-formulario {
    background: linear-gradient(90deg, var(--blueBerryLight) 0%, var(--blueBerryGlass) 100%);
    height: 40px;
    font-size: 20px;
    color: var(--card-title-color);
    border-radius: 10px 10px 0 0;
    padding-block: 5px;
    padding-inline: 15px;
}
.body-formulario {
    padding: 10px 10px 5px 10px;
}
</style>