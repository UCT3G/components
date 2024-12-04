<template>
    <div>
        <hr>
        <div class="d-flex justify-content-end mb-2">
            <IconBoton width_icon="13px" iconName="TRASH.svg" @click="ventanaEliminarNecesidad = true">Eliminar
            </IconBoton>
        </div>
        <div class="row mb-2">
            <div class="col-12">
                <div class="label-container mb-2">
                    <p class="label-title">¿Cuáles son las principales necesidades de capacitación detectadas que busca
                        cubrir?</p>
                    <p class="label-description">Favor de ser específico y detallado, basándose en hechos y no en
                        percepciones.</p>
                </div>
                <textarea class="form-control input-formulario" v-model="necesidadDetectada"></textarea>
            </div>
        </div>
        <div class="row mb-2">
            <div class="col-12">
                <div class="label-container mb-2">
                    <p class="label-title">¿Qué indicadores impactan las necesidades antes mencionadas?</p>
                    <p class="label-description">Favor de incluir los resultados de, al menos, los últimos 3 meses y
                        compararlos con sus respectivas metas.</p>
                </div>
                <textarea class="form-control input-formulario" v-model="indicadores"></textarea>
            </div>
        </div>
        <div class="row mb-2">
            <div class="col-12">
                <div class="label-container mb-2">
                    <p class="label-title">SOLUCION SUGERIDA</p>
                    <p class="label-description">Nombre de la competencia a reforzar.</p>
                </div>
                <textarea class="form-control input-formulario" v-model="solucion"></textarea>
            </div>
        </div>
        <div class="row mb-2">
            <div class="col-12">
                <div class="label-container mb-2">
                    <p class="label-title">¿Qué espera que los usuarios desarrollen al participar en la capacitación
                        solicitada?</p>
                    <p class="label-description">¿Qué espera que los usuarios desarrollen al participar en la
                        capacitación solicitada?.</p>
                </div>
                <textarea class="form-control input-formulario" v-model="habilidades"></textarea>
            </div>
        </div>
        <div class="d-flex justify-content-center mb-2">
            <IconBoton width_icon="13px" iconName="UCT_Kanban/actualizar.svg" @click="actualizarNecesidad">Actualizar
                Necesidad</IconBoton>
        </div>
        <hr>
        <div class="row mt-2">
            <div class="col-11 d-flex align-items-center justify-content-center">
                <h6 class="fw-bolder">Dirigido a</h6>
            </div>
            <div class="col-1">
                <div class="d-flex justify-content-end">
                    <IconBoton width_icon="13px" iconName="AGREGAR-24.svg" @click="seleccionarPublico = true">Agregar
                    </IconBoton>
                </div>
            </div>
        </div>
        <div class="row custom-container mb-2" v-for="p in publicoDNC" :key="p.id_dirigido">
            <div class="col-9 d-flex justify-content-start">
                {{ p.tipo }}: {{ p.nombre }}
            </div>
            <div class="col-3 d-flex justify-content-center">
                <DynamicSvgLoader width_icon="15px" fileName="icons/TRASH" :icon_active="true" @click="abrirVentanaEliminarPublico(p)"></DynamicSvgLoader>
            </div>
        </div>
        <hr>
    </div>
    <LoadingUCT :blockFullScreem="true" class="position-fixed top-0 start-0" v-if="cargandoBloqueo" />
    <PopupSolid :visible="ventanaEliminarNecesidad" size="small" @update:visible="ventanaEliminarNecesidad = $event"
        :confirm="true" :confirmFunction="eliminarNecesidad" titulo="Confirmar eliminar necesidad">
        ¿Estas seguro de eliminar la necesidad "{{ necesidadDetectada }}"?
    </PopupSolid>
    <PopupSolid :visible="seleccionarPublico" :size="'large'" @update:visible="seleccionarPublico = $event"
        :titulo="'Dirigido a'">
        <DNC_DirigidoA :necesidad="necesidad"></DNC_DirigidoA>
    </PopupSolid>
    <PopupSolid :visible="ventanaEliminarPublico" size="small" @update:visible="ventanaEliminarPublico = $event"
        :confirm="true" :confirmFunction="eliminarDirigidoADNC" titulo="Confirmar eliminar">
        ¿Estas seguro de eliminar el público tipo "{{ publicoSeleccionado.tipo }}" y nombre "{{ publicoSeleccionado.nombre }}"?
    </PopupSolid>
