import { ref } from 'vue';

// Caché global de validaciones con TTL (Time To Live)
const validationCache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutos en milisegundos

/**
 * Composable para validar la existencia de archivos Rive
 * Optimizado para performance con caché de validaciones
 */
export function useRiveValidator() {
  const isValidating = ref(false);

  /**
   * Limpia entradas expiradas del caché
   */
  const cleanExpiredCache = () => {
    const now = Date.now();
    for (const [url, entry] of validationCache.entries()) {
      if (now - entry.timestamp > CACHE_TTL) {
        validationCache.delete(url);
      }
    }
  };

  /**
   * Verifica si un archivo Rive existe (con caché)
   * @param {string} url - URL del archivo .riv a validar
   * @param {boolean} bypassCache - Si es true, ignora el caché y valida de nuevo
   * @returns {Promise<boolean>} - true si el archivo existe y es accesible
   */
  const checkRiveExists = async (url, bypassCache = false) => {
    // Validaciones básicas
    if (!url || typeof url !== 'string') {
      return false;
    }

    // Validar formato .riv
    const isRivFile = url.toLowerCase().includes('.riv') || 
                      url.startsWith('blob:') || 
                      url.startsWith('data:');
    
    if (!isRivFile) {
      console.warn('useRiveValidator: URL no es archivo .riv', url);
      return false;
    }

    // Solo validar existencia para URLs HTTP/HTTPS
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      // Blobs y data URLs se asumen válidos
      return true;
    }

    // Verificar caché primero (si no se solicita bypass)
    if (!bypassCache && validationCache.has(url)) {
      const cached = validationCache.get(url);
      const now = Date.now();
      
      // Verificar si el caché aún es válido
      if (now - cached.timestamp < CACHE_TTL) {
        // console.log('useRiveValidator: Usando resultado de caché para', url);
        return cached.exists;
      } else {
        // Caché expirado, eliminar
        validationCache.delete(url);
      }
    }

    isValidating.value = true;

    try {
      const response = await fetch(url, { 
        method: 'HEAD',
        cache: 'no-cache'
      });
      
      const exists = response.ok;
      
      // Guardar en caché
      validationCache.set(url, {
        exists,
        timestamp: Date.now()
      });
      
      // Limpiar caché expirado periódicamente
      if (validationCache.size > 50) {
        cleanExpiredCache();
      }
      
      return exists;
    } catch (error) {
      console.error('useRiveValidator: Error al validar archivo', url, error);
      
      // Cachear también errores (para evitar re-intentos constantes)
      validationCache.set(url, {
        exists: false,
        timestamp: Date.now()
      });
      
      return false;
    } finally {
      isValidating.value = false;
    }
  };

  /**
   * Valida múltiples URLs de archivos Rive en paralelo
   * @param {string[]} urls - Array de URLs a validar
   * @param {boolean} bypassCache - Si es true, ignora el caché
   * @returns {Promise<boolean[]>} - Array de resultados de validación
   */
  const checkMultipleRiveFiles = async (urls, bypassCache = false) => {
    if (!Array.isArray(urls)) {
      return [];
    }

    isValidating.value = true;

    try {
      const results = await Promise.all(
        urls.map(url => checkRiveExists(url, bypassCache))
      );
      return results;
    } finally {
      isValidating.value = false;
    }
  };

  /**
   * Limpia todo el caché de validaciones
   */
  const clearCache = () => {
    validationCache.clear();
    console.log('useRiveValidator: Caché limpiado');
  };

  /**
   * Obtiene estadísticas del caché
   */
  const getCacheStats = () => {
    return {
      size: validationCache.size,
      entries: Array.from(validationCache.entries()).map(([url, entry]) => ({
        url,
        exists: entry.exists,
        age: Date.now() - entry.timestamp
      }))
    };
  };

  return {
    checkRiveExists,
    checkMultipleRiveFiles,
    clearCache,
    getCacheStats,
    isValidating
  };
}
