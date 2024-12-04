<template>
    <div class="row col-12 d-blok m-auto">
        <div class="TablaDinamicaFooter col-12 d-flex justify-content-center position-relative">
            <div class="d-none d-sm-flex flex-column m-0 position-absolute start-0">                
                <p class="texto-caja m-1">Filtrados: {{ json.registros_filtrados }}</p>
            </div>

            <div class="m-0 TablaDinamicaFooter_pagination">
                <nav aria-label="...">
                    <ul class="pagination">
                        <li class="page-item" :class="{ 'disabled': json.paginaActual === 1 }">
                            <a class="page-link" href="#" @click="cambiarPagina(json.paginaActual - 1)">{{'<<'}}</a>
                        </li>
                        <li v-for="n in paginasVisibles" :key="n" class="page-item" :class="{ 'active': n === json.paginaActual }">
                            <a class="page-link" href="#" @click="cambiarPagina(n)">{{ n }}</a>
                        </li>
                        <li class="page-item" :class="{ 'disabled': json.paginaActual === totalPaginas }">
                            <a class="page-link" href="#" @click="cambiarPagina(json.paginaActual + 1)">{{'>>'}}</a>
                        </li>
                    </ul>
                </nav>
            </div>  
            
            <div class="d-none d-sm-flex flex-column m-0 position-absolute end-0">
                <p class="texto-caja m-1">Existentes: {{ json.registros_total }}</p>                
            </div>
        </div>
        <div class="d-flex d-sm-none justify-content-center">
            <p class="texto-caja m-1">Filtrados: {{ json.registros_filtrados }}</p>
            <p class="texto-caja m-1">Existentes: {{ json.registros_total }}</p>                
        </div>
    </div>
</template>

<script>
import {defineComponent, computed, toRefs} from 'vue'

export default defineComponent({
    name: 'TablaFooter',
    components: {},
    props: {
        json: {
            type: Object,
            default: () => ({})
        },
    },
    emits: ['cambiarPagina'],
    setup(props, {emit}) {
        const totalPaginas = computed(() => Math.ceil(props.json.registros_filtrados / props.json.no_filas));
        const {json} = toRefs(props)

        const paginasVisibles = computed(() => {
            let paginas = [];
            let inicio = Math.max(props.json.paginaActual - 1, 1);
            let fin = Math.min(inicio + 2, totalPaginas.value);

            if (fin === totalPaginas.value) {
                inicio = Math.max(fin - 2, 1);
            }

            for (let i = inicio; i <= fin; i++) {
                paginas.push(i);
            }
            return paginas;
        });

       

        const cambiarPagina = (pagina) => {
            console.log(pagina);
            if (pagina < 1 || pagina > totalPaginas.value){
                return
            }
            if(pagina == json.value.paginaActual ) return; 
            
            json.value.inicio = pagina > json.value.paginaActual ? (json.value.no_filas * pagina) - json.value.no_filas : json.value.inicio - json.value.no_filas;
            json.value.fin = pagina > json.value.paginaActual ? json.value.no_filas * pagina : json.value.fin - json.value.no_filas;
            json.value.paginaActual = pagina;
            emit('cambiarPagina', pagina)
        };

        return { paginasVisibles, cambiarPagina, totalPaginas }
    }
})
</script>
