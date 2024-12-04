<template>
    <div v-if="cargando">
        <TablaCargando />
    </div>
    <div v-else>
        <NavBarPaginasUCT :elementos_dropdown="false">
            <template #elementos_opcionales>
                <div>
                    <BotonIconoPrimary iconName="USUARIO-04.svg" class="" width_icon="16px"
                        @click="FiltrarUsuariosSeleccionados">UsuariosSeleccionados
                        <span class="badge m-0 ">{{ users_selected.length }}</span>
                    </BotonIconoPrimary>
                    <BotonIconoPrimary v-if="bto_seleccionarTodos" iconName="People.svg" class="" width_icon="16px"
                        @click="MarcarTodosLosUsuarios">Todos
                        <span class="badge m-0 ">{{ users_selected.length }}</span>
                    </BotonIconoPrimary>
                </div>
            </template>
        </NavBarPaginasUCT>

        <div class="m-2">
            <TablaDinamica :consultar_registros="TablaUsuarioSeleccionRapida_filtrar"
                :tablaBase="TablaUsuarioSeleccionRapida" tabla_nombre="TB_UsuarioSeleccionRapida"
                @update:consultar_registros="manejadorFiltro" @finalizarRenderBody="finalizarRenderBody">
            </TablaDinamica>

        </div>


    </div>

    <!--CHECKS DE USUARIOS-->
    <template v-if="montarChecks">
        <div>
            <template v-for="(registro, index) in TablaUsuarioSeleccionRapida.registros"
                :key="'dropdown-' + registro.id">
                <teleport v-if="opciones.length === 0"
                    :to="`#TB_UsuarioSeleccionRapida table tr:nth-child(${index + 1}) td:last-child div`">
                    <div class="d-flex justify-content-center">
                        <input class="form-check-input" type="checkbox" role="switch"
                            :checked="validarUsarioSeleccionado(registro)" @change="handleChangeSwich(registro)" />
                    </div>
                </teleport>

                <!--INPUT CHECK + DROPDOWN DE OPCIONES-->
                <div v-else>
                    <teleport
                        :to="`#TB_UsuarioSeleccionRapida table tr:nth-child(${index + 1}) td:nth-child(${columnas.length - 1}) div`">
                        <div class="d-flex justify-content-center">
                            <input class="form-check-input" type="checkbox" role="switch"
                                :checked="validarUsarioSeleccionado(registro)" @change="handleChangeSwich(registro)" />
                        </div>
                    </teleport>
                    <teleport
                        :to="`#TB_UsuarioSeleccionRapida table tr:nth-child(${index + 1}) td:nth-child(${columnas.length}) div`">
                        <div>
                            <DropDownTrespuntos @elementoSeleccionado="accionDropDown($event, registro)"
                                width_icon="24px" :iconName="'ellipsis-horizontal.svg'" :lista="opciones" />
                        </div>
                    </teleport>
                </div>
            </template>

        </div>
    </template>
</template>

<script>
import { defineComponent, ref, computed, nextTick, watch, toRef } from 'vue';
// TABLA DINAMICA
import { useStore } from 'vuex';
import TablaCargando from '@/components/TablaDinamica/TablaLoader.vue';
import TablaDinamica from '@/components/TablaDinamica/TablaDinamica.vue';

import BotonIconoPrimary from '@/components/ButtonWithIcon/ButtonPrimary.vue';
import NavBarPaginasUCT from '@/components/NavBar/NavBarPaginasUCT.vue'
import DropDownTrespuntos from '@/components/ListaDesplegable/DropDownTrespuntos.vue';



