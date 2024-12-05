<template>
    <div :class="ClasesTablaDinamica" :id="tabla_nombre">

        <div class="TablaDinamicabtn-filtrar">
            <BotonIconoPrimary width_icon="13px" iconName="FILTRAR.svg" @click="mostrarFiltros = !mostrarFiltros">Filtros</BotonIconoPrimary>
        </div>
        
        <DynamicSvgLoader class="TablaDinamica_iconEditor" title="vista edicion" @click="turnOnEditable" fileName="icons/UCT_ADMIN/COMPETENCIAS-13" width_icon="20px" :icon_active="true"></DynamicSvgLoader>
        <table class="table table-light" v-if="json">
            <TablaHead  :json="json" @orderChanged="handleOrderChange" :class="{ 'showHead': mostrarFiltros, 'hideHead': !mostrarFiltros }"></TablaHead>
            <FilasCargando v-if="cargando" :columnas="json.filas.length"></FilasCargando>
            <tbody v-else>
                <slot name="body"></slot>
            </tbody>
            
                      
        </table>
        <TablaFooter
                :json="json"
                @cambiarPagina="CambiarPagina"
            ></TablaFooter>           
    </div>

    <PopUpSolido :visible="visible_editor_tabla" @update:visible="visible_editor_tabla = $event"  size="large" titulo="Tabla Dinámica Propiedades" ref="modalEditar" :fullScreenHeight="false">
        
        <TablaDinamicaEditor :tabla_nombre="tabla_nombre" :tablaBase="tablaBase"></TablaDinamicaEditor>
    </PopUpSolido>

    <PopUpSolido :visible="visibleFormCRUD" size="large" @update:visible="cerrarFormCrud" titulo="Modifica la información">
        
        <div v-if="formularioBaseFilas !=null">                               
            <FormD_CapaTablaDinamica  
                :urls="url_formulario"          
                :formularioBase="formularioBaseFilas"            
                :inputs_catalogo="inputs_catalogoSistema"
                :idGenerales="idGenerales"
                :descargaData="descargaData"   
                @submitSuccess="formularioBaseFilasSuccess" 
            ></FormD_CapaTablaDinamica>            
            
        </div>         
    </PopUpSolido>
</template>

