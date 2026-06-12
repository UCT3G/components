# Referencia del sistema DataVisualizer

**Sistema:** UCT Facultades  
**Componente principal:** `frontend_facultades/src/components/DataCharts/DataVisualizer/DataVisualizer.vue`  
**Objetivo:** explicar como instalar, alimentar, configurar y reutilizar `DataVisualizer` en otros modulos, agentes o conversaciones.  
**Actualizacion:** 2026-06-11

## 1. Resumen ejecutivo

`DataVisualizer` administra la exploracion y representacion grafica de datos obtenidos mediante `TablaDinamica`.

No contiene directamente la consulta SQL de negocio. La consulta y la configuracion JSON pertenecen a un registro de tabla dinamica almacenado en base de datos.

Flujo general:

1. crear la tabla dinamica en BD de pruebas
2. trasladar el mismo registro y sus relaciones a produccion, conservando IDs
3. cargar la definicion de la tabla dinamica al store Vuex
4. montar `DataVisualizer` con el nombre de la tabla
5. `TablaDinamica` ejecuta `getDataTable`
6. los registros regresan al store
7. `DataVisualizer` transforma los registros en opciones de ECharts
8. una vista guardada puede definir tipo de grafica, ejes, estilo y visibilidad

## 2. Responsabilidades por componente

### 2.1 DataVisualizer

Archivo:

`frontend_facultades/src/components/DataCharts/DataVisualizer/DataVisualizer.vue`

Responsabilidades:

- seleccionar o bloquear una tabla dinamica
- administrar modo datos/graficas
- recibir parametros para la consulta
- leer registros cargados en el store `reporteador`
- generar opciones para ECharts
- cargar, guardar, actualizar y eliminar vistas DataCharts
- aplicar permisos y modo lectura
- coordinar cabecera, configuracion, workspace y modales

No es responsable de:

- guardar la consulta SQL de la tabla
- ejecutar directamente `/TablasDinamicas/getDataTable`
- crear automaticamente una tabla dinamica faltante
- decidir por si mismo el significado de cada grafica

### 2.2 VisualizerWorkspace

Archivo:

`frontend_facultades/src/components/DataCharts/DataVisualizer/VisualizerWorkspace.vue`

Monta `TablaDinamica` y `EChartsVisualizer`. La carga real ocurre mediante:

```vue
<TablaDinamica
  :tabla_nombre="selectedTableName"
  :tablaBase="tableBase"
  :consultar_registros="externalDataTrigger"
  @finalizarRenderBody="onDataLoaded"
/>
```

### 2.3 TablaDinamica

Archivo:

`frontend_facultades/src/components/TablaDinamica/TablaDinamica.vue`

Responsabilidades:

- tomar `tablaBase.json_tabla`
- ejecutar filtros, orden, paginacion y parametros
- despachar `reporteador/CargarDataTable`
- recibir los registros del backend
- guardar los registros mediante `reporteador/agregarRegistrosTabla`

Endpoint utilizado:

```txt
POST /TablasDinamicas/getDataTable
```

### 2.4 chartOptionsFactory y EChartsVisualizer

Archivos:

- `frontend_facultades/src/components/DataCharts/composables/chartOptionsFactory.js`
- `frontend_facultades/src/components/DataCharts/EChartsVisualizer.vue`

El factory convierte registros y configuracion en opciones de ECharts. El visualizador inicializa la libreria, aplica opciones y responde a cambios de tamano.

Cada nuevo tipo de grafica debe soportarse tanto en las opciones de configuracion como en el factory.

## 3. Tablas dinamicas en base de datos

Una tabla dinamica depende principalmente de:

- nombre unico de tabla
- consulta SQL
- JSON de columnas, filas, filtros, orden y parametros
- relacion con modulo y sistema
- estado activo

La consulta debe seguir el estandar:

```sql
SELECT * FROM (
    -- consulta personalizada
) t1
```

Los parametros enviados por el componente se representan con `%s` en la consulta y se colocan en `json_tabla.data`.

```sql
WHERE e.id_tutor_fk = %s
```

```vue
:tableParams="[tutorID]"
```

## 4. Regla de creacion y migracion

Las tablas dinamicas nuevas deben crearse primero en la BD de pruebas:

```txt
10.10.127.2
```

