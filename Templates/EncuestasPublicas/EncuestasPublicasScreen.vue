<template>
    <div class="col-12 fondo" :class="{'modo-edicion': isEditMode}">
        <div class="row d-flex justify-content-center align-items-center pb-5" :class="isEditMode ? 'h-100' : 'vh-100'">
            <div class="col-11 col-sm-10 col-md-8 col-lg-7">
                <LoadingScreen :visible="loadingConfig" />
                
                <div v-if="showCard" class="mb-2 mt-2">
                    <div v-if="localshowYowi" class="row justify-content-center mb-0">
                        <div class="col-6 col-sm-4 col-md-3 text-center">
                            <img :src="yowi_image" alt="Yowi" class="img-fluid w-100" style="vertical-align: bottom;">
                        </div>
                    </div>
                    <div class="card shadow-lg border-0 rounded-4 EncuestasPublicas-cardmsg overflow-hidden position-relative">
                        <!-- Componente de Encabezado -->
                        <EncuestaEncabezado 
                            v-if="localShowHeader"
                            :isEditMode="isEditMode"
                            :configData="localConfig"
                            :previews="imagePreviews"
                            :headerMode="localHeaderMode"
                            @image-selected="uploadHeaderImage"
                        />

                        <div class="card-body p-5">
                            <!-- Componente de Bienvenida y Mensajes -->
                            <EncuestaBienvenida 
                                :isEditMode="isEditMode"
                                :configData="localConfig"
                                :animatedText="animatedState"
                                :mensajeEstado="mensajeEstado"
                                :iconTag="iconTag"
                                @update:configData="updateConfigData"
                            />

                            <!-- Botón condicional: Deshabilitado en modo edición -->
                            <div v-if="MostrarBotonInicio || isEditMode" class="text-center mt-4">
                                <button 
                                    @click="!isEditMode && mostrarFormularioAddUsuario()" 
                                    :disabled="isEditMode"
                                    class="btn btn-comenzar-evaluacion"
                                >
                                    Comenzar evaluación
                                </button>
                                <!-- Powered: Se muestra aquí para fluir debajo del botón en móvil -->
                                <img :src="poweredYowi_image" class="EncuestasPublicas-powered" alt="Powered by Yowi">
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        
        <!-- Panel de Ajustes Flotante -->
        <PanelFlotante 
            v-if="isEditMode" 
            titulo="Configuración de diseño" 
        >
            <template #extra>
                <BotonCircular 
                    iconName="icons/save.svg"
                    title="Guardar diseño"
                    width_icon="18px"
                    @clickPrimary="guardarPlantilla"
                />
            </template>

            <div class="d-flex flex-column gap-2">
                <!-- Toggle Yowi -->
                <div class="form-check form-switch d-inline-flex align-items-center">
                    <input 
                        class="form-check-input" 
                        type="checkbox" 
                        id="toggleYowi"
                        :checked="localshowYowi"
                        @change="handleYowiToggle"
                    >
                    <label class="form-check-label text-white small my-0 p-1" for="toggleYowi">
                        Mostrar Yowi
                    </label>
                </div>
                
                <hr class="panel-divider my-1">

                <!-- Toggle Mostrar Encabezado -->
                <div class="form-check form-switch d-inline-flex align-items-center">
                    <input 
                        class="form-check-input" 
                        type="checkbox" 
                        id="toggleHeader"
                        :checked="localShowHeader"
                        @change="handleHeaderToggle"
                    >
                    <label class="form-check-label text-white small my-0 p-1" for="toggleHeader">
                        Mostrar Encabezado
                    </label>
                </div>

                <!-- Toggle Modo Header (Dependiente) -->
                <div class="form-check form-switch d-inline-flex align-items-center" :class="{'opacity-50': !localShowHeader}">
                    <input 
                        class="form-check-input" 
                        type="checkbox" 
                        id="toggleHeaderMode"
                        :disabled="!localShowHeader"
                        :checked="localHeaderMode === 'full'"
                        @change="handleHeaderModeToggle"
                    >
                    <label 
                        class="form-check-label text-white small my-0 p-1" 
                        for="toggleHeaderMode"
                        :style="{ cursor: localShowHeader ? 'pointer' : 'not-allowed' }"
                    >
                        {{ localHeaderMode === 'full' ? 'Separar encabezado' : 'Unificar encabezado' }}
                    </label>
                </div>
            </div>
        </PanelFlotante>
    </div>

    <PopUpSolido 
        :visible="verEncuesta" 
        @update:visible="verEncuesta = $event" 
        size="fulls"
        :titulo="'Evaluación'"
    >
        <slot 
            :id_form="id_form" 
            :id_user="id_user" 
            :token="tok" 
            :cerrar="CerrarEncuesta"
        />
    </PopUpSolido>
