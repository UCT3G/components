# SideBar — Componente de Navegación Lateral

Este componente proporciona una barra lateral vertical con iconos que permiten alternar entre diferentes paneles de contenido. Incluye soporte para notificaciones, colapso automático al hacer clic fuera y slots dinámicos para el contenido de cada panel.

---

## Tabla de Contenido

1. [Uso Básico](#uso-básico)
2. [Props](#props)
3. [Estructura del Objeto Panel](#estructura-del-objeto-panel)
4. [Slots](#slots)
5. [Eventos](#eventos)
6. [Personalización](#personalización)

---

## Uso Básico

El componente requiere una lista de `panels` y utiliza slots con el nombre del `id` de cada panel para renderizar su contenido.

```vue
<template>
  <SideBar :panels="misPaneles">
    <!-- Slot para el panel 'config' -->
    <template #config>
      <h3>Configuración</h3>
      <p>Contenido del panel de configuración...</p>
    </template>

    <!-- Slot para el panel 'user' -->
    <template #user>
      <h3>Perfil de Usuario</h3>
      <p>Detalles del usuario...</p>
    </template>
  </SideBar>
</template>

<script>
import SideBar from "@/components/SideBars/SideBar.vue";

export default {
  components: { SideBar },
  setup() {
    const misPaneles = [
      { id: "config", icon: "settings-icon", label: "Configuración" },
      { id: "user", icon: "user-icon", label: "Mi Perfil", notify: true },
    ];
    return { misPaneles };
  },
};
</script>
```

---

## Props

| Prop     | Tipo    | Requerido | Descripción                                                                 |
| -------- | ------- | --------- | --------------------------------------------------------------------------- |
| `panels` | `Array` | Sí        | Lista de objetos que definen los botones de la barra lateral y sus paneles. |

---

## Estructura del Objeto Panel

Cada objeto dentro del array `panels` puede contener las siguientes propiedades:

| Propiedad                | Tipo      | Descripción                                                                                             |
| ------------------------ | --------- | ------------------------------------------------------------------------------------------------------- |
| `id`                     | `String`  | Identificador único. **Debe coincidir con el nombre del slot**.                                         |
| `icon`                   | `String`  | Nombre del archivo SVG (sin extensión) que cargará el `DynamicSvgLoader`.                               |
| `label`                  | `String`  | Etiqueta para el `title` (tooltip) del botón.                                                           |
| `width_icon`             | `String`  | (Opcional) Ancho personalizado para el icono SVG.                                                       |
| `notify`                 | `Boolean` | (Opcional) Muestra un punto rojo de notificación sobre el icono.                                        |
| `noPanel`                | `Boolean` | (Opcional) Si es `true`, el contenido se renderiza sin el contenedor estilizado (gradiente/desenfoque). |
| `preventOutsideCollapse` | `Boolean` | (Opcional) Si es `true`, el panel no se cerrará automáticamente al hacer clic fuera de él.              |

---

## Slots

El componente utiliza **slots con nombre**. Para cada panel definido en la prop `panels`, se debe proveer un slot hijo cuyo nombre sea igual al `id` del panel.

```vue
<SideBar :panels="[{ id: 'mi-id', ... }]">
  <template #mi-id>
    <!-- Contenido aquí -->
  </template>
</SideBar>
```

---

## Eventos

| Evento         | Valor Retornado | Descripción                                                            |
| -------------- | --------------- | ---------------------------------------------------------------------- |
| `update:panel` | `id` (String)   | Se emite cada vez que se cambia el panel activo o se activa uno nuevo. |

---

## Personalización

### Variables CSS

El componente utiliza variables CSS globales para mantener la consistencia visual:

- `var(--blueBerry)`: Color principal de fondo del sidebar y paneles.
- `var(--rojoNormal)`: Color del punto de notificación.
- `var(--bs-gray-200)` / `var(--bs-gray-300)`: Bordes y acentos.

### Comportamiento de Colapso

- Si haces clic en el botón del panel que ya está abierto, el panel de contenido se contraerá/expandirá alternadamente.
- Si haces clic en un botón de un panel diferente, se abrirá ese panel inmediatamente.
- Por defecto, el panel de contenido se cierra si haces clic en cualquier parte fuera del contenedor del `SideBar`. Podrás evitar esto usando `preventOutsideCollapse: true` en la definición del panel.
