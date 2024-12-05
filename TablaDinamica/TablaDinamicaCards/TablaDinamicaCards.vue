<template>
    <div class="TablaDinamicaCards col-12" :id="tabla_nombre">
        <div class="d-block d-md-none">
            <BotonIconoPrimary width_icon="13px" iconName="FILTRAR.svg" @click="mostrarFiltros = !mostrarFiltros">Filtros</BotonIconoPrimary>
        </div>
        
        <DynamicSvgLoader class="TablaDinamicaCards_iconEditor" title="vista edicion" @click="turnOnEditable" fileName="icons/UCT_ADMIN/COMPETENCIAS-13" width_icon="20px" :icon_active="true"></DynamicSvgLoader>
        <table class="table table-light" v-if="json">
            
          
            <TablaHead  :json="json" @orderChanged="handleOrderChange" :class="{ 'showHead': mostrarFiltros, 'hideHead': !mostrarFiltros }" ></TablaHead> 
            <FilasCargando v-if="cargando" :columnas="json.filas.length"></FilasCargando>
            <TablaBodyCards v-else :json="json"
                :data_table="data_table" 
                @button_evento="button_evento_hijo"
                @turnOnFormularioCRUD="ShowFormularioCRUD"></TablaBodyCards>           
        </table>
        <TablaFooter
                :json="json"
                @cambiarPagina="CambiarPagina"
        ></TablaFooter>
    </div>

    <PopUpSolido :visible="visible_editor_tabla" @update:visible="visible_editor_tabla = $event"  size="large" titulo="Tabla Dinámica Propiedades" ref="modalEditar" :fullScreenHeight="false">
        
        <TablaDinamicaEditor :tabla_nombre="tabla_nombre" :tablaBase="tablaBase"></TablaDinamicaEditor>
    </PopUpSolido>

    <PopUpSolido :visible="visibleFormCRUD" size="large" @update:visible="visibleFormCRUD = $event" titulo="Formulario CRUD">
        
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

    import {defineComponent, ref, onMounted, watch, toRefs} from 'vue'
    import TablaDinamicaEditor from '../TablaDinamicaEditor.vue'
    import PopUpSolido from '@/components/Modal/ModalSolid.vue';
    import DynamicSvgLoader from '@/components/LoaderSVG/LoaderSVG.vue'

    import TablaHead from '@/components/TablaDinamica/TablaHead.vue';    
    import TablaBodyCards from '@/components/TablaDinamica/TablaDinamicaCards/TablaBodyCards.vue';
    import TablaFooter from '@/components/TablaDinamica/TablaFooter.vue';

    import {inputs_catalogoSistema} from '@/store/ReporteadorReactive/FormularioDinamicoADM';
    import FormD_CapaTablaDinamica from '@/screens/UCT_Admin/FormD_ADM/CapasImplementacion/FormD_CapaTablaDinamica.vue'

    import { TablaBase } from "@/store/ReporteadorReactive/TablaDinamica.js"
    import { useStore } from 'vuex';
    import FilasCargando from '../FilasLoader.vue'
    import BotonIconoPrimary from '@/components/ButtonWithIcon/ButtonPrimary.vue'


    export default defineComponent({
        name:'TablaDinamicaCards',
        components:{
            PopUpSolido,
            TablaDinamicaEditor,
            DynamicSvgLoader,
            TablaHead,
            //TablaBody,
            FilasCargando,
            FormD_CapaTablaDinamica,
            TablaFooter,
            TablaBodyCards,
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
            }
        },
        emits:['button_evento','update:consultar_registros'],
        setup(props, { emit }){

            const visibleFormCRUD = ref(false)
            const visible_editor_tabla = ref(false)
            const store = useStore(); 
            const json = ref(JSON.parse(props.tablaBase.json_tabla));  
            const {consultar_registros} = toRefs(props);        
            const formularioBaseFilas = ref({titulo_formulario:'', filas:[]});
            const cargando = ref(true)
            const data_table = ref([])
            const idGenerales = ref([])
            const descargaData = ref(false)    
            const getFormularioPorNombre = (nombre) => store.getters['reporteador/getFormularioPorNombre'](nombre);  

            const mostrarFiltros = ref(false)

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

            const ShowFormularioCRUD = (data)=>{
                visibleFormCRUD.value = true
                idGenerales.value = data.idGenerales_ 
                descargaData.value = true             
            }

            const filtrar = async () => {
                try {
                    
                    let tbase = props.tablaBase;
                    tbase.json_tabla = JSON.stringify(json.value);

                    if (typeof tbase.id_tabla === "object"){
                        return false
                    }

                    const res = await store.dispatch('reporteador/CargarDataTable', {
                        token: store.state.user.token,
                        tablaBase: tbase
                    });

                    data_table.value = {
                        valor: res.data.data_table.registros,
                        idGenerales: res.data.data_table.idGenerales,
                        propiedades: res.data.propiedades
                    };

                    store.dispatch('reporteador/agregarRegistrosTabla', {
                        nombreTabla: tbase.nombre_tabla,
                        registros: data_table.value.valor
                    });

                    json.value.registros_total = res.data.data_table.registros_total
                    json.value.registros_filtrados = res.data.data_table.registros_filtrados
                    json.value.filas = res.data.data_table.json_actualizado.filas
                    cargando.value = false; // Actualiza el estado cuando los datos están cargados
                    //emit('update:consultar_registros', false); // Emite un evento para actualizar la prop en el padre

                } catch (error) {
                    console.error('Ocurrió un error en filtrar:', error);
                    // Manejar el error adecuadamente aquí
                    cargando.value = false; // Asegurarse de que la indicación de carga se detenga en caso de error                    
                    alert("Error al filtrar los datos. Por favor, inténtelo de nuevo.");
                }
            }

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

            

            const button_evento_hijo = ({fila_data, index, index_componente}) => {
                //console.log(fila_data, index, index_componente)
                emit('button_evento',{fila_data, json, index, index_componente})
            }

            const formularioBaseFilasSuccess = ({estado})=>{
                if(estado){
                    filtrar()
                }
            }

            const CambiarPagina = (pagina) =>{
                json.value.pagina = pagina
                filtrar()
            }

            
          

            return {
                visible_editor_tabla,
                turnOnEditable,
                handleOrderChange,
                json,
                formularioBaseFilas,
                visibleFormCRUD,
                ShowFormularioCRUD,
                cargando,
                data_table,
                inputs_catalogoSistema,
                idGenerales,
                descargaData, 
                button_evento_hijo,
                formularioBaseFilasSuccess,
                mostrarFiltros,
                CambiarPagina           
            }

        }
    })