</template>

<script>
import { defineComponent, ref, watch, onMounted, computed } from 'vue';
import { useRoute } from 'vue-router';
import yowi_image from '@/assets/images/yowis/yowi_arriba.png'
import poweredYowi_image from '@/assets/images/yowis/powered.png'
import { useStore } from 'vuex';
import PopUpSolido from '@/components/Modal/ModalSolid.vue';
import PanelFlotante from '@/components/FloatingPanels/PanelFlotante.vue';
import BotonCircular from '@/components/Buttons/BotonCircular.vue';
import EncuestaEncabezado from '@/components/Templates/EncuestasPublicas/EncuestaEncabezado.vue';
import EncuestaBienvenida from '@/components/Templates/EncuestasPublicas/EncuestaBienvenida.vue';
import LoadingScreen from '@/components/Loading/LoadingScreen.vue';

export default defineComponent({
    name: 'EncuestasPublicacionesUCT',
    components: {
        PopUpSolido,
        PanelFlotante,
        BotonCircular,
        EncuestaEncabezado,
        EncuestaBienvenida,
        LoadingScreen
    },
    props: {
        isEditMode: { type: Boolean, default: false },
        tema: { type: String, default: 'TRESGUERRAS' },
        endpointVerificar: { type: String, default: '' },
        endpointValidarAcceso: { type: String, default: '/FormularioDinamico/validarAccesoEncuesta' },
        configData: { 
            type: Object, 
            default: () => ({ 
                welcome_title: '¡Bienvenido a tu evaluación!', 
                welcome_tag: 'Evaluación pública',
                welcome_body: 'A continuación, te pedimos responder las siguientes preguntas. Cuando estes listo para comenzar, presiona el botón:',
                header_img_left: '',
                header_img_right: '',
                header_img_full: '',
                header_mode: 'split',
                show_yowi: true,
                show_header: false
            }) 
        }
    },
    emits: ['save-template'],
    setup(props, { emit }) {
        const route = useRoute();
        const store = useStore();
        const showCard = ref(props.isEditMode); // Si es edición, mostrar de inmediato
        const loadingConfig = ref(!props.isEditMode); // Si no es edición, mostrar cargador inicial

        // Valores por defecto internos
        const initialDefaults = {
            welcome_title: '¡Bienvenido a tu evaluación!', 
            welcome_tag: 'Evaluación pública',
            welcome_body: 'A continuación, te pedimos responder las siguientes preguntas. Cuando estes listo para comenzar, presiona el botón:',
            header_img_left: '',
            header_img_right: '',
            header_img_full: '',
            header_mode: 'split',
            show_yowi: true,
            show_header: true
        };

        // Estado local completo (Copia de prop + valores por defecto)
        const localConfig = ref({
            ...initialDefaults,
            ...props.configData
        });

        const internalFiles = ref({}); // Almacén interno para archivos binarios
        const previewImgLeft = ref('');
        const previewImgRight = ref('');
        const previewImgFull = ref('');
        const localshowYowi = ref(localConfig.value.show_yowi ?? true);
        const localShowHeader = ref(localConfig.value.show_header ?? true);
        const localHeaderMode = ref(localConfig.value.header_mode || 'split');
        const iconTag = require('@/assets/images/icons/ENCUESTA.svg');
        const animatedTitle = ref('');
        const animatedTag = ref('');
        const animatedBody = ref('');
        const mensajeEstado = ref({ titulo: '', cuerpo: '' });
        const animatedEstadoTitulo = ref('');
        const animatedEstadoCuerpo = ref('');
        const velocidadAnimacion = ref(7);
        const MostrarBotonInicio = ref(false);
        const verEncuesta = ref(false);
        const id_form = ref('');
        const id_user = ref('');
        const tok = ref('');
        const t = route.query.c;

        store.dispatch('tema/actualizarTema', props.tema);
        const CerrarEncuesta = async () => { verEncuesta.value = false; }

        const animatedState = computed(() => ({
            title: animatedTitle.value,
            tag: animatedTag.value,
            body: animatedBody.value,
            estadoTitulo: animatedEstadoTitulo.value,
            estadoCuerpo: animatedEstadoCuerpo.value
        }));

        const imagePreviews = computed(() => ({
            header_img_left: previewImgLeft.value,
            header_img_right: previewImgRight.value,
            header_img_full: previewImgFull.value
        }));

        const animarCampo = (texto, targetRef) => {
            return new Promise((resolve) => {
                let i = 0;
                const id = setInterval(() => {
                    if (i < texto.length) {
                        targetRef.value += texto.charAt(i);
                        i++;
                    } else {
                        clearInterval(id);
                        resolve();
                    }
                }, velocidadAnimacion.value);
            });
        };

        const mostrarTexto = async () => {
            await animarCampo(localConfig.value.welcome_title, animatedTitle);
            await animarCampo(localConfig.value.welcome_tag, animatedTag);
            await animarCampo(localConfig.value.welcome_body, animatedBody);
            MostrarBotonInicio.value = true;
        };

        const guardarPlantilla = () => {
            emit('save-template', {
                config: localConfig.value,
                files: internalFiles.value
            });
        };

        const updateConfigData = (data) => {
            localConfig.value = { ...localConfig.value, ...data };
        };

        const uploadHeaderImage = ({ campo, file }) => {
            if (!file) return;
            const previewUrl = URL.createObjectURL(file);
            if (campo === 'header_img_left') previewImgLeft.value = previewUrl;
            else if (campo === 'header_img_right') previewImgRight.value = previewUrl;
            else if (campo === 'header_img_full') previewImgFull.value = previewUrl;
            
            // Sincronizar localmente
            localConfig.value[campo] = file.name;
            // Guardar binario internamente
            internalFiles.value[campo] = file;
        };

        const handleYowiToggle = (e) => {
            localshowYowi.value = e.target.checked;
            localConfig.value.show_yowi = e.target.checked;
        };

        const handleHeaderToggle = (e) => {
            localShowHeader.value = e.target.checked;
            localConfig.value.show_header = e.target.checked;
        };

        const handleHeaderModeToggle = (e) => {
            localHeaderMode.value = e.target.checked ? 'full' : 'split';
            localConfig.value.header_mode = localHeaderMode.value;
        };

        const mostrarFormularioAddUsuario = async() => {
            try {
                const respuesta = await store.dispatch('EncuestasPublicas/verificarEstado', {
                    url: props.endpointVerificar,
                    token: t
                });
                const conteo = respuesta.count.count;
                
                if (conteo === 0) {
                    tok.value = t;
                    verEncuesta.value = true;
                } else if (conteo === 1) {
                    mostrarMensajeEstado('Gracias por participar.', 'Ya contestaste esta evaluación. ¡Gracias!');
                } else if (conteo === 2) {
                    mostrarMensajeEstado('Acceso no válido', 'Esta evaluación ha sido reprogramada o reasignada.');
                }
            } catch (error) {
                console.error('Error al verificar encuesta:', error);
            }
        };

        onMounted(async () => {
            // Si estamos en modo público, validamos el acceso
            if (!props.isEditMode) {
                try {
                    const data = await store.dispatch('EncuestasPublicas/validarAcceso', {
                        url: props.endpointValidarAcceso,
                        token: t
                    });
                    
                    if (data.valido) {
                        // Aplicar configuración de template si existe en el token
                        if (data.template_config) {
                            localConfig.value = { ...localConfig.value, ...data.template_config };
                            // Sincronizar estados reactivos internos
                            localshowYowi.value = localConfig.value.show_yowi ?? true;
                            localShowHeader.value = localConfig.value.show_header ?? false;
                            localHeaderMode.value = localConfig.value.header_mode || '';
                        }

                        id_form.value = data.payload.id_encuesta_fk;
                        id_user.value = data.payload.id_usuario_evaluador;
                        mostrarTexto();
                    } else {
                        configurarMensajeError(data);
                    }
                } catch (error) {
                    mostrarMensajeEstado('Error de Acceso', 'No pudimos validar tu acceso.');
                } finally {
                    loadingConfig.value = false;
                    showCard.value = true;
                }
            } else {
                // En modo edición, simplemente aseguramos que el estado sea el correcto
                loadingConfig.value = false;
                showCard.value = true;
            }
        });

        const mostrarMensajeEstado = async (titulo, cuerpo) => {
            mensajeEstado.value = { titulo, cuerpo };
            animatedEstadoTitulo.value = '';
            animatedEstadoCuerpo.value = '';
            await animarCampo(titulo, animatedEstadoTitulo);
            await animarCampo(cuerpo, animatedEstadoCuerpo);
            MostrarBotonInicio.value = false;
        };

        const configurarMensajeError = (data) => {
            let titulo = "Link no válido";
            let cuerpo = "El link que estás usando no es válido o ha expirado.";

            if (data.error_code === 'PERIODO_CONCLUIDO') {
                titulo = "Periodo concluido";
                cuerpo = `Esta evaluación ya no recibe respuestas. ${data.mensaje}.`;
            } else if (data.error_code === 'NO_INICIADA') {
                titulo = "Evaluación no disponible";
                cuerpo = `Aún no es tiempo de contestar. ${data.mensaje}.`;
            } else if (data.error_code === 'TOKEN_INVALIDO') {
                titulo = "Acceso restringido";
                cuerpo = "El link es incorrecto o ha sido modificado.";
            }

            mostrarMensajeEstado(titulo, cuerpo);
        };

        return {
            showCard,
            loadingConfig,
            animatedState, 
            imagePreviews, 
            mensajeEstado,
            MostrarBotonInicio, 
            mostrarFormularioAddUsuario, 
            verEncuesta,
            id_form, 
            id_user, 
            tok, 
            CerrarEncuesta, 
            updateConfigData,
            handleYowiToggle,
            handleHeaderToggle,
            handleHeaderModeToggle,
            guardarPlantilla, 
            uploadHeaderImage, 
            localshowYowi,
            localShowHeader, 
            localHeaderMode, 
            poweredYowi_image, 
            yowi_image, 
            iconTag,
            localConfig
        };
    }
});
</script>

