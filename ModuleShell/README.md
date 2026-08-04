# ModuleShell

Contenedor reutilizable para modulos compuestos por varias secciones internas.

Incluye:

- barra de navegacion con menu de secciones
- pantalla de inicio con imagen configurable
- tarjetas generadas desde la configuracion de secciones
- area de acciones contextual
- indicador opcional de cuenta o perfil
- seccion opcional de graficas mediante `chartsSection`
- separacion visual entre sistemas del modulo y graficas/informes
- slots nombrados para que cada modulo conserve su logica de negocio

## Uso basico

```vue
<ModuleShell
  v-model="seccionActiva"
  :sections="secciones"
  :charts-section="seccionGraficas"
  title="Mi modulo"
  subtitle="Selecciona una opcion para continuar."
  :image="imagenModulo"
>
  <template #actions="{ activeSection }">
    <button v-if="activeSection === 'usuarios'">Agregar</button>
  </template>

  <template #usuarios>
    <Usuarios />
  </template>

  <template #graficas>
    <Graficas />
  </template>
</ModuleShell>
```

## Estructura de una seccion

```js
{
  id: 'usuarios',
  label: 'Usuarios',
  title: 'Administracion de usuarios',
  description: 'Consulta y administra usuarios.',
  icon: 'icons/People',
  visible: true,
  actionLabel: 'Entrar',
  contentClass: 'overflow-auto'
}
```

## Estructura de `chartsSection`

```js
{
  id: 'graficas',
  label: 'Graficas',
  title: 'Graficas',
  description: 'Consulta indicadores y visualizaciones del modulo.',
  icon: 'icons/graph',
  groupTitle: 'Graficas e informes'
}
```

`chartsSection` usa la misma estructura y es opcional. Si existe, se muestra en una fila separada dentro del home del modulo.