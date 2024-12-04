<template>
    <div :class="ClasesTablaDinamica" :id="tabla_nombre">
        <div class="TablaDinamicabtn-filtrar">
            <BotonIconoPrimary width_icon="13px" iconName="FILTRAR.svg" @click="mostrarFiltros = !mostrarFiltros">Filtros</BotonIconoPrimary>
        </div>

        <DynamicSvgLoader class="TablaDinamica_iconEditor" title="vista edicion" @click="turnOnEditable" fileName="icons/UCT_ADMIN/COMPETENCIAS-13" width_icon="20px" :icon_active="true"></DynamicSvgLoader>

        <table class="table table-light" v-if="json">
            <TablaHead :json="json" @orderChanged="handleOrderChange" :class="{ 'showHead': mostrarFiltros, 'hideHead': !mostrarFiltros }"></TablaHead>
            <FilasCargando v-if="cargando" :columnas="json.filas.length"></FilasCargando>
            <tbody v-else>
                <tr v-for="usuario in usuarios" :key="usuario.id_usuario">
                    <td>{{ usuario.nombre }}</td>
                    <td>{{ usuario.no_empleado }}</td>
                    <td>
                        <button @click="descargarRespuestas(usuario.id_usuario)" type="button" class="btn btn-primary mb-3">Descargar Respuestas</button>
                    </td>
                </tr>
            </tbody>
        </table>

        <TablaFooter :json="json" @cambiarPagina="CambiarPagina"></TablaFooter>

        <!-- Modals -->
        <!-- PopUpSolido and FormD_CapaTablaDinamica modals here -->
    </div>
</template>

<script>
import { defineComponent, ref, onMounted, computed } from 'vue';
import TablaHead from '@/components/TablaDinamica/TablaHead.vue';
import TablaFooter from '@/components/TablaDinamica/TablaFooter.vue';
import FilasCargando from '../FilasLoader.vue';
import DynamicSvgLoader from '@/components/LoaderSVG/LoaderSVG.vue';
import BotonIconoPrimary from '@/components/ButtonWithIcon/ButtonPrimary.vue';
import { useStore } from 'vuex';
import axios from '@/../axios-config.js';

export default defineComponent({
    name: 'TablaDinamicaLocal',
    components: {
        TablaHead, TablaFooter, FilasCargando, DynamicSvgLoader, BotonIconoPrimary
    },
    props: {
        tabla_nombre: String,
        tablaBase: Object
    },
    setup(props) {
        const visibleFormCRUD = ref(false);
        const visible_editor_tabla = ref(false);
        const store = useStore();
        const json = ref(JSON.parse(props.tablaBase.json_tabla));
        const usuarios = ref([]);
        const cargando = ref(true);
        const mostrarFiltros = ref(false);

        const getCredenciales = () => {
            const token = store.state.user.token;
            return {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            };
        };

        const loadAnswer = async () => {
            if (props.tablaBase.id_formulario > 0) {
                const headers = getCredenciales();
                try {
                    const response = await axios.post('/FormularioDinamico/loadAnswer', { id_formulario: props.tablaBase.id_formulario }, headers);
                    usuarios.value = response.data.Usuarios.users;
                } catch (error) {
                    console.error("Error al cargar el formulario:", error);
                }
            }
        };

        onMounted(async () => {
            await loadAnswer();
        });

        const descargarRespuestas = async (idUsuario) => {
            if (props.tablaBase.id_formulario > 0) {
                const headers = getCredenciales();
                try {
                    const response = await axios.post('/FormularioDinamico/descargarRespuestas', {
                        id_formulario: props.tablaBase.id_formulario,
                        iduser: idUsuario
                    }, { ...headers, responseType: 'blob' });

                    const url = window.URL.createObjectURL(new Blob([response.data]));
                    const link = document.createElement('a');
                    link.href = url;
                    link.setAttribute('download', 'respuestas_usuario.xlsx');
                    document.body.appendChild(link);
                    link.click();
                    link.remove();
                } catch (error) {
                    console.error("Error al descargar las respuestas:", error);
                }
            }
        };

        const turnOnEditable = () => {
            visible_editor_tabla.value = true;
        };

        const handleOrderChange = (index) => {
            // Handle order change
        };

        const CambiarPagina = (pagina) => {
            // Handle page change
        };

        return {
            json,
            usuarios,
            cargando,
            mostrarFiltros,
            descargarRespuestas,
            turnOnEditable,
            handleOrderChange,
            CambiarPagina
        };
    }
});
</script>