</script>

<style>
    .TablaDinamicaCards{
        position: relative; 
        max-height: 100%; 
    }
    .TablaDinamicaCards_iconEditor{
        position: absolute;
        right: 0;
        top: 0;
        z-index: 10;
        cursor: pointer;
        fill:var(--babyBlue)
    }
    .TablaDinamicaCards table{
        border-collapse: collapse;
        border-spacing: 0; 
        /*
        box-shadow: rgba(0, 0, 0, 0.16) 0px 3px 6px, rgba(0, 0, 0, 0.23) 0px 3px 6px;
        border-radius: 20px;*/
    }
    .TablaDinamicaCards table thead {
        overflow: hidden;
        position: relative;
        z-index: 0; /* Base z-index para asegurar contexto */
        background-color: var(--blueBerryPastel); 

    }
    .TablaDinamicaCards table thead tr th{
        position: relative;
        z-index: 3; 
        background-color: unset; 
        color: var(--babyBlue);
        font-family: 'MonserratBoldItalic';
        padding: 0;        
    } 
    
    .TablaDinamicaCards table thead tr th{
        margin: 0;
        border: unset; 
    }   
    .TablaDinamicaCards table thead tr th:first-child{
        border-radius: 20px 0px 0px 20px;
    }
    .TablaDinamicaCards table thead tr th:last-child{
        border-radius: 0px 20px 20px 0px;
    }
    .TablaDinamicaCards .TablaDinamica_nombreCampo{
        z-index: 3;
        position: relative;
        min-height: 28px; 
        margin:2px; 
        text-align: center;
        font-size: 14px;
              
    }
      

   
    .TablaDinamicaCards .TablaDinamica_contenedorFiltro{
        position: relative;
        background-color: unset;
        z-index: 3;
        min-height: 50px;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .TablaDinamicaCards .TablaDinamica_contenedorFiltro .TablaDinamica_orderable div,
    .TablaDinamicaCards .TablaDinamica_contenedorFiltro .TablaDinamica_iconfiltro div{
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
    .TablaDinamica .TablaDinamica_orderable{
        min-height: 24px;
    }
    /**Icono Order */
    .TablaDinamicaCards .TablaDinamica_contenedorFiltro .TablaDinamica_orderable svg,
    .TablaDinamicaCards .TablaDinamica_contenedorFiltro .TablaDinamica_iconfiltro svg{
        fill: var(--black);    
        width: 12px;  
        font-size: 12px;  
        margin: 0;      
    }
    /**Input Filtro */
    .TablaDinamicaCards .TablaDinamica_contenedorFiltro .tablaDinamica-filtro-content{
        position: relative;
        z-index: 3;
        background-color: unset;
        min-width: 55px;
        display: flex;
        justify-content: center;
        align-items: center;
    }
    .TablaDinamicaCards .TablaDinamica_contenedorFiltro .tablaDinamica-filtro-content input,
    .TablaDinamicaCards .TablaDinamica_contenedorFiltro .tablaDinamica-filtro-content select{
        width: calc(100% - 26px);
        height: 38px;
        border-radius: 0px 10px 10px 0px;
        padding: 0 10px;
        margin: 0px 0;        
        font-size: 14px;
        color: var(--black);
        border: unset;
    }
    
    /**mediaquery por debajo de 768px */
    @media screen and (max-width: 768px){
        .TablaDinamicaCards table thead{
            max-height: 2px;
            transition: max-height 0.5s ease;
            overflow: hidden;            
            display: block;
        }
        .TablaDinamicaCards table .showHead  {
            max-height: 2000px; /* o un valor adecuado */           
           
        }        

        .TablaDinamicaCards table thead tr{
            display: flex;
            flex-direction: column;
        }
        .TablaDinamicaCards table thead tr th{
            display: flex;
            flex-direction: row;            
            align-items: center;
            width: 100%!important;
            justify-content: space-evenly;
        }
        .TablaDinamicaCards table thead tr th p{
            width: 30%;
        }
        .TablaDinamicaCards table thead tr th .TablaDinamica_contenedorFiltro{
            max-width: 60%;
            width: fit-content;
        }
    }
    
    .TablaDinamicaCards .card{
        background-color: var(--bluelight-sb);
        transition: .3s linear;
    }

    .TablaDinamicaCards .card:hover{
        background-color: var(--bluePerry);
        scale: 1.05;
        z-index: 10;
    }

    .TablaDinamicaCards .card-body{
        padding: 0;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
    }
    
    .TablaDinamicaCards .TablaBodyCards-tituloCampo{
        font-family: 'MonserratBoldItalic';
        font-size: 13px;
        color: var(--babyBlue);
    }

    .TablaDinamicaCards .TablaBodyCards-texto{
        font-family: 'Monserrat';
        font-size: 12px;
        color: var(--babyBlue);
    }

    .TablaDinamicaCards .card-body div{
        border: unset;       
        overflow-y: auto;  
        background-color: unset;
              
    }


    .TablaDinamicaCards .TablaDinamicaFooter{
        position: relative;
        bottom: 0;
        left: 0;
        right: 0;
        background-color: var(--blueBerryPastel);
        display: flex;
        justify-content: space-around;
        align-items: center;
        height: 60px;        
        border-radius: 0px 0px 20px 20px;
    }


</style>