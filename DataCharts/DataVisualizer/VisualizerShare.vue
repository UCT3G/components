<template>
  <div class="share-modal-content p-3">
    <!-- Header de Control de Acceso -->
    <div class="d-flex align-items-center justify-content-between mb-4">
      <div>
        <h6 class="mb-0 fw-bold text-dark">Control de Acceso</h6>
        <p class="text-muted x-small mb-0">Gestiona quién puede ver o editar esta vista.</p>
      </div>
      <button 
        v-if="isOwner"
        class="btn btn-sm btn-primary px-3"
        @click="showSelectionModal = true"
      >
        Agregar Usuarios
      </button>
    </div>

    <!-- Cargando Compartidos -->
    <div v-if="fetching" class="loading-container">
      <LoadingUCT :blockFullScreem="false" />
    </div>

    <!-- Lista de Usuarios Seleccionados -->
    <div v-else-if="selectedUsers.length > 0">
      <!-- Filtro rápido / Toggle Global -->
      <div v-if="isOwner" class="d-flex justify-content-end mb-3">
        <div class="btn-group btn-group-sm shadow-xs">
          <input type="radio" class="btn-check" name="global-perm" id="global-read" @click="setGlobalPermission('lectura')">
          <label class="btn btn-outline-secondary py-1" for="global-read">Todo Lectura</label>
          <input type="radio" class="btn-check" name="global-perm" id="global-edit" @click="setGlobalPermission('editar')">
          <label class="btn btn-outline-secondary py-1" for="global-edit">Todo Editar</label>
        </div>
      </div>

      <div class="selected-users-grid mb-4">
        <div 
          v-for="(user, index) in selectedUsers" 
          :key="user.id_usuario" 
          class="user-card"
          :style="{ animationDelay: (index * 0.05) + 's' }"
        >
          <div class="d-flex align-items-center justify-content-between">
            <div class="d-flex align-items-center flex-grow-1 overflow-hidden">
              <div class="user-avatar-modern me-3">{{ (user.nombre_completo || 'U').charAt(0) }}</div>
              <div class="overflow-hidden">
                <div class="small fw-bold text-truncate">{{ user.nombre_completo }}</div>
              </div>
            </div>

            <div class="permission-select-container ms-3">
              <select 
                class="form-select form-select-sm border-0 bg-transparent fw-bold text-muted x-small-select"
                :value="user.tipo_permiso"
                :disabled="!isOwner"
                @change="(e) => handlePermissionChange(user, index, e.target.value)"
              >
                <option value="lectura">Lector</option>
                <option value="editar">Editor</option>
                <option v-if="isOwner" value="remove" class="text-danger">Quitar</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <!-- Acciones Finales -->
      <div v-if="hasChanges && isOwner" class="d-flex justify-content-end pt-3 border-top mt-auto">
        <div class="text-muted small me-auto d-flex align-items-center">
          Tienes cambios pendientes por guardar
        </div>
        <button @click="confirmShare" :disabled="loading" class="btn btn-primary"> 
          <span v-if="loading" class="spinner-border spinner-border-sm me-2"></span>
          {{ loading ? 'Sincronizando...' : 'Guardar' }}
        </button> 
      </div>
    </div>

    <!-- Estado Vacío -->
    <div v-else class="empty-share-state py-5 text-center">
      <h5 class="fw-bold text-dark">Análisis Privado</h5>
      <p class="text-muted small px-5">Esta vista solo es visible para ti. Compártela para colaborar con otros miembros del equipo.</p>
    </div>

    <!-- Modal Interno de Selección -->
    <PopUpSolido
        :visible="showSelectionModal"
        @update:visible="showSelectionModal = $event"
        size="large"
        titulo="Seleccionar Usuarios"
    >
      <TableSelect
        modo="multiple" 
        tablaNombre="TB_USUARIOS"
        campoId="ignorar_id_usuario" 
        :filtroEstado="{ campo: 'estado_usuario', valor: 'A' }"
        @onAddMultiples="onAddUsers"
      />
    </PopUpSolido>

    <!-- Modal de Confirmación para Revocar Acceso -->
    <PopUpSolido
      :visible="showRevokeModal"
      @update:visible="showRevokeModal = $event"
      size="small"
      titulo="Revocar Acceso"
      :confirm="true"
      :confirmFunction="confirmRevoke"
    >
      <p class="mb-0">¿Estás seguro de revocar el acceso a <strong>{{ userToRevoke?.nombre_completo }}</strong>?</p>
    </PopUpSolido>
  </div>
</template>

<script>
import { ref, onMounted, computed } from 'vue';
import { useStore } from 'vuex';
import TableSelect from "@/components/Tables/TableSelect.vue";
import PopUpSolido from "@/components/Modal/ModalSolid.vue";
import LoadingUCT from '@/components/Loading/Loading.vue';