Despues se trasladan a produccion conservando los IDs asignados:

```txt
10.10.127.3
```

Esta regla evita colisiones y que una migracion posterior sobrescriba configuraciones creadas por otros integrantes.

La migracion debe considerar, como minimo:

1. registro de `uc3g_v3.tabla_dinamica`
2. relacion de la tabla con modulo y sistema
3. formularios o catalogos asociados, si existen
4. validacion del mismo ID en pruebas y produccion

No se debe recrear manualmente la tabla en produccion con un ID nuevo.

## 5. Carga en Vuex

Store:

`frontend_facultades/src/store/ReporteadorReactive/ReporteadorServicios.js`

### 5.1 cargarDataReporteadorModulo

Uso:

- primera carga de tablas dinamicas de un modulo
- cambio de modulo o contexto principal
- reemplazo controlado del conjunto anterior

Efecto:

- sustituye tablas y formularios cargados previamente
- evita acumulacion de tablas que ya no se usan

Debe ser la primera carga del modulo.

### 5.2 agregarDataReporteadorModulo

Uso:

- cargas posteriores dentro del mismo modulo
- componentes secundarios o modales
- agregar tablas sin borrar las que ya utiliza la pantalla

Efecto:

- conserva lo existente en el store
- agrega solamente tablas y formularios faltantes

Es la opcion adecuada para graficas dentro de un expediente que ya utiliza otras tablas dinamicas.

## 6. useReporteadorTabla

Archivo:

`frontend_facultades/src/composables/useReporteadorTabla.js`

Uso actual:

```js
import { useReporteadorTabla } from '@/composables/useReporteadorTabla';

const { cargando, tablaBase } = useReporteadorTabla({
  tablasNombres: [tablaNombre],
  tablaPrincipalNombre: tablaNombre,
});
```

Sustituye el bloque repetido que despacha manualmente `cargarDataReporteadorModulo` y administra el estado de carga.

Limitacion actual:

- solo ejecuta `cargarDataReporteadorModulo`
- no permite elegir `agregarDataReporteadorModulo`
- usado dentro de un modulo ya cargado puede reemplazar tablas necesarias

Mejora requerida:

```js
useReporteadorTabla({
  tablasNombres: ['TB_EJEMPLO'],
  tablaPrincipalNombre: 'TB_EJEMPLO',
  estrategiaCarga: 'agregar', // 'inicial' | 'agregar'
});
```

El valor por defecto debe continuar siendo `inicial` para conservar compatibilidad.

## 7. Flujo completo de datos

```txt
Componente de pantalla
  -> useReporteadorTabla
  -> /Dinamicos/modulo
  -> store reporteador
  -> DataVisualizer
  -> VisualizerWorkspace
  -> TablaDinamica
  -> reporteador/CargarDataTable
  -> /TablasDinamicas/getDataTable
  -> registros en store reporteador
  -> chartOptionsFactory
  -> EChartsVisualizer
```

`DataVisualizer` obtiene los registros mediante:

```js
store.getters['reporteador/getTablaPorNombre'](selectedTableName)
```

Por eso `fixedTableName` debe coincidir exactamente con `nombre_tabla` en BD y con el registro cargado en Vuex.

## 8. Vistas DataCharts

Las vistas guardadas no son la tabla dinamica. Guardan configuracion de presentacion:

- tipo de grafica
- eje X
- series o eje Y
- agrupaciones
- colores y alias
- limites y escalas
- filtros
- tabla de referencia
- visibilidad publica o privada

Endpoints:

```txt
GET  /DataCharts/getVistas
POST /DataCharts/saveVista
POST /DataCharts/updateVista
POST /DataCharts/deleteVista
POST /DataCharts/shareVista
GET  /DataCharts/getCompartidosVista
POST /DataCharts/deleteCompartido
```

Un resultado vacio en `getVistas` significa que no existen vistas accesibles para ese usuario y tabla. No significa que la tabla dinamica no exista.

Sin vista guardada, la tabla puede cargar datos y un administrador puede configurar la grafica manualmente.

Para `viewMode` se requiere una de estas opciones:

1. una vista publica para la tabla
2. un `defaultViewId`
3. una configuracion fija por codigo, si el componente se amplia para soportarla

