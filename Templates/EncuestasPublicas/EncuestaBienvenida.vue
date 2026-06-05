<template>
    <div class="text-start text-md-center mb-4">
        <!-- Modo Edición -->
        <template v-if="isEditMode">
            <h3 
                ref="titleRef"
                class="subtitulo edit-placeholder mb-2" 
                contenteditable="true" 
                @input="e => updateField('welcome_title', e.target.innerText)"
            ></h3>
            <div class="mb-4">
                <div class="badge rounded-pill badge-personalizado px-3 py-1 d-inline-flex align-items-center edit-placeholder">
                    <img :src="iconTag" class="me-2" style="width: 14px" alt="icon">
                    <span 
                        ref="tagRef"
                        class="bg-transparent border-0 outline-none" 
                        contenteditable="true" 
                        @input="e => updateField('welcome_tag', e.target.innerText)"
                    ></span>
                </div>
            </div>
            <p 
                ref="bodyRef"
                class="texto-caja edit-placeholder" 
                contenteditable="true" 
                @input="e => updateField('welcome_body', e.target.innerText)"
            ></p>
        </template>
        
        <!-- Modo Normal -->
        <template v-else>
            <template v-if="!mensajeEstado.titulo">
                <h3 class="subtitulo mb-2">{{ animatedText.title }}</h3>
                <div class="mb-4">
                    <div class="badge rounded-pill badge-personalizado px-3 py-1 d-inline-flex align-items-center">
                        <img :src="iconTag" style="width:14px" alt="icon" class="me-2">
                        <span style="font-size: 14px;">{{ animatedText.tag }}</span>
                    </div>
                </div>
                <p class="texto-caja">{{ animatedText.body }}</p>
            </template>
            <template v-else>
                <h3 class="subtitulo">{{ animatedText.estadoTitulo }}</h3>
                <p class="texto-caja">{{ animatedText.estadoCuerpo }}</p>
            </template>
        </template>
    </div>
</template>

<script>
import { defineComponent, ref, onMounted, watch, nextTick } from 'vue';

export default defineComponent({
    name: 'EncuestaWelcomeContent',
    props: {
        isEditMode: { type: Boolean, default: false },
        configData: { type: Object, required: true },
        animatedText: { type: Object, default: () => ({}) },
        mensajeEstado: { type: Object, default: () => ({}) },
        iconTag: { type: String, required: true }
    },
    emits: ['update:configData'],
    setup(props, { emit }) {
        const titleRef = ref(null);
        const tagRef = ref(null);
        const bodyRef = ref(null);

        // Sincroniza el contenido del DOM con las props solo si no hay foco activo
        const syncFields = () => {
            if (titleRef.value && document.activeElement !== titleRef.value) {
                titleRef.value.innerText = props.configData.welcome_title || '';
            }
            if (tagRef.value && document.activeElement !== tagRef.value) {
                tagRef.value.innerText = props.configData.welcome_tag || '';
            }
            if (bodyRef.value && document.activeElement !== bodyRef.value) {
                bodyRef.value.innerText = props.configData.welcome_body || '';
            }
        };

        onMounted(() => {
            if (props.isEditMode) syncFields();
        });

        // Vigilar cambios en la configuración (ej: carga de plantilla externa)
        watch(() => props.configData, () => {
            syncFields();
        }, { deep: true });

        // Asegurar que al entrar en modo edición las refs se inicialicen
        watch(() => props.isEditMode, async (newVal) => {
            if (newVal) {
                await nextTick();
                syncFields();
            }
        });

        const updateField = (field, value) => {
            // Emitimos una copia de configData para mantener la reactividad en el padre
            const newData = { ...props.configData, [field]: value };
            emit('update:configData', newData);
        };

        return { 
            updateField,
            titleRef,
            tagRef,
            bodyRef
        };
    }
});
</script>

<style scoped>
    .subtitulo { font-size: 35px; line-height: 1.1;}

    .texto-caja { font-size: 16px; line-height: 1.5;}

    .badge-personalizado { background-color: var(--bs-border-color); color: black;}

    .edit-placeholder {
        border: 2px dashed var(--bs-gray-500);
        padding: 5px;
        border-radius: 8px;
        transition: all 0.2s ease;
        min-width: 50px;
        outline: none;
    }

    .edit-placeholder:hover {
        border-color: var(--azulNormal);
    }

    .edit-placeholder:focus-within,
    .edit-placeholder:focus {
        border-color: var(--azulNormal);
        box-shadow: 0 0 15px rgba(51, 51, 51, 0.2);
    }

    [contenteditable="true"] {
        outline: none;
    }
</style>
