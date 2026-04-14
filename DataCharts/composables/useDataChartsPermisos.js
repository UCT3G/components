import { computed } from 'vue';
import { useStore } from 'vuex';

/**
 * Composable para la gestión de permisos a nivel de módulo DataCharts.
 *
 * isDataChartsAdmin → true si el usuario es administrador del módulo DataCharts.
 * Un administrador tiene acceso completo.
 * La verificación se basa en el permiso con id_permiso = 22
 * Un usuario tiene acceso si su id_perfil_fk está en "Perfil" O su id_usuario está en "Usuario".
 */
export function useDataChartsPermisos() {
    const store = useStore();

    const isDataChartsAdmin = computed(() => {
        const permisos = store.getters['user/getPermisos'] || [];
        const permiso = permisos.find(p => p.id_permiso === 22);
        if (!permiso || !permiso.json) return false;

        const idPerfil  = store.state.user.userProfile?.id_perfil_fk ?? null;
        const idUsuario = store.state.user.userProfile?.id_usuario   ?? null;

        const perfilesPermitidos = permiso.json.Perfil  || [];
        const usuariosPermitidos = permiso.json.Usuario || [];

        return (
            perfilesPermitidos.includes(idPerfil) ||
            usuariosPermitidos.includes(idUsuario)
        );
    });

    return { isDataChartsAdmin };
}