<script>

    import {defineComponent, ref, onMounted, watch, toRefs, computed } from 'vue'
    import TablaDinamicaEditor from '../TablaDinamicaEditor.vue'
    import PopUpSolido from '@/components/Modal/ModalSolid.vue';
    import DynamicSvgLoader from '@/components/LoaderSVG/LoaderSVG.vue'

    import TablaHead from '@/components/TablaDinamica/TablaHead.vue';
    
    import TablaFooter from '@/components/TablaDinamica/TablaFooter.vue';

    import {inputs_catalogoSistema} from '@/store/ReporteadorReactive/FormularioDinamicoADM';
    import FormD_CapaTablaDinamica from '@/screens/UCT_Admin/FormD_ADM/CapasImplementacion/FormD_CapaTablaDinamica.vue'

    import { TablaBase } from "@/store/ReporteadorReactive/TablaDinamica.js"
    import { useStore } from 'vuex';
    import FilasCargando from '../FilasLoader.vue'

    import BotonIconoPrimary from '@/components/ButtonWithIcon/ButtonPrimary.vue'


    export default defineComponent({
        name:'TablaDinamicaLocal',
        components:{
            PopUpSolido,
            TablaDinamicaEditor,
            DynamicSvgLoader,
            TablaHead,          
            FilasCargando,
            FormD_CapaTablaDinamica,
            TablaFooter,
            BotonIconoPrimary
        },
        props:{
            tabla_nombre:{
                type: String,
                default: null
            },
            tablaBase:{
                type: Object,
                default: TablaBase
            },
            consultar_registros:{
                type: Boolean,
                default: true
            },
            url_formulario:{
                type: Object,
                default: ()=>({url:null,url_submit:null})
            },
            breakpoint: {
                type: String,
                default: 'lg'  // Valor por defecto
            },
            filasXpagina:{
                type: Number,
                default: 10
            }
        },
        emits:['update:consultar_registros', 'getDataFiltrado', 'visibleFormCRUD'],
        setup(props, { emit }){

            const visibleFormCRUD = ref(false)
            const visible_editor_tabla = ref(false)
            const store = useStore(); 
            const json = ref(JSON.parse(props.tablaBase.json_tabla));  
            const {consultar_registros} = toRefs(props);        
            const formularioBaseFilas = ref({titulo_formulario:'', filas:[]});
            const cargando = ref(true)
            const tablaBase = ref(props.tablaBase)

            const data_table = ref([])//Son los registro que contiene la tabla de forma local
           
            const idGenerales = ref([])
            const descargaData = ref(false)    
            const getFormularioPorNombre = (nombre) => store.getters['reporteador/getFormularioPorNombre'](nombre);              

            const mostrarFiltros = ref(false)

            const ClasesTablaDinamica = computed(() => {
                switch (props.breakpoint) {
                    case 'sm':
                        return 'TablaDinamicaLocal col-12 break-sm'
                    case 'md':
                        return 'TablaDinamicaLocal col-12 break-md'
                    case 'lg':
                        return 'TablaDinamicaLocal col-12 break-lg'
                    case 'unset':
                        return 'TablaDinamicaLocal col-12'
                    default:
                        return 'TablaDinamicaLocal col-12 break-movil'
                }
            });

            const tablaStyles =computed(() => {
                return {
                    '--tabla-dinamica-breakpoints': `${props.breakpoint}`
                };                
            });

            const turnOnEditable =()=>{                              
                visible_editor_tabla.value=true
            }

            async function cargarFormularioBase() {  
                formularioBaseFilas.value = await getFormularioPorNombre(props.tabla_nombre + "_form");                
            }   
            
            watch(() => props.tablaBase.json_tabla, (newValue,oldValue) => {
                if (newValue !=oldValue ){
                    json.value = JSON.parse(newValue);
                }
                
            });

            onMounted(async () => {
                if (consultar_registros.value) {
                    filtrar()
                    emit('update:consultar_registros', false);
                }  
                cargarFormularioBase()

            });     
            
            //Cambia el orden con el que se mostraran los datos
            const handleOrderChange = (index) => {
                let bOrder = json.value.columnas[index].bOrder;
                switch (bOrder) {
                case '': bOrder = 'asc'; break;
                case 'asc': bOrder = 'desc'; break;
                case 'desc': bOrder = ''; break;      
                }
                json.value.columnas[index].bOrder = bOrder;                            
            }

        

            const filtrar = async () => {
                try {
                    let tbase = props.tablaBase;
                    tbase.json_tabla = JSON.stringify(json.value);

                    if (typeof tbase.id_tabla === "object") {
                        return false;
                    }

                    data_table.value = tablaBase.value.registros;
                    json.value.registros_total = data_table.value.length;

                    // Verificamos si en json.columnas hay alguna columna con valor de filtro
                    const columnasFiltradas = json.value.columnas.filter(columna => columna.valor !== null && columna.valor !== '');
                    if (columnasFiltradas.length > 0) {
                        // Si hay columnas con valor de filtro, se filtran los datos con valor igual o parcial
                        data_table.value = data_table.value.filter(registro => {
                            return columnasFiltradas.every(columna => {
                                const campo = columna.campo_nombre;
                                if (Object.prototype.hasOwnProperty.call(registro, campo)) {
                                    return registro[campo].toString().toLowerCase().includes(columna.valor.toString().toLowerCase());
                                    
                                }
                                return false;
                            });
                        });
                    }

                   

                    // Verificamos si en json.columnas hay alguna columna con bOrder: 'asc' o 'desc'
                    const columnasOrdenadas = json.value.columnas.filter(columna => columna.bOrder !== null && columna.bOrder !== '');
                    if (columnasOrdenadas.length > 0) {
                        // Si hay columnas con valor de ordenamiento, se ordenan los datos
                        data_table.value = data_table.value.sort((a, b) => {
                            return columnasOrdenadas.reduce((acumulado, columna) => {
                                const campo = columna.campo_nombre;
                                if (acumulado === 0) {
                                    if (Object.prototype.hasOwnProperty.call(a, campo) && Object.prototype.hasOwnProperty.call(b, campo)) {
                                        if (columna.bOrder === 'asc') {
                                            return a[campo].toString().localeCompare(b[campo].toString());
                                        } else if (columna.bOrder === 'desc') {
                                            return b[campo].toString().localeCompare(a[campo].toString());
                                        }
                                    }
                                }
                                return acumulado;
                            }, 0);
                        });
                    }

                    //Substraer de data_table los registros que se mostraran en la tabla
                    json.value.registros_filtrados = data_table.value.length;
                    data_table.value = data_table.value.slice(json.value.inicio, json.value.fin);

                    //json.value.registros_filtrados = filtrado? data_table.value.length : tbase.registros.length;
                    json.value.no_filas = props.filasXpagina;
                    json.value.inicio = json.value.paginaActual === 1 ? 0 : (json.value.paginaActual - 1) * json.value.no_filas;
                    json.value.fin = json.value.paginaActual * json.value.no_filas;

                    tbase.json_tabla = JSON.stringify(json.value);


                    cargando.value = false; // Actualiza el estado cuando los datos están cargados

                    emit('getDataFiltrado', data_table.value);
                } catch (error) {
                    console.error('Ocurrió un error en filtrar:', error);
                    // Manejar el error adecuadamente aquí
                    cargando.value = false; // Asegurarse de que la indicación de carga se detenga en caso de error                    
                    alert("Error al filtrar los datos. Por favor, inténtelo de nuevo.");
                }
            };


            watch(consultar_registros, (newValue) => {
            //Cuando cambia el valor de consultar_registros, se ejecuta la función filtrar
                if (newValue === true) {
                    filtrar(); 
                    emit('update:consultar_registros', false);                 
                }
            });


            watch(() => json.value.columnas.map(columna => columna.valor), (nuevosValores, viejosValores) => {                
                const cambioSignificativo = nuevosValores.some((valor, idx) => valor !== viejosValores[idx]);
                if (cambioSignificativo) {
                    json.value.paginaActual = 1
                    json.value.fin = json.value.no_filas
                    json.value.inicio = 0
                    filtrar();                    
                }
            }, {
                deep: true, // Importante para observar cambios dentro de objetos/arrays
                immediate: false // Si deseas que se ejecute inmediatamente después del montaje, cambia a true
            });

            watch(() => json.value.columnas.map(columna => columna.bOrder), (nuevosValores, viejosValores) => {             
                const cambioSignificativo = nuevosValores.some((valor, idx) => valor !== viejosValores[idx]);
                if (cambioSignificativo) {
                    json.value.paginaActual = 1
                    json.value.fin = json.value.no_filas
                    json.value.inicio = 0
                    filtrar();                   
                }
            }, {
                deep: true, // Importante para observar cambios dentro de objetos/arrays
                immediate: false // Si deseas que se ejecute inmediatamente después del montaje, cambia a true
            });

            watch(() => json.value.fin,() => {             
                //filtrar();
            },{
                deep: true, // Importante para observar cambios dentro de objetos/arrays
                immediate: false // Si deseas que se ejecute inmediatamente después del montaje, cambia a true
            });            

         

            const formularioBaseFilasSuccess = ({estado})=>{
                console.log(estado)
                if(estado){
                    filtrar()
                }
                 
            }

            const CambiarPagina = (pagina) =>{
                json.value.paginaActual = pagina
                filtrar()
            }

            const cerrarFormCrud = () => {
                visibleFormCRUD.value = false
                emit('visibleFormCRUD', false)
            }

            return {
                visible_editor_tabla,
                turnOnEditable,
                handleOrderChange,
                json,
                formularioBaseFilas,
                visibleFormCRUD,
                
                cargando,                
                inputs_catalogoSistema,
                idGenerales,
                descargaData, 
                
                formularioBaseFilasSuccess,
                CambiarPagina,                
                mostrarFiltros,
                tablaStyles,
                ClasesTablaDinamica,
                cerrarFormCrud            
            }

        }
    })