</template>

<script>
import { computed, defineComponent, onMounted, ref, watch } from 'vue';
import IconBoton from "@/components/ButtonWithIcon/ButtonPrimary.vue";
import LoadingUCT from "@/components/Loading/Loading.vue";
import PopupSolid from "@/components/Modal/ModalSolid.vue";
import DNC_DirigidoA from "./DNC_DirigidoA.vue";
import DynamicSvgLoader from "@/components/LoaderSVG/LoaderSVG.vue";
import { useStore } from 'vuex';

export default defineComponent({
    props: {
        necesidad: {
            type: Object,
            required: true,
        },
    },
    components: {
        IconBoton,
        LoadingUCT,
        PopupSolid,
        DNC_DirigidoA,
        DynamicSvgLoader,
    },
    emits: ['actualizar-necesidad', 'eliminar-necesidad'],
    setup(props, { emit }) {
        const store = useStore();
        const idNecesidadDetectada = ref(props.necesidad.id_necesidad || 0);
        const necesidadDetectada = ref(props.necesidad.necesidad || "");
        const indicadores = ref(props.necesidad.indicador || "");
        const solucion = ref(props.necesidad.solucion || "");
        const habilidades = ref(props.necesidad.habilidades || "");
        const idDnc = ref(props.necesidad.id_dnc_fk || 0);
        const cargandoBloqueo = ref(false);
        const ventanaEliminarNecesidad = ref(false);
        const seleccionarPublico = ref(false);
        const ventanaEliminarPublico = ref(false);
        const publicoSeleccionado = ref({});

        const publicoDNC = computed(() => store.getters["ADMCapacitacion/getpublicoDNC"]);

        const TB_Publico_DNC = computed(() =>
            store.getters["reporteador/getTablaPorNombre"]("TB_Publico_DNC")
        );

        const TB_Oficinas_DNC = computed(() =>
            store.getters["reporteador/getTablaPorNombre"]("TB_Oficinas_DNC")
        );

        const TB_Areas_DNC = computed(() =>
            store.getters["reporteador/getTablaPorNombre"]("TB_Areas_DNC")
        );

        const TB_Departamentos_DNC = computed(() =>
            store.getters["reporteador/getTablaPorNombre"]("TB_Departamentos_DNC")
        );

        const TB_Puestos_DNC = computed(() =>
            store.getters["reporteador/getTablaPorNombre"]("TB_Puestos_DNC")
        );

        const TB_Usuarios_DNC = computed(() =>
            store.getters["reporteador/getTablaPorNombre"]("TB_Usuarios_DNC")
        );

        onMounted(async () => {
            await store.dispatch("ADMCapacitacion/getPublico", {
                id_necesidad_fk: idNecesidadDetectada.value,
                token: store.state.user.token,
            });
        });

        const actualizarNecesidad = async () => {
            cargandoBloqueo.value = true;
            let necesidadActualizada = {
                id_necesidad: idNecesidadDetectada.value,
                necesidad: necesidadDetectada.value,
                indicador: indicadores.value,
                solucion: solucion.value,
                habilidades: habilidades.value,
                id_dnc_fk: idDnc.value
            };
            await store.dispatch("ADMCapacitacion/actualizarNecesidad", {
                necesidadActualizada: necesidadActualizada,
                token: store.state.user.token,
            });
            cargandoBloqueo.value = false;
            emit('actualizar-necesidad');
        };

        const eliminarNecesidad = async () => {
            ventanaEliminarNecesidad.value = false;
            cargandoBloqueo.value = true;
            let necesidadEliminada = {
                id_necesidad: idNecesidadDetectada.value,
                id_dnc_fk: idDnc.value
            };
            await store.dispatch("ADMCapacitacion/eliminarNecesidad", {
                necesidadEliminada: necesidadEliminada,
                token: store.state.user.token,
            });
            cargandoBloqueo.value = false;
            emit('eliminar-necesidad', idNecesidadDetectada.value);
        };

        watch(seleccionarPublico, (newValue) => {
            if (newValue) {
                let jsonTabla = JSON.parse(TB_Publico_DNC.value.json_tabla);
                jsonTabla.data = [idNecesidadDetectada.value];
                TB_Publico_DNC.value.json_tabla = JSON.stringify(jsonTabla);
                let jsonTablaOficinas = JSON.parse(TB_Oficinas_DNC.value.json_tabla);
                jsonTablaOficinas.data = [idNecesidadDetectada.value];
                TB_Oficinas_DNC.value.json_tabla = JSON.stringify(jsonTablaOficinas);
                let jsonTablaAreas = JSON.parse(TB_Areas_DNC.value.json_tabla);
                jsonTablaAreas.data = [idNecesidadDetectada.value];
                TB_Areas_DNC.value.json_tabla = JSON.stringify(jsonTablaAreas);
                let jsonTablaDepartamentos = JSON.parse(
                    TB_Departamentos_DNC.value.json_tabla
                );
                jsonTablaDepartamentos.data = [idNecesidadDetectada.value];
                TB_Departamentos_DNC.value.json_tabla = JSON.stringify(
                    jsonTablaDepartamentos
                );
                let jsonTablaPuestos = JSON.parse(TB_Puestos_DNC.value.json_tabla);
                jsonTablaPuestos.data = [idNecesidadDetectada.value];
                TB_Puestos_DNC.value.json_tabla = JSON.stringify(jsonTablaPuestos);
                let jsonTablaUsuarios = JSON.parse(TB_Usuarios_DNC.value.json_tabla);
                jsonTablaUsuarios.data = [idNecesidadDetectada.value];
                TB_Usuarios_DNC.value.json_tabla = JSON.stringify(jsonTablaUsuarios);
            }
        });

        const abrirVentanaEliminarPublico = (p) => {
            publicoSeleccionado.value = p;
            ventanaEliminarPublico.value = true;
        };

        const eliminarDirigidoADNC = async () => {
            await store.dispatch("ADMCapacitacion/deleteDirigidoADNC", {
                id_dirigido: publicoSeleccionado.value.id_dirigido,
                id_necesidad_fk: idNecesidadDetectada.value,
                token: store.state.user.token,
            });
        };

        return {
            idNecesidadDetectada,
            necesidadDetectada,
            indicadores,
            solucion,
            habilidades,
            actualizarNecesidad,
            cargandoBloqueo,
            eliminarNecesidad,
            ventanaEliminarNecesidad,
            seleccionarPublico,
            publicoDNC,
            abrirVentanaEliminarPublico,
            ventanaEliminarPublico,
            eliminarDirigidoADNC,
            publicoSeleccionado,
        }
    }
});
</script>

<style scoped>
.label-container {
    background-color: var(--blueBerry);
    padding: 10px;
    border-radius: 5px;
    text-align: center;
}

.label-title {
    font-weight: bold;
    margin: 0;
    font-size: 14px;
    color: var(--black);
}

.label-description {
    font-size: 13px;
    margin: 0;
    color: var(--bs-gray);
}

.input-formulario {
    border-color: var(--blueBerry);
}

hr {
    height: 2px;
    background-color: black;
    margin-bottom: 0;
}

.custom-container {
  background-color: var(--blueBerryPastel);
  /* Color de fondo */
  border-radius: 20px;
  padding: 3px 15px !important;
  box-shadow: rgba(50, 50, 93, 0.25) 0px 6px 12px -2px,
    rgba(0, 0, 0, 0.3) 0px 3px 7px -3px;
  width: fit-content;
  margin: 5px;
  font-size: 13px;
  border: none;
  outline: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  color: var(--card-title-color);
}
</style>