<style scoped>
    .EncuestasPublicas-cardmsg {
        height: fit-content;
        z-index: 10;
        background: white;   
        backdrop-filter: blur(10px);
        -webkit-backdrop-filter: blur(10px);
        animation: aparecemsg .6s cubic-bezier(0.16, 1, 0.3, 1);
        border: 1px solid rgba(255, 255, 255, 0.2);
    }

    /* Botón con estilo fijo */
    .btn-comenzar-evaluacion {
        background-color: #C10230 !important;
        border-color: #C10230 !important;
        color: white !important;
        border-radius: 15px;
        padding: 4px 15px;
        font-weight: 600;
        transition: all 0.3s ease;
        border: 1px solid transparent;
        box-shadow: 0 4px 15px rgba(193, 2, 48, 0.2);
    }

    .btn-comenzar-evaluacion:hover:not(:disabled) {
        background-color: #F1F5FD !important;
        color: #8D0230 !important;
        border-color: #8D0230 !important;
        transform: translateY(-1px);
        box-shadow: 0 6px 20px rgba(193, 2, 48, 0.3);
    }
    .panel-divider { border-color: rgba(255, 255, 255, 0.11); opacity: 1; }
    .EncuestasPublicas-powered { 
        width: 90px; 
        opacity: 0.8; 
    }
    @media (min-width: 768px) {
        .EncuestasPublicas-powered {
            position: absolute;
            bottom: 1rem;
            right: 1rem;
        }
    }
    @media (max-width: 767px) {
        .EncuestasPublicas-powered {
            display: block;
            margin: 1rem auto 0 auto;
        }
    }
    @keyframes aparecemsg { from { opacity: 0; } to { opacity: 1; } }
    .fondo {       
        height: 100vh; 
        background: radial-gradient(circle, var(--azulNormal) 0%, var(--azulDark) 100%);
        overflow: hidden;
        position: relative;
    }
    .fondo.modo-edicion { height: 100% !important; max-height: 100% !important; overflow-y: auto; overflow-x: hidden; }
</style>