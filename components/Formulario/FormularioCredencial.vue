<template>
    <FormularioBasico :tituloFormulario="'Datos para credencial'">
        <div class="row mb-2">
            <div class="col-3">
                <label class="form-label">NSS</label>
                <input type="text" class="form-control input-formulario" v-model="NSS" @input="emitirCambios"/>
            </div>
            <div class="col-9">
                <label class="form-label">Alergías</label>
                <input type="text" class="form-control input-formulario" v-model="alergias" @input="emitirCambios"/>
            </div>
        </div>
        <div class="row mb-2">
            <div class="col-3">
                <label class="form-label">Tipo sanguíneo</label>
                <Select class="form-control input-formulario" v-model="valorSeleccionado" :options="tiposSanguineo" @change="emitirCambios"></Select>
            </div>
            <div class="col-9">
                <label class="form-label">Enfermedades</label>
                <input type="text" class="form-control input-formulario" v-model="enfermedades" @input="emitirCambios"/>
            </div>
        </div>
        <div class="row mb-2">
            <div class="col-7">
                <label class="form-label">Nombre del contacto en caso de emergencia</label>
                <input type="text" class="form-control input-formulario" v-model="contactoEmergencia" @input="emitirCambios"/>
            </div>
            <div class="col-5">
                <label class="form-label">Teléfono del contacto de emergencia</label>
                <input type="text" class="form-control input-formulario" v-model="telefonoEmergencia" @input="emitirCambios"/>
            </div>
        </div>
    </FormularioBasico>
</template>

<script>
    import { defineComponent, ref, watch } from 'vue';
    import FormularioBasico from './FormularioBasico.vue';
    import Select from '../Inputs/Select.vue';

    export default defineComponent({
        name: 'FormularioCredencial',
        components: {
            FormularioBasico,
            Select
        },
        props: {
            datosCredencial: {
                type: Object
            }
        },
        emits: ['actualizar-datos'],
        setup(props, { emit }) {
            const valorSeleccionado = ref('');
            const tiposSanguineo = ref([
                { value: 1, text: 'A+'}, { value: 2, text: 'A-'}, { value: 3, text: 'B+'}, { value: 4, text: 'B-'},
                { value: 5, text: 'AB+'}, { value: 6, text: 'AB-'}, { value: 7, text: 'O+'}, { value: 8, text: 'O-' }
            ]);
            const NSS = ref(null);
            const alergias = ref('');
            const enfermedades = ref('');
            const contactoEmergencia = ref('');
            const telefonoEmergencia = ref('');

            watch(() => props.datosCredencial, () => {
                let tipoSanguineo = tiposSanguineo.value.find(item => item.text === props.datosCredencial.SANGRE);
                if (tipoSanguineo) {
                    valorSeleccionado.value = tipoSanguineo.value.toString();
                }else {
                    valorSeleccionado.value = '';
                }
                NSS.value = props.datosCredencial.IMSS;
                alergias.value = props.datosCredencial.ALERGIAS;
                enfermedades.value = props.datosCredencial.ENFERMEDADES;
                contactoEmergencia.value = props.datosCredencial.EMERGENCIA_CONTACTO;
                telefonoEmergencia.value = props.datosCredencial.EMERGENCIA_TELEFONO;
            }, {
                deep: true,
                immediate: true
            });

            const emitirCambios = () => {
                let tipoSanguineo = tiposSanguineo.value.find(item => item.value === parseInt(valorSeleccionado.value, 10));
                emit('actualizar-datos', {
                    IMSS: NSS.value,
                    ALERGIAS: alergias.value,
                    SANGRE: tipoSanguineo.text,
                    ENFERMEDADES: enfermedades.value,
                    EMERGENCIA_CONTACTO: contactoEmergencia.value,
                    EMERGENCIA_TELEFONO: telefonoEmergencia.value
                })
            }

            return{
                valorSeleccionado,
                tiposSanguineo,
                NSS,
                alergias,
                enfermedades,
                contactoEmergencia,
                telefonoEmergencia,
                emitirCambios
            }
        }
    });
</script>

<style scoped>
    .input-formulario {
        border: none;
        border-bottom: 2px solid var(--purple-sb-70);
        background: transparent;
    }
</style>