La ruta recomendada para el expediente es crear una vista publica por cada tabla de grafica.

## 9. Permisos

Los permisos se cargan desde el arranque de la aplicacion, comenzando en `App.vue` y el store de usuario.

Composable:

`frontend_facultades/src/components/DataCharts/composables/useDataChartsPermisos.js`

El permiso administrativo de DataCharts determina acciones como:

- mostrar panel lateral
- configurar grafica
- guardar una vista nueva
- publicar vistas
- compartir o eliminar vistas propias

Antes de integrar en un modulo se debe verificar:

1. que `user/getPermisos` exista
2. que App haya cargado los permisos
3. que el permiso DataCharts esperado este disponible
4. que usuarios sin permiso no vean controles administrativos

## 10. Ejemplo de integracion

```vue
<template>
  <TablaCargando v-if="cargando" />

  <DataVisualizer
    v-else
    fixedTableName="TB_EJEMPLO"
    :tableParams="[registroId]"
    view-mode
    height="350px"
  />
</template>

<script>
import DataVisualizer from '@/components/DataCharts/DataVisualizer/DataVisualizer.vue';
import TablaCargando from '@/components/TablaDinamica/TablaLoader.vue';
import { useReporteadorTabla } from '@/composables/useReporteadorTabla';

const { cargando } = useReporteadorTabla({
  tablasNombres: ['TB_EJEMPLO'],
  tablaPrincipalNombre: 'TB_EJEMPLO',
  estrategiaCarga: 'agregar',
});
</script>
```

## 11. Varias graficas

Cuando una pantalla necesita varias graficas:

- cargar todos los nombres en una sola operacion
- usar tablas con nombres distintos
- montar una instancia de `DataVisualizer` por tabla y vista
- pasar el mismo parametro de contexto cuando corresponda
- usar estrategia `agregar` si el modulo ya tiene tablas cargadas

```js
useReporteadorTabla({
  tablasNombres: ['TB_GRAFICA_A', 'TB_GRAFICA_B'],
  tablaPrincipalNombre: 'TB_GRAFICA_A',
  estrategiaCarga: 'agregar',
});
```

## 12. Diagnostico de problemas

### Table not found in store

Causas frecuentes:

- `DataVisualizer` monto antes de terminar la carga
- el nombre no coincide exactamente
- la tabla no esta relacionada al modulo solicitado
- una carga inicial posterior reemplazo las tablas del store

### Aparece Crear en propiedades

El editor muestra `Crear` cuando `tablaBase.id_tabla` no es un numero mayor a cero. Recibio una base temporal o vacia; no es un fallo de `getVistas`.

### getVistas devuelve []

La tabla puede existir y cargar registros. Solo falta una vista accesible para el usuario.

### No aparece getDataTable

Validar:

- que `TablaDinamica` este montada
- que `consultar_registros` cambie a `true`
- que la tabla exista en store
- que `json_tabla.data` reciba los parametros

### ECharts reporta ancho o alto cero

El contenedor se monto oculto o antes de completar el layout. `EChartsVisualizer` debe esperar dimensiones validas y responder a `ResizeObserver`.

### Datos mezclados entre registros

Validar que `tableParams` cambie al cambiar el registro y que la tabla vuelva a ejecutar `getDataTable`.

## 13. Lista de verificacion para otro agente

1. leer esta referencia
2. confirmar version del submodulo `components`
3. confirmar `echarts` instalado
4. confirmar router backend `DataCharts`
5. confirmar modulo Vuex `DataCharts`
6. confirmar permisos cargados desde App
7. localizar o crear tabla dinamica en pruebas
8. migrar el mismo ID a produccion
9. elegir carga inicial o adicional
10. verificar `getDataTable`
11. crear vista publica si se usara `viewMode`
12. probar sin datos, con un registro y con varios registros

## 14. Regla para cambios futuros

Antes de modificar `DataVisualizer`, distinguir si el cambio corresponde a:

- datos: consulta SQL y tabla dinamica
- carga: composable y store reporteador
- configuracion: vista DataCharts
- permisos: App y store de usuario
- visualizacion: `chartOptionsFactory` y `EChartsVisualizer`
- integracion: componente de pantalla

Esta separacion evita corregir el componente grafico cuando el problema real esta en la tabla, el store o la vista guardada.
