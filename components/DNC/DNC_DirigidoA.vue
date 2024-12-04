<template>
    <NavBar>
        <template #elementos_opcionales>
            <div class="d-flex justify-content-between align-items-center">
                <IconBoton width_icon="13px" iconName="box_arrow_in_down.svg" @click="modalOficinas = true">Oficinas
                </IconBoton>
                <IconBoton width_icon="13px" iconName="box_arrow_in_down.svg" @click="modalAreas = true">Areas
                </IconBoton>
                <IconBoton width_icon="13px" iconName="box_arrow_in_down.svg" @click="modalDepartamentos = true">
                    Departamentos
                </IconBoton>
                <IconBoton width_icon="13px" iconName="box_arrow_in_down.svg" @click="modalPuestos = true">Puestos
                </IconBoton>
                <IconBoton width_icon="13px" iconName="box_arrow_in_down.svg" @click="modalUsuarios = true">Usuarios
                </IconBoton>
            </div>
        </template>
    </NavBar>
    <div class="p-3">
        <TablaDinamica :consultar_registros="TB_Publico_DNC_filtrar" :tablaBase="TB_Publico_DNC"
            tabla_nombre="TB_Publico_DNC" @finalizarRenderBody="onFinalizarRenderBodyPublicoDNC">
        </TablaDinamica>

        <template v-if="teleportPublicoDNC">
            <div>
                <template v-for="(registro, index) in TB_Publico_DNC.registros" :key="'dropdown-' + registro.id">
                    <teleport :to="`#TB_Publico_DNC table tr:nth-child(${index + 1
                        }) td:last-child div`">
                        <IconBoton width_icon="13px" iconName="TRASH.svg" @click="abrirVentanaEliminarPublico(registro)">
                            Eliminar
                        </IconBoton>
                    </teleport>
                </template>
            </div>
        </template>
    </div>
    <PopupSolid :visible="modalOficinas" :size="'medium'" @update:visible="modalOficinas = $event" :titulo="'Oficinas'">
        <TablaDinamica :consultar_registros="TB_Oficinas_DNC_Filtrar" :tablaBase="TB_Oficinas_DNC"
            :tabla_nombre="'TB_Oficinas_DNC'" :breakpoint="'md'"
            @finalizarRenderBody="onFinalizarRenderBody_TB_Oficinas_DNC" />
        <template v-if="teleportOficinasDNC">
            <div>
                <template v-for="(registro, index) in TB_Oficinas_DNC.registros" :key="'dropdown-' + registro.id">
                    <teleport :to="`#TB_Oficinas_DNC table tr:nth-child(${index + 1
                        }) td:nth-child(1) div`">
                        <div class="registro-seleccionado" @click="seleccionarOficina(registro)">
                            {{ registro.ignorar_clave }}
                        </div>
                    </teleport>
                    <teleport :to="`#TB_Oficinas_DNC table tr:nth-child(${index + 1
                        }) td:last-child div`">
                        <div class="registro-seleccionado" @click="seleccionarOficina(registro)">
                            {{ registro.ignorar_nombre_oficina }}
                        </div>
                    </teleport>
                </template>
            </div>
        </template>
    </PopupSolid>
    <PopupSolid :visible="modalAreas" :size="'medium'" @update:visible="modalAreas = $event" :titulo="'Areas'">
        <TablaDinamica :consultar_registros="TB_Areas_DNC_Filtrar" :tablaBase="TB_Areas_DNC"
            :tabla_nombre="'TB_Areas_DNC'" :breakpoint="'md'"
            @finalizarRenderBody="onFinalizarRenderBody_TB_Areas_DNC" />
        <template v-if="teleportAreasDNC">
            <div>
                <template v-for="(registro, index) in TB_Areas_DNC.registros" :key="'dropdown-' + registro.id">
                    <teleport :to="`#TB_Areas_DNC table tr:nth-child(${index + 1
                        }) td:nth-child(1) div`">
                        <div class="registro-seleccionado" @click="seleccionarArea(registro)">
                            {{ registro.ignorar_clave_empresa_area }}
                        </div>
                    </teleport>
                    <teleport :to="`#TB_Areas_DNC table tr:nth-child(${index + 1}) td:last-child div`">
                        <div class="registro-seleccionado" @click="seleccionarArea(registro)">
                            {{ registro.ignorar_nombre_area }}
                        </div>
                    </teleport>
                </template>
            </div>
        </template>
    </PopupSolid>
    <PopupSolid :visible="modalDepartamentos" :size="'medium'" @update:visible="modalDepartamentos = $event"
        :titulo="'Departamentos'">
        <TablaDinamica :consultar_registros="TB_Departamentos_DNC_Filtrar" :tablaBase="TB_Departamentos_DNC"
            :tabla_nombre="'TB_Departamentos_DNC'" :breakpoint="'md'"
            @finalizarRenderBody="onFinalizarRenderBody_TB_Departamentos_DNC" />
        <template v-if="teleportDepartamentosDNC">
            <div>
                <template v-for="(registro, index) in TB_Departamentos_DNC.registros" :key="'dropdown-' + registro.id">
                    <teleport :to="`#TB_Departamentos_DNC table tr:nth-child(${index + 1
                        }) td:nth-child(1) div`">
                        <div class="registro-seleccionado" @click="seleccionarDepartamento(registro)">
                            {{ registro.ignorar_clave_empresa_departamento }}
                        </div>
                    </teleport>
                    <teleport :to="`#TB_Departamentos_DNC table tr:nth-child(${index + 1
                        }) td:nth-child(2) div`">
                        <div class="registro-seleccionado" @click="seleccionarDepartamento(registro)">
                            {{ registro.ignorar_nombre_departamento }}
                        </div>
                    </teleport>
                    <teleport :to="`#TB_Departamentos_DNC table tr:nth-child(${index + 1
                        }) td:last-child div`">
                        <div class="registro-seleccionado" @click="seleccionarDepartamento(registro)">
                            {{ registro.ignorar_nombre_area }}
                        </div>
                    </teleport>
                </template>
            </div>
        </template>
    </PopupSolid>
    <PopupSolid :visible="modalPuestos" :size="'medium'" @update:visible="modalPuestos = $event" :titulo="'Puestos'">
        <TablaDinamica :consultar_registros="TB_Puestos_DNC_Filtrar" :tablaBase="TB_Puestos_DNC"
            :tabla_nombre="'TB_Puestos_DNC'" :breakpoint="'md'"
            @finalizarRenderBody="onFinalizarRenderBody_TB_Puestos_DNC" />
        <template v-if="teleportPuestosDNC">
            <div>
                <template v-for="(registro, index) in TB_Puestos_DNC.registros" :key="'dropdown-' + registro.id">
                    <teleport :to="`#TB_Puestos_DNC table tr:nth-child(${index + 1
                        }) td:nth-child(1) div`">
                        <div class="registro-seleccionado" @click="seleccionarPuesto(registro)">
                            {{ registro.ignorar_clave_empresa_puesto }}
                        </div>
                    </teleport>
                    <teleport :to="`#TB_Puestos_DNC table tr:nth-child(${index + 1
                        }) td:nth-child(2) div`">
                        <div class="registro-seleccionado" @click="seleccionarPuesto(registro)">
                            {{ registro.ignorar_nombre_puesto }}
                        </div>
                    </teleport>
                    <teleport :to="`#TB_Puestos_DNC table tr:nth-child(${index + 1
                        }) td:last-child div`">
                        <div class="registro-seleccionado" @click="seleccionarPuesto(registro)">
                            {{ registro.ignorar_nombre_area }}
                        </div>
                    </teleport>
                </template>
            </div>
        </template>
    </PopupSolid>
    <PopupSolid :visible="modalUsuarios" :size="'medium'" @update:visible="modalUsuarios = $event" :titulo="'Usuarios'">
        <TablaDinamica :consultar_registros="TB_Usuarios_DNC_Filtrar" :tablaBase="TB_Usuarios_DNC"
            :tabla_nombre="'TB_Usuarios_DNC'" :breakpoint="'md'"
            @finalizarRenderBody="onFinalizarRenderBody_TB_Usuarios_DNC" />
        <template v-if="teleportUsuariosDNC">
            <div>
                <template v-for="(registro, index) in TB_Usuarios_DNC.registros" :key="'dropdown-' + registro.id">
                    <teleport :to="`#TB_Usuarios_DNC table tr:nth-child(${index + 1
                        }) td:nth-child(1) div`">
                        <div class="registro-seleccionado" @click="seleccionarUsuario(registro)">
                            {{ registro.ignorar_no_empleado }}
                        </div>
                    </teleport>
                    <teleport :to="`#TB_Usuarios_DNC table tr:nth-child(${index + 1
                        }) td:nth-child(2) div`">
                        <div class="registro-seleccionado" @click="seleccionarUsuario(registro)">
                            {{ registro.ignorar_nombre_usuario }}
                        </div>
                    </teleport>
                    <teleport :to="`#TB_Usuarios_DNC table tr:nth-child(${index + 1
                        }) td:nth-child(3) div`">
                        <div class="registro-seleccionado" @click="seleccionarUsuario(registro)">
                            {{ registro.ignorar_apellido_paterno }}
                        </div>
                    </teleport>
                    <teleport :to="`#TB_Usuarios_DNC table tr:nth-child(${index + 1
                        }) td:nth-child(4) div`">
                        <div class="registro-seleccionado" @click="seleccionarUsuario(registro)">
                            {{ registro.ignorar_apellido_materno }}
                        </div>
                    </teleport>
                    <teleport :to="`#TB_Usuarios_DNC table tr:nth-child(${index + 1
                        }) td:nth-child(5) div`">
                        <div class="registro-seleccionado" @click="seleccionarUsuario(registro)">
                            {{ registro.ignorar_name }}
                        </div>
                    </teleport>
                </template>
            </div>
        </template>
    </PopupSolid>
    <PopupSolid :visible="ventanaEliminarPublico" size="small" @update:visible="ventanaEliminarPublico = $event"
        :confirm="true" :confirmFunction="eliminarDirigidoADNC" titulo="Confirmar eliminar">
        ¿Estas seguro de eliminar el público tipo "{{ publicoSeleccionado.tipo }}" y nombre "{{ publicoSeleccionado.nombre }}"?
    </PopupSolid>
</template>

<script>
import { computed, defineComponent, nextTick, ref, watch } from "vue";
import NavBar from "@/components/NavBar/NavBarPaginasUCT.vue";
import IconBoton from "@/components/ButtonWithIcon/ButtonPrimary.vue";
import TablaDinamica from "@/components/TablaDinamica/TablaDinamica.vue";
import PopupSolid from "@/components/Modal/ModalSolid.vue";
import { useStore } from "vuex";

export default defineComponent({
    props: {
        necesidad: {
            type: Object,
            required: true,
        },
    },
    components: {
        NavBar,
        IconBoton,
        TablaDinamica,
        PopupSolid,
    },
    setup(props) {
        const store = useStore();
        const TB_Publico_DNC_filtrar = ref(true);
        const teleportPublicoDNC = ref(false);
        const modalOficinas = ref(false);
        const TB_Oficinas_DNC_Filtrar = ref(true);
        const teleportOficinasDNC = ref(false);
        const idOficina = ref(0);
        const modalAreas = ref(false);
        const TB_Areas_DNC_Filtrar = ref(true);
        const teleportAreasDNC = ref(false);
        const idAreaPublico = ref(0);
        const modalDepartamentos = ref(false);
        const TB_Departamentos_DNC_Filtrar = ref(true);
        const teleportDepartamentosDNC = ref(false);
        const idDepartamento = ref(0);
        const modalPuestos = ref(false);
        const TB_Puestos_DNC_Filtrar = ref(true);
        const teleportPuestosDNC = ref(false);
        const idPuesto = ref(0);
        const modalUsuarios = ref(false);
        const TB_Usuarios_DNC_Filtrar = ref(true);
        const teleportUsuariosDNC = ref(false);
        const idUsuario = ref(0);
        const publicoSeleccionado = ref({});
        const ventanaEliminarPublico = ref(false);

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

        console.log(props.necesidad);

        const onFinalizarRenderBodyPublicoDNC = () => {
            teleportPublicoDNC.value = false;
            nextTick(() => {
                if (document.getElementById("TB_Publico_DNC")) {
                    teleportPublicoDNC.value = true;
                }
            });
            TB_Publico_DNC_filtrar.value = false;
        };

        watch(modalOficinas, (newValue) => {
            if (!newValue) {
                teleportOficinasDNC.value = false;
                TB_Oficinas_DNC_Filtrar.value = true;
                let jsonTabla = JSON.parse(TB_Oficinas_DNC.value.json_tabla);
                let columnaClaveEmpresa = jsonTabla.columnas.find(
                    (columna) => columna.titulo === "Clave empresa"
                );
                columnaClaveEmpresa.valor = "";
                let columnaNombre = jsonTabla.columnas.find(
                    (columna) => columna.titulo === "Nombre"
                );
                columnaNombre.valor = "";
                jsonTabla.paginaActual = 1;
                jsonTabla.inicio = 0;
                TB_Oficinas_DNC.value.json_tabla = JSON.stringify(jsonTabla);
            }
        });

        const onFinalizarRenderBody_TB_Oficinas_DNC = () => {
            teleportOficinasDNC.value = false;
            nextTick(() => {
                if (document.getElementById("TB_Oficinas_DNC")) {
                    teleportOficinasDNC.value = true;
                }
            });
            TB_Oficinas_DNC_Filtrar.value = false;
        };

        const seleccionarOficina = async (registro) => {
            idOficina.value = registro.ignorar_id_oficina;
            const DNCPublico = {
                id_necesidad_fk: props.necesidad.id_necesidad,
                id_oficina_fk: idOficina.value,
            };
            await store.dispatch("ADMCapacitacion/addDirigidoADNC", {
                dirigidoA: DNCPublico,
                token: store.state.user.token,
            });
            modalOficinas.value = false;
            TB_Publico_DNC_filtrar.value = true;
        };

        watch(modalAreas, (newValue) => {
            if (!newValue) {
                teleportAreasDNC.value = false;
                TB_Areas_DNC_Filtrar.value = true;
                let jsonTabla = JSON.parse(TB_Areas_DNC.value.json_tabla);
                let columnaClaveEmpresa = jsonTabla.columnas.find(
                    (columna) => columna.titulo === "Clave empresa"
                );
                columnaClaveEmpresa.valor = "";
                let columnaNombre = jsonTabla.columnas.find(
                    (columna) => columna.titulo === "Nombre"
                );
                columnaNombre.valor = "";
                jsonTabla.paginaActual = 1;
                jsonTabla.inicio = 0;
                TB_Areas_DNC.value.json_tabla = JSON.stringify(jsonTabla);
            }
        });

        const onFinalizarRenderBody_TB_Areas_DNC = () => {
            teleportAreasDNC.value = false;
            nextTick(() => {
                if (document.getElementById("TB_Areas_DNC")) {
                    teleportAreasDNC.value = true;
                }
            });
            TB_Areas_DNC_Filtrar.value = false;
        };

        const seleccionarArea = async (registro) => {
            idAreaPublico.value = registro.ignorar_id_area;
            const DNCPublico = {
                id_necesidad_fk: props.necesidad.id_necesidad,
                id_area_fk: idAreaPublico.value,
            };
            await store.dispatch("ADMCapacitacion/addDirigidoADNC", {
                dirigidoA: DNCPublico,
                token: store.state.user.token,
            });
            modalAreas.value = false;
            TB_Publico_DNC_filtrar.value = true;
        };

        watch(modalDepartamentos, (newValue) => {
            if (!newValue) {
                teleportDepartamentosDNC.value = false;
                TB_Departamentos_DNC_Filtrar.value = true;
                let jsonTabla = JSON.parse(TB_Departamentos_DNC.value.json_tabla);
                let columnaClaveEmpresa = jsonTabla.columnas.find(
                    (columna) => columna.titulo === "Clave empresa"
                );
                columnaClaveEmpresa.valor = "";
                let columnaNombre = jsonTabla.columnas.find(
                    (columna) => columna.titulo === "Nombre"
                );
                columnaNombre.valor = "";
                jsonTabla.paginaActual = 1;
                jsonTabla.inicio = 0;
                TB_Departamentos_DNC.value.json_tabla = JSON.stringify(jsonTabla);
            }
        });

        const onFinalizarRenderBody_TB_Departamentos_DNC = () => {
            teleportDepartamentosDNC.value = false;
            nextTick(() => {
                if (document.getElementById("TB_Departamentos_DNC")) {
                    teleportDepartamentosDNC.value = true;
                }
            });
            TB_Departamentos_DNC_Filtrar.value = false;
        };

        const seleccionarDepartamento = async (registro) => {
            idDepartamento.value = registro.ignorar_id_departamento;
            const DNCPublico = {
                id_necesidad_fk: props.necesidad.id_necesidad,
                id_departamento_fk: idDepartamento.value,
            };
            await store.dispatch("ADMCapacitacion/addDirigidoADNC", {
                dirigidoA: DNCPublico,
                token: store.state.user.token,
            });
            modalDepartamentos.value = false;
            TB_Publico_DNC_filtrar.value = true;
        };

        watch(modalPuestos, (newValue) => {
            if (!newValue) {
                teleportPuestosDNC.value = false;
                TB_Puestos_DNC_Filtrar.value = true;
                let jsonTabla = JSON.parse(TB_Puestos_DNC.value.json_tabla);
                let columnaClaveEmpresa = jsonTabla.columnas.find(
                    (columna) => columna.titulo === "Clave empresa"
                );
                columnaClaveEmpresa.valor = "";
                let columnaNombre = jsonTabla.columnas.find(
                    (columna) => columna.titulo === "Nombre"
                );
                columnaNombre.valor = "";
                jsonTabla.paginaActual = 1;
                jsonTabla.inicio = 0;
                TB_Puestos_DNC.value.json_tabla = JSON.stringify(jsonTabla);
            }
        });

        const onFinalizarRenderBody_TB_Puestos_DNC = () => {
            teleportPuestosDNC.value = false;
            nextTick(() => {
                if (document.getElementById("TB_Puestos_DNC")) {
                    teleportPuestosDNC.value = true;
                }
            });
            TB_Puestos_DNC_Filtrar.value = false;
        };

        const seleccionarPuesto = async (registro) => {
            idPuesto.value = registro.ignorar_id_puesto;
            const DNCPublico = {
                id_necesidad_fk: props.necesidad.id_necesidad,
                id_puesto_fk: idPuesto.value,
            };
            await store.dispatch("ADMCapacitacion/addDirigidoADNC", {
                dirigidoA: DNCPublico,
                token: store.state.user.token,
            });
            modalPuestos.value = false;
            TB_Publico_DNC_filtrar.value = true;
        };

        watch(modalUsuarios, (newValue) => {
            if (!newValue) {
                teleportUsuariosDNC.value = false;
                TB_Usuarios_DNC_Filtrar.value = true;
                let jsonTabla = JSON.parse(TB_Usuarios_DNC.value.json_tabla);
                let columnaNo = jsonTabla.columnas.find(
                    (columna) => columna.titulo === "No"
                );
                columnaNo.valor = "";
                let columnaUsuario = jsonTabla.columnas.find(
                    (columna) => columna.titulo === "Usuario"
                );
                columnaUsuario.valor = "";
                let columnaAPaterno = jsonTabla.columnas.find(
                    (columna) => columna.titulo === "A paterno"
                );
                columnaAPaterno.valor = "";
                let columnaAMaterno = jsonTabla.columnas.find(
                    (columna) => columna.titulo === "A materno"
                );
                columnaAMaterno.valor = "";
                let columnaNombres = jsonTabla.columnas.find(
                    (columna) => columna.titulo === "Nombres"
                );
                columnaNombres.valor = "";
                jsonTabla.paginaActual = 1;
                jsonTabla.inicio = 0;
                TB_Usuarios_DNC.value.json_tabla = JSON.stringify(jsonTabla);
            }
        });

        const onFinalizarRenderBody_TB_Usuarios_DNC = () => {
            teleportUsuariosDNC.value = false;
            nextTick(() => {
                if (document.getElementById("TB_Usuarios_DNC")) {
                    teleportUsuariosDNC.value = true;
                }
            });
            TB_Usuarios_DNC_Filtrar.value = false;
        };

        const seleccionarUsuario = async (registro) => {
            idUsuario.value = registro.ignorar_id_usuario;
            const DNCPublico = {
                id_necesidad_fk: props.necesidad.id_necesidad,
                id_usuario_fk: idUsuario.value,
            };
            await store.dispatch("ADMCapacitacion/addDirigidoADNC", {
                dirigidoA: DNCPublico,
                token: store.state.user.token,
            });
            modalUsuarios.value = false;
            TB_Publico_DNC_filtrar.value = true;
        };

        const eliminarDirigidoADNC = async () => {
            await store.dispatch("ADMCapacitacion/deleteDirigidoADNC", {
                id_dirigido: publicoSeleccionado.value.ignorar_id_dirigido,
                id_necesidad_fk: props.necesidad.id_necesidad,
                token: store.state.user.token,
            });
            TB_Publico_DNC_filtrar.value = true;
        };

        const abrirVentanaEliminarPublico = (registro) => {
            publicoSeleccionado.value = registro;
            ventanaEliminarPublico.value = true;
        }

        return {
            TB_Publico_DNC,
            TB_Publico_DNC_filtrar,
            teleportPublicoDNC,
            onFinalizarRenderBodyPublicoDNC,
            eliminarDirigidoADNC,
            modalOficinas,
            TB_Oficinas_DNC,
            TB_Oficinas_DNC_Filtrar,
            onFinalizarRenderBody_TB_Oficinas_DNC,
            teleportOficinasDNC,
            seleccionarOficina,
            idOficina,
            modalAreas,
            TB_Areas_DNC,
            TB_Areas_DNC_Filtrar,
            teleportAreasDNC,
            onFinalizarRenderBody_TB_Areas_DNC,
            seleccionarArea,
            idAreaPublico,
            modalDepartamentos,
            TB_Departamentos_DNC,
            TB_Departamentos_DNC_Filtrar,
            teleportDepartamentosDNC,
            onFinalizarRenderBody_TB_Departamentos_DNC,
            seleccionarDepartamento,
            idDepartamento,
            modalPuestos,
            TB_Puestos_DNC,
            TB_Puestos_DNC_Filtrar,
            teleportPuestosDNC,
            onFinalizarRenderBody_TB_Puestos_DNC,
            seleccionarPuesto,
            idPuesto,
            modalUsuarios,
            TB_Usuarios_DNC,
            TB_Usuarios_DNC_Filtrar,
            teleportUsuariosDNC,
            onFinalizarRenderBody_TB_Usuarios_DNC,
            seleccionarUsuario,
            idUsuario,
            publicoSeleccionado,
            abrirVentanaEliminarPublico,
            ventanaEliminarPublico,
        };
    },
});
</script>

<style scoped>
.registro-seleccionado {
    cursor: pointer;
    width: 100%;
}
</style>