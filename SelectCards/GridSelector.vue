<template>
  <div class="grid-selector p-4 rounded shadow bg-gradient">
    <div class="grid-header p-1 pb-2 mb-4">
      <!-- <div class="d-flex justify-content-start">
        <h6 class="mb-1 fw-bold">{{ title }}</h6>
      </div> -->
      <div class="d-flex justify-content-end">
        <div class="search-container">
          <img :src="iconBusqueda" alt="Buscar" class="search-icon" />
          <input 
            v-model="searchQuery"
            type="text" 
            class="form-control form-control-sm search-input texto-caja" 
            placeholder="Buscar..."
            style="max-width: 250px;"
          />
        </div>
      </div>
    </div>

    <!-- Fila de items -->
    <div class="grid-content p-3 pt-2">
      <div class="row g-3">
        <!-- Itera sobre los items recibidos como prop -->
        <div
          v-for="item in filteredItems"
          :key="item.id"
          class="col-6 col-sm-4 col-md-3 d-flex "
        >
          <!-- Card individual del item -->
          <div
            class="grid-card p-3 text-center rounded border position-relative"
            :class="{ 'selected': selected.includes(item.id) }" 
            @mousedown.prevent="toggleItem(item.id)"
          >
            <!-- Nombre del item -->
            <div class="grid-name texto-caja">{{ item.nombre }}</div>

            <!-- Check visible si el item está seleccionado -->
            <div v-if="selected.includes(item.id)" class="grid-checkmark d-flex align-items-center justify-content-center">
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Botón para cerrar el selector -->
    <div class="text-center mt-3">
      <button type="button" class="btn btn-secondary btn-sm btn-rounded" @click="closeSelector">
        {{ closeText }}
      </button>
    </div>
  </div>
</template>

<script>
import { defineComponent, ref, computed } from 'vue'
import iconBusqueda from "@/assets/images/icons/busqueda.svg";

export default defineComponent({
  name: 'GridSelector',
  props: {
    items: { type: Array, required: true }, // Array de elementos a mostrar
    selected: { type: Array, required: true },  // Array de IDs seleccionados
    title: { type: String, default: 'Selecciona elementos' }, // Título del selector
    closeText: { type: String, default: 'Listo' } // Texto del botón de cerrar
  },
  emits: ['update:selected', 'close'], // Eventos que emite: actualización de selección y cierre del selector
  setup(props, { emit }) {

    const searchQuery = ref('')

    // Items filtrados según la búsqueda
    const filteredItems = computed(() => {
      if (!searchQuery.value.trim()) return props.items
      const query = searchQuery.value.toLowerCase()
      return props.items.filter(item => 
        item.nombre.toLowerCase().includes(query)
      )
    })

    // Función para alternar la selección de un item
    const toggleItem = (id) => {
      const updated = [...props.selected]  // Copia del array de seleccionados
      const index = updated.indexOf(id) // Busca el índice del item
      if (index > -1) updated.splice(index, 1) // Si está seleccionado, lo elimina
      else updated.push(id)  // Si no está, lo agrega
      emit('update:selected', updated)  // Emite el array actualizado al componente padre
    }

    // Función para cerrar el selector
    const closeSelector = () => emit('close')

    return { toggleItem, closeSelector, searchQuery, filteredItems, iconBusqueda }
  }
})
</script>

<style scoped>

.btn-rounded{
  border-radius: 12px;
}

.grid-selector {
  background: linear-gradient(135deg, var(--bs-gray-200) 0%, var(--bs-gray-100) 100%);
  animation: slideIn 0.3s ease-out;
  display: flex;
  flex-direction: column;
  max-height: 370px;
}

@keyframes slideIn {
  from { opacity: 0; transform: translateX(20px); }
  to { opacity: 1; transform: translateX(0); }
}
/* Header fijo */
.grid-header {
  flex-shrink: 0;
  background: var(--bs-gray-100);
  backdrop-filter: blur(10px);
}
.search-container {
  position: relative;
  max-width: 250px;
}

.search-input {
  border-radius: 20px;
  border: 2px solid var(--bs-gray-300);
  padding: 0.375rem 0.75rem;
  padding-left: 2rem; 
}
.search-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  width: 16px;
  height: 16px;
  opacity: 0.5;
  pointer-events: none;
  z-index: 1;
}


.search-input:focus {
  border-color: var(--purple-sb);
  box-shadow: 0 0 0 0.2rem rgba(57, 58, 58, 0.15);
}
.grid-content {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
}


.grid-card {
  background: white;
  border: 2px solid var(--bs-gray-200);
  cursor: pointer;
  width: 100%;           
  height: 100%; 
  display: flex;          
  justify-content: center;
  align-items: center;
  text-align: center;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
}

.grid-card:hover {
  transform: translateY(-4px) scale(1.02);
  box-shadow: 0 6px 20px rgba(0,0,0,0.18);
  border-color: var(--bluelight-sb-70);
  background: var(--bluelight-sb-70);
  color: white;
}

.grid-card.selected {
  background: var(--bluelight-sb-70);
  color: white;
  transform: translateY(-4px);
  box-shadow: 0 6px 20px rgba(71, 72, 74, 0.3);
}


.grid-icon {
  font-size: 1.5rem;
  color: var(--blueBerry);
}

.grid-card.selected .grid-icon { color: white; }

.grid-name {
  font-size: 0.75rem;
  line-height: 1.5;
}

.grid-checkmark {
  position: absolute;
  top: -3px;
  right: -3px;
  background: var(--bluelight-sb);
  color: white;
  border-radius: 50%;
  width: 11px;
  height: 11px;
  font-size: 0.7rem;
  box-shadow: 10px 15px 15px rgba(0,0,0,0.2);
}
</style>