export default {
  name: 'VisualizerShareModal',
  props: {
    view: { type: Object, required: true },
    currentPermission: { type: String, default: 'propietario' }
  },
  components: {
    TableSelect,
    PopUpSolido,
    LoadingUCT
  },
  emits: ['shared'],
  setup(props, { emit }) {
    const store = useStore();
    const selectedUsers = ref([]);
    const loading = ref(false);
    const fetching = ref(false);
    const showSelectionModal = ref(false);
    const showRevokeModal = ref(false);
    const userToRevoke = ref(null);
    const userToRevokeIndex = ref(null);
    const hasChanges = ref(false);

    const isOwner = computed(() => {
      if (!props.view) return false;
      const userId = store.state.user.userProfile?.id_usuario;
      // Consideramos dueño si el permiso es explicitamente propietario o si los IDs coinciden (en caso de que falte el campo)
      return props.currentPermission === 'propietario' || props.view.tipo_permiso === 'propietario' || props.view.registro_usuario == userId;
    });

    onMounted(async () => {
      if (isOwner.value) {
        await fetchExistingShares();
      }
    });

    const fetchExistingShares = async () => {
      fetching.value = true;
      try {
        const res = await store.dispatch('DataCharts/getCompartidosVista', {
          token: store.state.user.token,
          id_vista: props.view.id_vista
        });
        if (res?.result) {
          selectedUsers.value = res.result.map(u => ({
            ...u,
            isPersisted: true
          }));
        }
      } finally {
        fetching.value = false;
      }
    };

    const onAddUsers = (ids) => {
      if (!ids || ids.length === 0) return;
      
      const tableData = store.getters['reporteador/getTablaPorNombre']('TB_USUARIOS');
      if (!tableData || !tableData.registros) return;

      const existingIds = new Set(selectedUsers.value.map(u => u.id_usuario));
      
      const usersFound = tableData.registros
        .filter(r => ids.includes(r.ignorar_id_usuario) && !existingIds.has(r.ignorar_id_usuario))
        .map(r => {
          const p1 = r.nombres || '';
          const p2 = r.apellido_paterno || r.a_paterno || '';
          const p3 = r.apellido_materno || r.a_materno || '';
          const fullName = `${p1} ${p2} ${p3}`.trim();
          return {
            id_usuario: r.ignorar_id_usuario,
            nombre_completo: fullName || 'Usuario sin nombre',
            usuario: r.usuario || 'n/a',
            tipo_permiso: 'lectura',
            isPersisted: false
          };
        });
      
      if (usersFound.length > 0) {
          selectedUsers.value = [...selectedUsers.value, ...usersFound];
          hasChanges.value = true;
      }
      showSelectionModal.value = false;
    };

    const setGlobalPermission = (perm) => {
      selectedUsers.value.forEach(u => u.tipo_permiso = perm);
      hasChanges.value = true;
    };

    const updateUserPermission = (user, perm) => {
        if (user.tipo_permiso === perm) return;
        user.tipo_permiso = perm;
        hasChanges.value = true;
    };

    const removeOrRevoke = async (user, index) => {
      if (user.isPersisted) {
        userToRevoke.value = user;
        userToRevokeIndex.value = index;
        showRevokeModal.value = true;
      } else {
        selectedUsers.value.splice(index, 1);
        // Recalcular si quedan cambios pendientes
        hasChanges.value = selectedUsers.value.some(u => !u.isPersisted);
      }
    };

    const confirmRevoke = async () => {
      if (!userToRevoke.value) return;
      
      await store.dispatch('DataCharts/deleteCompartido', {
        token: store.state.user.token,
        payload: {
          id_vista: props.view.id_vista,
          id_usuario_destino: userToRevoke.value.id_usuario
        }
      });
      selectedUsers.value.splice(userToRevokeIndex.value, 1);
      
      showRevokeModal.value = false;
      userToRevoke.value = null;
      userToRevokeIndex.value = null;
    };

    const handlePermissionChange = (user, index, value) => {
      if (value === 'remove') {
        removeOrRevoke(user, index);
      } else {
        updateUserPermission(user, value);
      }
    };

    const confirmShare = async () => {
      loading.value = true;
      try {
        const asignaciones = selectedUsers.value.map(u => ({
          id_usuario_destino: u.id_usuario,
          tipo_permiso: u.tipo_permiso
        }));

        await store.dispatch('DataCharts/shareVista', {
          token: store.state.user.token,
          payload: {
            id_vista: props.view.id_vista,
            asignaciones: asignaciones
          }
        });
        hasChanges.value = false;
        // Marcar todos como persistidos ahora
        selectedUsers.value.forEach(u => u.isPersisted = true);
        emit('shared', selectedUsers.value);
      } finally {
        loading.value = false;
      }
    };

    return {
      selectedUsers, loading, fetching, showSelectionModal, isOwner, hasChanges,
      showRevokeModal, userToRevoke, confirmRevoke,
      onAddUsers,
      setGlobalPermission,
      updateUserPermission,
      removeOrRevoke,
      handlePermissionChange,
      confirmShare
    };
  }
};
</script>

<style scoped>
.x-small { font-size: 0.65rem; }
.x-small-select { 
  font-size: 0.85rem; 
  cursor: pointer;
  padding-right: 2rem;
  width: auto;
}
.x-small-select:focus {
  box-shadow: none;
  background-color: var(--bs-gray-100);
}

.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 200px;
  padding: 2rem 0;
}

.user-avatar-modern {
  width: 42px; height: 42px;
  background: var(--bs-dark-border-subtle);
  color: white;
  border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-weight: bold; font-size: 1.1rem;
  flex-shrink: 0;
}

.user-card {
  background: white;
  border: 1px solid var(--bs-gray-200);
  border-radius: 16px;
  padding: 1rem;
  margin-bottom: 0.75rem;
  transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.user-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(0,0,0,0.05);
  border-color: var(--bs-gray-200);
}

.btn-xs {
  font-size: 0.7rem;
  font-weight: 600;
}

.transition-all { transition: all 0.2s ease; }

.shadow-xs { box-shadow: 0 2px 4px rgba(0,0,0,0.03); }

.selected-users-grid {
  max-height: 400px;
  overflow-y: auto;
  padding-right: 5px;
}

.selected-users-grid::-webkit-scrollbar {
  width: 4px;
}
.selected-users-grid::-webkit-scrollbar-thumb {
  background: var(--bs-gray-200);
  border-radius: 10px;
}

.empty-share-state {
  background: var(--bs-gray-100);
  border-radius: 24px;
  border: 2px dashed var(--bs-gray-200);
}
</style>