</script>



<style>   
/**TABLA DINAMICA LOCAL */
    :root {
        --border-radius-small: 15px;
        --border-radius-large: 10px;
    }
    
    .TablaDinamicaLocal{
        position: relative;         
    }
    .TablaDinamicaLocal .TablaDinamicabtn-filtrar{
            display: none;
    }
    .TablaDinamica_iconEditor{
        position: absolute;
        right: 0;
        top: 50px;
        z-index: 10;
        cursor: pointer;
        fill:var(--babyBlue)
    }
    .TablaDinamicaLocal table{
        border-collapse: collapse;
        border-spacing: 0; /* Esto es equivalente a cellspacing="0" en HTML */ 
        box-shadow: rgba(0, 0, 0, 0.16) 0px 3px 6px, rgba(0, 0, 0, 0.23) 0px 3px 6px;
        border-radius: var(--border-radius-large);
    }
    .TablaDinamicaLocal table thead {
        overflow: hidden;
        position: relative;
        z-index: 0; /* Base z-index para asegurar contexto */
    }
    .TablaDinamicaLocal table thead tr th{
        position: relative;
        z-index: 3; 
        background-color: unset; 
        color: var(--babyBlue);
        font-family: 'MonserratBoldItalic';
        padding: 0;        
    }    
    .TablaDinamicaLocal table thead tr th:first-child{
        border-radius: var(--border-radius-large) 0px 0px 0px;
    }
    .TablaDinamicaLocal table thead tr th:last-child{
        border-radius: 0px var(--border-radius-large) 0px 0px;
    }
    .TablaDinamicaLocal .TablaDinamica_nombreCampo{
        z-index: 3;
        position: relative;
        min-height: 28px; 
        margin: 5px 16px; 
        text-align: center;
        font-size: 14px;
        margin-top: 8px;      
    }
    .TablaDinamicaLocal table thead tr::after{
        content: '';        
        width: 100%;
        height: 35px;
        position: absolute;
        border-radius: var(--border-radius-large) var(--border-radius-large) 0px 0px;
        left: 0;
        top: 0;
        background: linear-gradient(90deg, var(--purple-sb) 0%, var(--bluelight-sb) 100%);
        color: var(--babyBlue); 
        z-index: 2;       
    }    

   
    .TablaDinamicaLocal .TablaDinamica_contenedorFiltro{
        position: relative;
        background-color: unset;
        z-index: 3;
        min-height: 60px;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .TablaDinamicaLocal .TablaDinamica_contenedorFiltro .TablaDinamica_orderable div,
    .TablaDinamicaLocal .TablaDinamica_contenedorFiltro .TablaDinamica_iconfiltro div{
        background-color: white;
        z-index: 3;
        width: 24px;
        position: relative; 
        display: flex;
        justify-content: center;
        align-items: center;   
        height: 38px; 
        margin-left: 15px;  
        border-radius: 10px 0px 0px 10px; 
    }
    .TablaDinamicaLocal .TablaDinamica_contenedorFiltro .TablaDinamica_orderable svg,
    .TablaDinamicaLocal .TablaDinamica_contenedorFiltro .TablaDinamica_iconfiltro svg{
        fill: var(--black);    
        width: 12px;  
        font-size: 12px;        
    }

    .TablaDinamicaLocal .TablaDinamica_contenedorFiltro .tablaDinamica-filtro-content{
        position: relative;
        z-index: 3;
        background-color: unset;
        min-width: 55px;
        display: flex;
        justify-content: center;
        align-items: center;
        width: 90%;
    }
    .TablaDinamicaLocal .TablaDinamica_contenedorFiltro .tablaDinamica-filtro-content div{
        width: 100%;
    }

    .TablaDinamicaLocal .TablaDinamica_contenedorFiltro .tablaDinamica-filtro-content input,
    .TablaDinamicaLocal .TablaDinamica_contenedorFiltro .tablaDinamica-filtro-content select{
        width: 90%;
        height: 35px;
        border-radius: 0px 10px 10px 0px;
        padding: 0 10px;
        margin: 5px 0;        
        font-size: 14px;
        color: var(--black);
        border: unset;

    }

    .TablaDinamicaLocal table thead .TablaDinamica_contenedorFiltro::before{
        content: '';        
        width: 100%;
        height: 60px;
        position: absolute;        
        left: 0;
        bottom: 0;        
        color: var(--babyBlue); 
        z-index: 2; 
        background-color: var(--blueBerryPastel);      
    }

    .TablaDinamicaLocal .TablaDinamica_orderable{
        min-height: 24px;
    }     

    .TablaDinamicaLocal table tbody tr td{
        padding: 0px 5px;
        border: unset;
        font-size: 13px;
        /*color: var(--black);*/
        font-family: 'MonserratSemiBold';
        border-right: 4px solid var(--blueBerry);
        border-bottom: 2px solid var(--blueBerryPastel);
        /*background-color: aqua; */
        height: 20px;

    }

    .TablaDinamicaLocal table tbody tr td .conBorde {/* Neblina en la parte inferior de la celda */
    min-height: 15px;
    max-height: 10px;
    display: flex;
    align-items: start;
    overflow: hidden;
    position: relative;
    height: 50px;
    padding: 10px 0px 0px 0px;   
    position: relative;
    /*background-color: tomato;*/
  } 

  .TablaDinamicaLocal table tbody tr td .conBorde::before {
    /* Neblina en la parte inferior de la celda *//*
    content: "";
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 20px; 
    background: linear-gradient(to bottom, rgba(255, 255, 255, 0) 0%, var(--babyBlue) 100%);
    pointer-events: none;*/
  }

  .TablaDinamicaLocal table tbody tr td .conBorde.controles{
    /* Sobrescribe los estilos o deja vacío para que no se apliquen */
    all: unset; /* Esto desactiva cualquier estilo que se haya aplicado */
  }
    
    .TablaDinamicaLocal table tbody tr:hover td{
        background: var(--blueBerryPastel)
    }
    .TablaDinamicaLocal table tbody tr .td-titulo{
        display: none;
    }
    .TablaDinamicaLocal table tbody tr td:last-child{
        border-right: unset;
        padding: 10px;
    }
    .TablaDinamicaLocal table tbody tr:last-child td{
        border-bottom: unset;
    }
    .TablaDinamicaLocal table tbody :last-child td:first-child{
        border-radius: 0px 0px 0px var(--border-radius-small);
    }
    .TablaDinamicaLocal table tbody :last-child td:last-child{
        border-radius: 0px 0px var(--border-radius-small) 0px;
    }


    .TablaDinamicaLocal .TablaDinamicaFooter_pagination nav .pagination{
        background: linear-gradient(90deg, var(--purple-sb-70) 0%, var(--bluelight-sb-70) 100%);
        border-radius: 10px;
        width: fit-content;
        background: var(--bluelight-sb-70);
    }
    .TablaDinamicaLocal .TablaDinamicaFooter_pagination nav .pagination  .active a{
        background-color: var(--purple-sb);
        color: var(--babyBlue);

        border:unset;
        /*border-radius: 10px;*/
        background-image: linear-gradient(90deg, var(--purple-sb-70) 0%, var(--bluelight-sb-70) 100%);
    }
    .TablaDinamicaLocal .TablaDinamicaFooter_pagination nav .pagination li a{
       background-color: unset;
       color: var(--babyBlue);
       font-family: 'MonserratSemiBold';
    }

    /*estilos de a¿la tabla que aplican de 768px hacia abajo */
    @media (max-width: 576px) { 
        .TablaDinamicaLocal.break-sm  table tbody tr td:hover{
            background: unset;
        }
        .TablaDinamicaLocal.break-sm .TablaDinamicabtn-filtrar{
            display: inline-block;
        }
        .TablaDinamicaLocal.break-sm table {
            display: block;
            position: relative;           
        }
        .TablaDinamicaLocal.break-sm table thead{
            background-color: var(--blueBerry);
            border-radius: var(--border-radius-large) var(--border-radius-large) 0px 0px;           
            position: relative;
            width: 100%;
            display: block;
            max-height: 0px;
            transition: max-height 0.5s ease;
        }
        .TablaDinamicaLocal.break-sm table .showHead {
            max-height: 2000px; /* ajustar según sea necesario */           
        }
        .TablaDinamicaLocal.break-sm table thead tr{
            display: flex;
            flex-direction: column;
            width: 100%;
            position: relative;
        }
        .TablaDinamicaLocal.break-sm table thead tr th{
            border-radius: unset;
            background: unset;
            width: 100%!important;
            position: relative;
            display: flex;
            flex-direction: row;
            justify-content: space-between;
            border: unset;
        }
        .TablaDinamicaLocal.break-sm .TablaDinamica_nombreCampo{
            font-family: 'MonserratSemiBold';
            font-size: .8rem;
        }
        .TablaDinamicaLocal.break-sm table thead .TablaDinamica_contenedorFiltro{
            width: 60%;
            display: flex;
            justify-content: end;
            padding: 0 15px;
            background: unset;
        }
        .TablaDinamicaLocal.break-sm .tablaDinamica-filtro-content select{
            min-width: 200px;
        }
        .TablaDinamicaLocal.break-sm .tablaDinamica-filtro-content input{
            width: 100%;
        }
        .TablaDinamicaLocal.break-sm .TablaDinamica_iconEditor{
            background-color: var(--blueBerry);
            border-radius: 50%;
            top: -10px;
            z-index: 10;
            box-shadow: rgba(50, 50, 93, 0.25) 0px 6px 12px -2px, rgba(0, 0, 0, 0.3) 0px 3px 7px -3px;
        }
        .TablaDinamicaLocal.break-sm tbody{
            display: flex;
            width: 100%;
            position: relative;
            flex-wrap: wrap;
            justify-content: center;
        }
        .TablaDinamicaLocal.break-sm tbody tr{
            display: flex;
            flex-direction: column;
            width: 100%;
            position: relative;
            margin: 10px;
            padding: 0px!important;
            border-radius: 20px;           
            border: unset;
            box-shadow: rgba(0, 0, 0, 0.16) 0px 3px 6px, rgba(0, 0, 0, 0.23) 0px 3px 6px;
        }
        .TablaDinamicaLocal.break-sm tbody tr td{
            background-color: unset;
            border-right: unset !important;
            border-bottom: unset !important;
            width: calc(100% - 20px);
            min-height: 30px;
            font-size: 12px;
            padding: 10px;
        }
        .TablaDinamicaLocal.break-sm table tbody tr .td-titulo{
            display: inline-block;
            background: var(--blueBerryPastel);
            width: 50%;
            text-align: end;
            padding: 0 10px 0px 5px;
            margin: 0 5px 0px 0px;
        }
        .TablaDinamicaLocal.break-sm tbody tr td .conBorde{
            border-bottom: solid 1px var(--blueBerryPastel);
        }
        .TablaDinamicaLocal.break-sm tbody tr td:nth-child(1) .td-titulo,
        .TablaDinamicaLocal.break-sm tbody tr td:nth-child(1) .conBorde{
            background: unset !important;
            border-bottom: unset;
            width: auto;
            font-size: 1rem;
            color: var(--babyBlue);
            margin: 0;
            padding: 0;
            font-family: 'MonserratSemiBoldItalic';
        }
        .TablaDinamicaLocal.break-sm tbody tr td:nth-child(1) {
            position: relative;
            background: linear-gradient(90deg, var(--purple-sb-70) 0%, var(--bluelight-sb-70) 100%);
            border-bottom: unset;
            border-radius: 15px 15px 0px 0px;
            width: 100%;
            top: 0;
            left: 0;
        }
        .TablaDinamicaLocal.break-sm table {
            border-collapse: collapse;
            border-spacing: 0; /* Equivalente a cellspacing="0" en HTML */
            box-shadow: unset;
            border-radius: 20px;
        }

        /**SOLO PARA DropDownTrespuntos */
        .TablaDinamicaLocal.break-sm table .DropDownTrespuntos{
            position: absolute;
            right: 10px;
            top: 0;
            color: var(--babyBlue);
        }
        .TablaDinamicaLocal.break-sm table .DropDownTrespuntos .icon{
            fill: var(--babyBlue)
        }
        .TablaDinamicaLocal.break-sm table .dropstart .dropdown-toggle::before{
            color: var(--babyBlue);
        }
    }


    @media (max-width: 768px) {
        .TablaDinamicaLocal.break-md  table tbody tr td:hover{
            background: unset;
        }
        .TablaDinamicaLocal.break-md .TablaDinamicabtn-filtrar {
            display: inline-block;
        }
        .TablaDinamicaLocal.break-md table {
            display: block;
            position: relative;
        }
        .TablaDinamicaLocal.break-md table thead {
            background-color: var(--blueBerry);            
            position: relative;
            width: 100%;
            display: block;
            max-height: 0px;
            transition: max-height 0.5s ease;
            border-radius: var(--border-radius-large) var(--border-radius-large) 0px 0px;
        }
        .TablaDinamicaLocal.break-md table .showHead {
            max-height: 2000px; /* ajustar según sea necesario */
        }
        .TablaDinamicaLocal.break-md table thead tr {
            display: flex;
            flex-direction: column;
            width: 100%;
            position: relative;
        }
        .TablaDinamicaLocal.break-md table thead tr th {
            border-radius: unset;
            background: unset;
            width: 100%!important;
            position: relative;
            display: flex;
            flex-direction: row;
            justify-content: space-between;
            border: unset;
        }
        .TablaDinamicaLocal.break-md .TablaDinamica_nombreCampo {
            font-family: 'MonserratSemiBold';
            font-size: .8rem;
        }
        .TablaDinamicaLocal.break-md table thead .TablaDinamica_contenedorFiltro {
            width: 60%;
            display: flex;
            justify-content: end;
            padding: 0 15px;
            background: unset;
        }
        .TablaDinamicaLocal.break-md .tablaDinamica-filtro-content select {
            min-width: 200px;
        }
        .TablaDinamicaLocal.break-md .tablaDinamica-filtro-content input {
            width: 100%;
        }
        .TablaDinamicaLocal.break-md .TablaDinamica_iconEditor {
            background-color: var(--blueBerry);
            border-radius: 50%;
            top: -10px;
            z-index: 10;
            box-shadow: rgba(50, 50, 93, 0.25) 0px 6px 12px -2px, rgba(0, 0, 0, 0.3) 0px 3px 7px -3px;
        }
        .TablaDinamicaLocal.break-md tbody {
            display: flex;
            width: 100%;
            position: relative;
            flex-wrap: wrap;
            justify-content: center;
        }
        .TablaDinamicaLocal.break-md tbody tr {
            display: flex;
            flex-direction: column;
            width: 100%;
            position: relative;
            margin: 10px;
            padding: 0px!important;
            border-radius: 20px;
            border: unset;
            box-shadow: rgba(0, 0, 0, 0.16) 0px 3px 6px, rgba(0, 0, 0, 0.23) 0px 3px 6px;
        }
        .TablaDinamicaLocal.break-md tbody tr td {
            background-color: unset;
            border-right: unset !important;
            border-bottom: unset !important;
            width: calc(100% - 20px);
            min-height: 30px;
            font-size: 12px;
            padding: 10px;
        }
        .TablaDinamicaLocal.break-md table tbody tr .td-titulo {
            display: inline-block;
            background: var(--blueBerryPastel);
            width: 50%;
            text-align: end;
            padding: 0 10px 0px 5px;
            margin: 0 5px 0px 0px;
        }
        .TablaDinamicaLocal.break-md tbody tr td .conBorde {
            border-bottom: solid 1px var(--blueBerryPastel);
        }
        .TablaDinamicaLocal.break-md tbody tr td:nth-child(1) .td-titulo,
        .TablaDinamicaLocal.break-md tbody tr td:nth-child(1) .conBorde {
            background: unset !important;
            border-bottom: unset;
            width: auto;
            font-size: 1rem;
            color: var(--babyBlue);
            margin: 0;
            padding: 0;
            font-family: 'MonserratSemiBoldItalic';
        }
        .TablaDinamicaLocal.break-md tbody tr td:nth-child(1) {
            position: relative;
            background: linear-gradient(90deg, var(--purple-sb-70) 0%, var(--bluelight-sb-70) 100%);
            border-bottom: unset;
            border-radius: 15px 15px 0px 0px;
            width: 100%;
            top: 0;
            left: 0;
        }
        .TablaDinamicaLocal.break-md table {
            border-collapse: collapse;
            border-spacing: 0; /* Esto es equivalente a cellspacing="0" en HTML */
            box-shadow: unset;
            border-radius: 20px;
        }
        /**SOLO PARA DropDownTrespuntos */
        .TablaDinamicaLocal.break-md table .DropDownTrespuntos {
            position: absolute;
            right: 10px;
            top: 0;
            color: var(--babyBlue);
        }
        .TablaDinamicaLocal.break-md table .DropDownTrespuntos .icon {
            fill: var(--babyBlue)
        }
        .TablaDinamicaLocal.break-md table .dropstart .dropdown-toggle::before {
            color: var(--babyBlue);
        }
    }



 @media (max-width: 992px) {
        
        .TablaDinamicaLocal.break-lg  table tbody tr td:hover{
            background: unset;
        }
        .TablaDinamicaLocal.break-lg .TablaDinamicabtn-filtrar{
            display: inline-block;
        }
        .TablaDinamicaLocal.break-lg table {
            display: block;
            position: relative;           
        }
        .TablaDinamicaLocal.break-lg table thead{
            background-color: var(--blueBerry);
            border-radius: var(--border-radius-large) var(--border-radius-large) 0px 0px;           
            position: relative;
            width: 100%;
            display:block;
            max-height: 0px;
            transition: max-height 0.5s ease;
        }
        .TablaDinamicaLocal.break-lg table .showHead  {
            max-height: 2000px; /* o un valor adecuado */           
           
        }
        .TablaDinamicaLocal.break-lg table thead tr{
            display:flex;
            flex-direction: column;
            width: 100%;
            position: relative;
        }
        .TablaDinamicaLocal.break-lg table thead tr th{
            border-radius: unset;
            background: unset;
            width: 100%!important;
            position: relative;
            display: flex;
            flex-direction: row;
            justify-content: space-between;
            border: unset;
            

        }
        .TablaDinamicaLocal.break-lg table thead tr::after{
            display: none;
        } 
        
        .TablaDinamicaLocal.break-lg .TablaDinamica_nombreCampo{
            font-family: 'MonserratSemiBold';
            font-size: .8rem;
        }

        .TablaDinamicaLocal.break-lg table thead .TablaDinamica_contenedorFiltro{
            width: 60%;
            display: flex;
            justify-content: end;
            padding: 0 15px;
            background: unset;
        }
        .TablaDinamicaLocal.break-lg table thead .TablaDinamica_contenedorFiltro::before{
            display: none;
        }

        .TablaDinamicaLocal.break-lg .tablaDinamica-filtro-content select{
            min-width: 200px;
        }
        .TablaDinamicaLocal.break-lg .tablaDinamica-filtro-content input{
           width: 100%;
           
        }

        .TablaDinamicaLocal.break-lg .TablaDinamica_iconEditor{
            background-color: var(--blueBerry);
            border-radius: 50%;
            top: -10px;
            z-index: 10;
            box-shadow: rgba(50, 50, 93, 0.25) 0px 6px 12px -2px, rgba(0, 0, 0, 0.3) 0px 3px 7px -3px;
        }
        
        .TablaDinamicaLocal.break-lg tbody{
            display: flex;
            width: 100%;          
            position: relative;
            flex-wrap: wrap;
            justify-content: center;
        }

        .TablaDinamicaLocal.break-lg tbody tr{
            display: flex;
            flex-direction: column;
            width: 100%;
            position: relative;
            margin: 10px;
            padding: 0px!important;
            border-radius: 20px;           
            border: unset;
            box-shadow: rgba(0, 0, 0, 0.16) 0px 3px 6px, rgba(0, 0, 0, 0.23) 0px 3px 6px;
            
        }

        .TablaDinamicaLocal.break-lg tbody tr td{
            background-color: unset;
            border-right: unset !important;
            border-bottom: unset !important;
            width: calc(100% - 20px);
            min-height: 30px;
            font-size: 12px;
            padding: 10px;
            
        }
        .TablaDinamicaLocal.break-lg table tbody tr .td-titulo{
            display: inline-block;
            background: var(--blueBerryPastel);
            width: 50%;
            text-align: end;
            padding: 0 10px 0px 5px;
            margin: 0 5px 0px 0px;
        }

        .TablaDinamicaLocal.break-lg tbody tr td .conBorde{
            border-bottom: solid 1px var(--blueBerryPastel);
        }   
        .TablaDinamicaLocal.break-lg tbody tr td:nth-child(1) .td-titulo,
        .TablaDinamicaLocal.break-lg tbody tr td:nth-child(1) .conBorde{
            background: unset !important;
            border-bottom: unset;
            width: auto;
            font-size: 1rem;
            color: var(--babyBlue);
            margin: 0;
            padding: 0;
            font-family: 'MonserratSemiBoldItalic';
        }
        .TablaDinamicaLocal.break-lg tbody tr td:nth-child(1){
            position: relative;            
        }
        .TablaDinamicaLocal.break-lg tbody tr td:nth-child(1){
            background: linear-gradient(90deg, var(--purple-sb-70) 0%, var(--bluelight-sb-70) 100%);
            border-bottom: unset;
            border-radius: 15px 15px 0px 0px;
            width: 100%;
            top: 0;
            left: 0;
            
        }
        .TablaDinamicaLocal.break-lg table{
            border-collapse: collapse;
            border-spacing: 0; /* Esto es equivalente a cellspacing="0" en HTML */ 
            box-shadow: unset;
            border-radius: 20px;
        }

        /**SOLO PARA DropDownTrespuntos */
        .TablaDinamicaLocal.break-lg table .DropDownTrespuntos{
            position: absolute;
            right: 10px;
            top: 0;
            color: var(--babyBlue);
        }
        .TablaDinamicaLocal.break-lg table .DropDownTrespuntos .icon{
            fill: var(--babyBlue)
        }
        .TablaDinamicaLocal.break-lg table .dropstart .dropdown-toggle::before{
            color: var(--babyBlue);
        }
}
    
</style>