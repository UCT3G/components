# PanelGeneral & ConfigSection

Este módulo proporciona un panel lateral (sidebar) flexible con soporte para pestañas, títulos estáticos y secciones de configuración con comportamiento de acordeón automático opcional.

## Ubicación
- `PanelGeneral.vue`: Componente contenedor principal.
- `ConfigSection.vue`: Componente para secciones colapsables (acordeón).

---

## Componentes

### 1. PanelGeneral
El contenedor principal que maneja el scroll, las pestañas y la coordinación del acordeón.

**Props:**
- `collapsed` (Boolean): Controla si el panel está visible o contraído.
- `width` (String): Ancho del panel (default: `280px`).
- `tabs` (Array): Lista de nombres para las pestañas superiores.
- `activeTab` (String): Pestaña seleccionada (v-model:activeTab).
- `title` (String): Título estático (se muestra si no hay `tabs`).
- `accordion` (Boolean): Si es `true`, activa el modo de **acordeón automático** para todos los `ConfigSection` internos.

### 2. ConfigSection
Componente diseñado para vivir dentro de un `PanelGeneral`.

**Props:**
- `title` (String): El texto que se muestra en la cabecera de la sección.
- `isOpen` (Boolean): Control manual de apertura (se ignora si el padre tiene `accordion: true`).
- `id` (String): ID único para el acordeón (opcional, por defecto usa el `title`).

---

## Modos de Uso

### A. Modo Acordeón Automático (Simplificado)
Es la forma más fácil de usarlo. Al añadir el prop `accordion` al `PanelGeneral`, las secciones se coordinan solas: al abrir una, se cierran las demás automáticamente. **No necesitas gestionar estados en el padre.**

```vue
<template>
  <PanelGeneral title="Mi Panel" accordion>
    <ConfigSection title="Ajustes Generales">
      <!-- Tus inputs aquí -->
    </ConfigSection>
    
    <ConfigSection title="Ajustes Avanzados">
      <!-- Tus inputs aquí -->
    </ConfigSection>
  </PanelGeneral>
</template>
```

### B. Modo Manual
Si omites el prop `accordion`, puedes controlar qué secciones están abiertas de forma independiente usando el prop `:is-open` y el evento `@toggle`.

```vue
<template>
  <PanelGeneral title="Panel Manual">
    <ConfigSection 
      title="Sección Independiente" 
      :is-open="miEstado" 
      @toggle="miEstado = !miEstado"
    >
      <!-- Contenido -->
    </ConfigSection>
  </PanelGeneral>
</template>
```

---

## Estilos Recomendados
`PanelGeneral` incluye estilos `:deep` para formatear automáticamente las secciones. Se recomienda usar las clases utilitarias del proyecto para el contenido interno:
- `.x-small`: Para etiquetas de texto pequeñas.
- `.form-select-sm` / `.form-control-sm`: Para controles compactos que encajen bien en el panel lateral.
