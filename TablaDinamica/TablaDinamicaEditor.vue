<template>
    <div>

        <form class="row g-3 d-flex justify-content-between" @submit="CrearTabla($event, tabla_nombre, opcionesTablaCrear_selected)">
            <div class="col-5">
                <label for="NombreTabla" class="visually-hidden">Nombre Tabla</label>
                <input type="text" readonly class="form-control-plaintext" id="NombreTabla" :value="tabla_nombre">
            </div> 
            <div class="col-4" v-if="!comprobarTblaBase">
                <label for="agregarFormulario" class="visually-hidden">Agregar Formulario</label>
                <select class="form-select" aria-label="Default select example" id="agregarFormulario" required v-model="opcionesTablaCrear_selected">
                    <option selected>...</option>
                    <option v-for="opcion in opcionesTablaCrear" :key="opcion.texto"  :value="opcion.valor">{{opcion.texto}}</option>
                </select>
            </div>        
            <div class="col-auto">
                <button v-if="!comprobarTblaBase"                 
                    type="submit" 
                    class="btn btn-primary mb-3">Crear</button>
            </div>
            <div class="col-auto">
                <button v-if="comprobarTblaBase"
                    @click="()=>visibleJsonEditor=true" 
                    type="button"
                    class="btn btn-primary mb-3">JSON</button>
            </div>
        </form>


        <div v-if="comprobarTblaBase" class="position-relative mt-1">
            <FormD_CapaTablaDinamica 
                :formularioBase="formularioBaseTabla"            
                :inputs_catalogo="inputs_catalogoSistema"
                :idGenerales="[{name:'id_tabla', value:tablaBase.id_tabla, tabla_bd:'tabla_dinamica'}]"
                :descargaData="true"        
            ></FormD_CapaTablaDinamica>        
        </div>
    
    </div>

    <PopUp :visible="visibleJsonEditor" size="large" @update:visible="visibleJsonEditor = $event" titulo_b="Editar estructura de la tabla">
        <div class="d-flex col-12">
            <div class="col-6 tablaDinamicaEditor-json" v-if="mostrarEditorJson" >       
                <p>Estructura json de la tabla</p>
                <Vue3JsonEditor            
                    v-model="json"
                    :show-btns="true"
                    :mode="'code'"
                    :expandedOnStart="true"
                    @json-change="onJsonChange"
                    @json-save="saveJson"
                    @has-error="jsonError"
                />            
            </div>
            <div class="col-6 ms-2 position-relative tablaDinamicoEditor-contenedor">  
                <p>Previsualizador</p>              
                <div :style="{ zoom: zoomLevel }">
                    <table class="table table-bordered table-light">
                        <TablaHead  :json="json" @orderChanged="handleOrderChange" ></TablaHead>                        
                    </table>            
                </div>
                <input class="position-absolute bottom-0 start-0" type="range" min="0.5" max="2" step="0.1" v-model="zoomLevel">
                <div>
                    <textarea name=""  class="form-input w-100" rows="5" v-model="consultaSQL"></textarea>
                    <button @click="GuardarConsulta" class="btn btn-primary">Generar JSON</button>
                </div>
            </div>
        </div>
            
    </PopUp>   
        
</template>

