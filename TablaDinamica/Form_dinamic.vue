<template>
  <div class="form-container">
    <div class="input-row">
      <div class="input-group">
        <label><i>Descripción</i></label>
        <input v-model="descripcion" type="text" />
      </div>

      <div class="input-group">
        <label><i>Consulta sql Tabla</i></label>
        <textarea v-model="consulta" rows="6" />
      </div>
    </div>

    <div class="button-row">
      <button class="btn cancel" @click="cancelar">Cancelar</button>
      <button class="btn save" @click="saveBtn">Guardar</button>
    </div>
  </div>
</template>

<script>
import { defineComponent, ref, toRefs, onMounted } from 'vue';
import axios from '@/../axios-config.js';
import { useStore } from 'vuex';

export default defineComponent({
  name: 'FormDinamico',
  props:{
    tablaBase:{
      type: Object,
      default: null,
    }
  },
  setup(props) {
    const store = useStore();
    const { tablaBase } = toRefs(props);
    const id_tabla = ref();
    const descripcion = ref("");
    const consulta = ref("");
    const jsonData = ref(null);
    onMounted(() => {
    if (tablaBase.value?.id_tabla) {
      id_tabla.value = tablaBase.value.id_tabla;

      axios.get('/Dinamicos/GetFormData', {
            params: {id_tabla: id_tabla.value},
          })
          .then(response => {
            // console.log('Respuesta del backend:', response.data);
            jsonData.value = response.data.json_form;
            // Cargar valores en el formulario
            descripcion.value = jsonData.value.descripcion || "";
            consulta.value = jsonData.value.consulta || "";
          })
          .catch(error => {
            console.error('Error en la petición al backend:', error);
          });

    }
  });

    const saveBtn = async () => {

      id_tabla.value = tablaBase.value.id_tabla;

      const payload = {
        id_tabla: id_tabla.value,
        descripcion: descripcion.value,
        consulta: consulta.value,
      };

      const getCredenciales = () => {
          const token = store.state.user.token; // Ajusta según la estructura de tu store
          return {
              headers: {
                  Authorization: `Bearer ${token}`
              }
          };
      };

      try {
        const headers = getCredenciales();
       const response = await axios.post('/Dinamicos/Form', payload, headers);
       console.log('Respuesta del backend:', response.data);
      } catch (error) {
       console.error('Error al enviar los datos:', error);
      }
    };

    const cancelar = () => {
      descripcion.value = jsonData.value?.descripcion || "";
      consulta.value = jsonData.value?.consulta || "";
    };

    return {
      descripcion,
      consulta,
      saveBtn,
      cancelar,
      id_tabla
    };
  },
});
</script>

<style scoped>
.form-container {
  padding: 20px;
  background: white;
  border-radius: 10px;
}

.input-row {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
}

.input-group {
  flex: 1;
  display: flex;
  flex-direction: column;
}

input,
textarea {
  background-color: #ddd9f5;
  border: none;
  border-radius: 6px;
  padding: 8px;
  font-size: 14px;
}

textarea {
  resize: vertical;
  min-height: 130px;
}

label {
  font-style: italic;
  margin-bottom: 4px;
}

.button-row {
  display: flex;
  justify-content: center;
  gap: 10px;
}

.btn {
  padding: 6px 16px;
  border: none;
  border-radius: 8px;
  background-color: #a89cf0;
  color: white;
  font-weight: bold;
  cursor: pointer;
}

.btn.cancel {
  background-color: #b2aaf5;
}
</style>