export default defineComponent({
    name: "TablaUsuarioSeleccionRapida",
    components: {
        TablaCargando,
        TablaDinamica,
        BotonIconoPrimary,
        NavBarPaginasUCT,
        DropDownTrespuntos
    },
    props: {
        users_selected: {
            type: Array,
            default: () => []
        },
        campos: {
            type: Array,
            default: () => ['id usuario', 'usuario', 'nombre']
        },
        opciones: {
            type: Array,
            default: () => []
        },
        reiniciar: {
            type: Boolean,
            default: false
        },
        filtrar: {
            type: Boolean,
            default: false
        },
        bto_seleccionarTodos: {
            type: Boolean,
            default: false
        },
        no_filasVisibles: {
            type: Number,
            default: 10
        }
    },
    emits: ['update:users_selected', 'update:TBSeleccionRapida', 'update:MarcarTodosLosUsuarios', 'update:accionDropDown', 'update:TBFiltrar'],
    setup(props, { emit }) {
        const store = useStore();
        const cargando = ref(true);
        const TablaUsuarioSeleccionRapida = computed(() => store.getters['reporteador/getTablaPorNombre']('TB_UsuarioSeleccionRapida'));
        const TablaUsuarioSeleccionRapida_filtrar = ref(true);
        const montarChecks = ref(false);
        const moduloActivo = computed(() => store.getters['user/getModuloActivo']);
        const cofigurada = ref(false);
        const columnas = toRef(props.campos);
        //const users_selected = toRef(props.users_selected);

        const cargarDatosIniciales = async () => {
            await store.dispatch('reporteador/agregarDataReporteadorModulo', {
                modulo: moduloActivo.value.modulo_nombre,
                sistema: moduloActivo.value.sistema,
                token: store.state.user.token,
                tablas_nombres: ['TB_UsuarioSeleccionRapida'],
                formularios_nombres: [],
            });
            cargando.value = false;

        };



        const GetTablaConfigurada = () => {
            if (cofigurada.value) return;

            let json_tabla = JSON.parse(TablaUsuarioSeleccionRapida.value.json_tabla);

            columnas.value.push('controles');
            //Si props.opciones no esta vacio se agrega otra columna para los controles
            if (props.opciones.length > 0) {
                columnas.value.push('controles');
            }

            let cont_etiqueta_controles = columnas.value.filter(columna => columna.toUpperCase() === 'CONTROLES').length;
            let porcentaje = 90 / (columnas.value.length - cont_etiqueta_controles);
            let filas = [];
            let cols = [];

            // Se construyen los arreglos filas y col
            let contador_controles = 1;
            columnas.value.forEach((columna) => {
                // Se sustituyen los espacios por guiones bajos
                let campo_nombre = columna.replace(/\s/g, '_');
                //La primera letra de cada palabra en mayúscula
                columna = columna.replace(/\b[a-z]/g, (letra) => letra.toUpperCase());

                contador_controles = columna.toUpperCase() === 'CONTROLES' ? contador_controles + 1 : contador_controles;
                // Si la columna es 'Controles' se agrega un espacio en blanco por cada valor eb contador_controles
                let titulo = (columna.toUpperCase() === 'CONTROLES') ? ' '.repeat(contador_controles) : columna;
                cols.push({
                    "titulo": titulo,
                    "filtro": (columna == 'Controles') ? false : true,
                    "valor": null,
                    "control": "texto",
                    "type": "texto",
                    "width_col": (columna == 'Controles') ? '10%' : porcentaje + "%",
                    "ordenable": (columna == 'Controles') ? false : true,
                    "bOrder": (campo_nombre == 'id_usuario') ? "asc" : '',
                    "campo_nombre": (columna == 'Controles') ? 'id_usuario' : campo_nombre,
                    "opciones": null,
                    "componentes": null
                });

                filas.push({
                    type: 'label',
                    componente: null,
                    data: {},
                });
            });

            json_tabla.filas = filas;
            json_tabla.columnas = cols;
            json_tabla.fin = props.no_filasVisibles == null ? 10 : props.no_filasVisibles;
            json_tabla.no_filas = props.no_filasVisibles == null ? 10 : props.no_filasVisibles;
            cofigurada.value = true;
            return TablaUsuarioSeleccionRapida.value.json_tabla = JSON.stringify(json_tabla);
        };


        watch(TablaUsuarioSeleccionRapida, (newValue) => {
            if (newValue) {
                GetTablaConfigurada();
            }
        }, { immediate: true });

        const manejadorFiltro = (nuevoValor) => {
            console.log('Filtrar', nuevoValor);
        };

        const finalizarRenderBody = () => {
            TablaUsuarioSeleccionRapida_filtrar.value = false;
            montarChecks.value = false;
            nextTick(() => {
                if (document.getElementById("TB_UsuarioSeleccionRapida")) {
                    montarChecks.value = true;
                }
            });
        };

        const validarUsarioSeleccionado = (registro) => {
            let id_usuario = registro.id_usuario == null ? registro.ignorar_id_usuario : registro.id_usuario;

            return props.users_selected.includes(id_usuario);
        };

        const handleChangeSwich = (registro) => {
            emit('update:users_selected', registro);

        };

        const FiltrarUsuariosSeleccionados = () => {

            let jsonTB = JSON.parse(TablaUsuarioSeleccionRapida.value.json_tabla);
            if (jsonTB.where) {
                if (jsonTB.where.length > 0) {
                    jsonTB.where = [];
                } else {
                    jsonTB.where = [{
                        regla: 'IN',
                        campo: 'id_usuario',
                        valor: props.users_selected
                    }];
                }

            }

            TablaUsuarioSeleccionRapida.value.json_tabla = JSON.stringify(jsonTB);
            TablaUsuarioSeleccionRapida_filtrar.value = !TablaUsuarioSeleccionRapida_filtrar.value;
        };

        watch(() => props.reiniciar, (newValue) => {
            if (newValue && TablaUsuarioSeleccionRapida.value !== undefined) {
                // Restablece la tabla o realiza la acción de reinicio
                let jsonTB = JSON.parse(TablaUsuarioSeleccionRapida.value.json_tabla);
                jsonTB.where = [];
                TablaUsuarioSeleccionRapida.value.json_tabla = JSON.stringify(jsonTB);
                emit('update:TBSeleccionRapida', false); // Emite el evento para restablecer el interruptor en el padre
            }
        }, { immediate: true });

        watch(() => props.filtrar, (newValue) => {
            if (newValue) {
                TablaUsuarioSeleccionRapida_filtrar.value = true;
                emit('update:TBFiltrar', true);
            }
        }, { immediate: true });

        const MarcarTodosLosUsuarios = () => {
            emit('update:MarcarTodosLosUsuarios', TablaUsuarioSeleccionRapida.value.registros);
        }

        const accionDropDown = ({ nombre }, registro) => {
            emit('update:accionDropDown', { nombre, registro });
        };

        cargarDatosIniciales();

        return {
            cargando,
            TablaUsuarioSeleccionRapida,
            TablaUsuarioSeleccionRapida_filtrar,
            manejadorFiltro,
            montarChecks,
            finalizarRenderBody,
            validarUsarioSeleccionado,
            handleChangeSwich,
            FiltrarUsuariosSeleccionados,
            MarcarTodosLosUsuarios,
            columnas,
            accionDropDown

        };
    }
});
</script>