<script>

    import {defineComponent, ref, computed, toRefs,} from 'vue'
    import { Vue3JsonEditor } from 'vue3-json-editor'
    import PopUp from '@/components/Modal/Modal.vue';
    import FormD_CapaTablaDinamica from '@/screens/UCT_Admin/FormD_ADM/CapasImplementacion/FormD_CapaTablaDinamica.vue'
    import { inputs_catalogoSistema, tablas_sistema } from '@/store/ReporteadorReactive/FormularioDinamicoADM';
    import { useStore } from 'vuex';
    //import { GetTablaNombre, TablaBase } from "@/store/ReporteadorReactive/TablaDinamica.js";
    import TablaHead from '@/components/TablaDinamica/TablaHead.vue';
    //import TablaBody from '@/components/TablaDinamica/TablaBody.vue';
    import axios from '@/../axios-config.js';


    export default defineComponent({
        name:'TablaDinamicaEditor',
        components:{
            Vue3JsonEditor,
            PopUp,
            FormD_CapaTablaDinamica,
            TablaHead,
            //TablaBody
        },
        props:{
            
            tabla_nombre:{
                type: String,
                default: null
            },
            tablaBase:{
                type: Object,
                default: null
            },            
            inputs_catalogoSistema:{
                type: Object,
                default: ()=>inputs_catalogoSistema
            },
            tablas_sistema:{
                type: Object,
                default: ()=>tablas_sistema
            }
        },
        emits:['CerrarEditor'],
        setup(props, {emit}){
            const {tablaBase} = toRefs(props)
            const json = ref(JSON.parse(tablaBase.value.json_tabla) || {})
            const visibleJsonEditor = ref(false)
            //const visibleFormularioCRUD = ref(false)
            const store = useStore();
            const token = store.state.user.token;  
            const zoomLevel = ref(.5);          
            const consultaSQL = ref('')

            const opcionesTablaCrear =[
                {texto:'Con formulario', valor:1},
                {texto:'Sin formulario', valor:2}
            ]
            const opcionesTablaCrear_selected = ref(0)
            const getFormularioPorNombre = (nombre) => store.getters['reporteador/getFormularioPorNombre'](nombre);
            
            const formularioBaseFilas = computed(() => getFormularioPorNombre(props.tabla_nombre + "_form"));
            const formularioBaseTabla = computed(() => getFormularioPorNombre("Formulario_TablaDinamica"));

            const mostrarEditorJson = ref(true);

            const ExisteTabla = ()=>{
                //Validar si existe una tabla con el nombre de props.tabla_nombre en el store
                return false
            }

            const CrearTabla = async (event, tabla_nombre, opcionesTablaCrear_selected)=>{
                event.preventDefault()
                //Crear una tabla con el nombre de props.tabla_nombre en el store
                await store.dispatch('reporteador/CrearTabla', { token, tabla_nombre,  opcionesTablaCrear_selected });
                emit('CerrarEditor', true)
            }

            //JSON EDITOR  
            const onJsonChange = ()=>{                
                //tablaBase.value.json_tabla = JSON.stringify(value)
            }

            const saveJson = async (valor)=>{  
                tablaBase.value.json_tabla = JSON.stringify(valor)              
                await store.dispatch('reporteador/GuardarJsonTabla', {
                    token: store.state.user.token,
                    tabla_id: tablaBase.value.id_tabla,
                    json_tabla: valor
                })
                //Actualizar los valores de json con los de valor
                json.value = valor
            }

            const jsonError =(error)=>{
                console.log(error)
            }

            const handleOrderChange = (index) => {
                let bOrder = json.value.columnas[index].bOrder;
                switch (bOrder) {
                case '': bOrder = 'asc'; break;
                case 'asc': bOrder = 'desc'; break;
                case 'desc': bOrder = ''; break;      
                }
                json.value.columnas[index].bOrder = bOrder;                            
            }

            const comprobarTblaBase = computed(() => {                
                return (typeof props.tablaBase.id_tabla === 'number') && (props.tablaBase.id_tabla > 0)
            })

            const getCredenciales = () => {
                const token = store.state.user.token; // Ajusta según la estructura de tu store
                return {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                };
            };

            const GuardarConsulta = async()=>{
                const headers = getCredenciales(); 

                try {
                    mostrarEditorJson.value = false
                    const response = await axios.post('/FormularioDinamico/GuardarConsultaSQL', { id_tabla: tablaBase.value.id_tabla, consultaSQL:consultaSQL.value }, headers);                    
                    //se combierte la cadena de texto en un objeto json
                    //const data = JSON.parse(response.data.json)                    
                    json.value.columnas = response.data.json.columnas
                    json.value.filas = response.data.json.filas 
                    mostrarEditorJson.value = true                         
                        
                } catch (error) {
                console.error("Error al cargar el formulario:", error);
                }
            }

            
            return{          
                visibleJsonEditor,
                json,
                onJsonChange,
                saveJson,
                jsonError,
                mostrarEditorJson,
                          
                ExisteTabla,
                //GetTablaNombre,
                opcionesTablaCrear,
                CrearTabla,
                opcionesTablaCrear_selected,
                formularioBaseFilas,
                formularioBaseTabla,
                zoomLevel,
                handleOrderChange,  
                comprobarTblaBase,
                GuardarConsulta,
                consultaSQL             
            
            }
        }
    })

</script>

<style>
    .tablaDinamicaEditor-json .jsoneditor-vue{
        height: 500px;
    }   
    .tablaDinamicaEditor-json .editor {
        height: 500px!important;
    }
    .tablaDinamicoEditor-contenedor{        
        overflow-x: hidden;
        height: 540px;
    }
</style>