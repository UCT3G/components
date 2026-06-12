<template>
  <div class="module-shell" :style="{ height }">
    <NavBarPaginasUCT :elementos_dropdown="true">
      <template #elementos_dropdown>
        <li class="dropdown-item module-shell-menu-item" @click="selectSection(homeId)">
          {{ homeLabel }}
        </li>
        <li
          v-for="section in availableSections"
          :key="section.id"
          class="dropdown-item module-shell-menu-item"
          @click="selectSection(section.id)"
        >
          {{ section.label || section.title }}
        </li>
      </template>

      <template #elementos_opcionales>
        <div class="module-shell-toolbar">
          <slot name="actions" :active-section="activeSection" :section="currentSection" />

          <slot name="account">
            <span v-if="accountLabel" class="badge module-shell-account" :class="accountClass">
              {{ accountLabel }}
            </span>
          </slot>

          <button
            v-if="showHomeButton && activeSection !== homeId"
            class="btn module-shell-home-button btn-sm"
            type="button"
            @click="selectSection(homeId)"
          >
            {{ homeLabel }}
          </button>
        </div>
      </template>
    </NavBarPaginasUCT>

    <main class="module-shell-content">
      <div v-if="loading" class="module-shell-loading">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Cargando...</span>
        </div>
      </div>

      <div v-else-if="activeSection === homeId" class="module-shell-home">
        <section class="module-shell-welcome">
          <div class="module-shell-welcome-copy">
            <p v-if="greeting" class="module-shell-eyebrow mb-2">{{ greeting }}</p>
            <h2 class="module-shell-title mb-2">{{ title }}</h2>
            <p v-if="subtitle" class="module-shell-subtitle mb-0">{{ subtitle }}</p>
          </div>
          <div v-if="image" class="module-shell-welcome-media">
            <img class="module-shell-image" :src="image" :alt="imageAlt" />
          </div>
        </section>

        <section class="module-shell-grid">
          <button
            v-for="section in availableSections"
            :key="section.id"
            type="button"
            class="module-shell-card"
            :class="{ 'module-shell-card-wide': availableSections.length === 1 }"
            @click="selectSection(section.id)"
          >
            <div class="module-shell-card-icon">
              <DynamicSvgLoader
                v-if="section.icon"
                :fileName="section.icon"
                width_icon="34px"
                :icon_active="true"
              />
              <i v-else class="bi bi-grid"></i>
            </div>
            <div class="module-shell-card-body">
              <div class="module-shell-card-title">{{ section.title || section.label }}</div>
              <p v-if="section.description" class="module-shell-card-text">{{ section.description }}</p>
              <span class="module-shell-card-action">{{ section.actionLabel || 'Entrar' }}</span>
            </div>
          </button>
        </section>

        <slot name="home-extra" />
      </div>

      <section v-else class="module-shell-section" :class="currentSection?.contentClass">
        <slot :name="activeSection" :section="currentSection">
          <div class="module-shell-empty">No hay contenido configurado para esta seccion.</div>
        </slot>
      </section>
    </main>
  </div>
</template>

<script>
import { computed, defineComponent, watch } from 'vue';
import NavBarPaginasUCT from '@/components/NavBar/NavBarPaginasUCT.vue';
import DynamicSvgLoader from '@/components/LoaderSVG/LoaderSVG.vue';

export default defineComponent({
  name: 'ModuleShell',
  components: {
    NavBarPaginasUCT,
    DynamicSvgLoader,
  },
  props: {
    modelValue: { type: String, default: 'hub' },
    sections: { type: Array, default: () => [] },
    chartsSection: { type: Object, default: null },
    loading: { type: Boolean, default: false },
    homeId: { type: String, default: 'hub' },
    homeLabel: { type: String, default: 'Inicio' },
    title: { type: String, required: true },
    subtitle: { type: String, default: 'Selecciona una opcion para continuar.' },
    greeting: { type: String, default: '' },
    image: { type: String, default: '' },
    imageAlt: { type: String, default: '' },
    accountLabel: { type: String, default: '' },
    accountClass: { type: [String, Array, Object], default: '' },
    showHomeButton: { type: Boolean, default: true },
    height: { type: String, default: '100vh' },
  },
  emits: ['update:modelValue', 'section-change'],
  setup(props, { emit }) {
    const availableSections = computed(() => {
      const sections = props.sections.filter((section) => section && section.id && section.visible !== false);
      if (props.chartsSection?.id && props.chartsSection.visible !== false) {
        sections.push({
          label: 'Graficas',
          title: 'Graficas',
          description: 'Consulta indicadores y visualizaciones del modulo.',
          icon: 'icons/graph',
          ...props.chartsSection,
        });
      }
      return sections;
    });

    const activeSection = computed(() => props.modelValue || props.homeId);
    const currentSection = computed(() =>
      availableSections.value.find((section) => section.id === activeSection.value) || null
    );

    const selectSection = (sectionId) => {
      emit('update:modelValue', sectionId);
      emit('section-change', sectionId);
    };

    watch(availableSections, (sections) => {
      const validIds = new Set([props.homeId, ...sections.map((section) => section.id)]);
      if (!validIds.has(activeSection.value)) selectSection(props.homeId);
    }, { immediate: true });

    return {
      activeSection,
      availableSections,
      currentSection,
      selectSection,
    };
  },
});
</script>

<style scoped>
.module-shell {
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.module-shell-menu-item {
  color: var(--blueBerry) !important;
  cursor: pointer;
}

.module-shell-toolbar {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.module-shell-account {
  border-radius: 6px;
  font-size: 0.72rem;
  font-weight: 800;
  padding: 0.45rem 0.7rem;
  text-transform: uppercase;
  white-space: nowrap;
}

.module-shell-home-button {
  border: 1px solid rgba(85, 96, 128, 0.16);
  background: rgba(255, 255, 255, 0.85);
  color: var(--blueBerry);
  font-weight: 700;
}

.module-shell-home-button:hover {
  background: var(--babyBlue);
  color: var(--titleBlue);
}

.module-shell-content {
  flex: 1 1 auto;
  min-height: 0;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.module-shell-loading {
  display: flex;
  justify-content: center;
  padding: 3rem;
}

.module-shell-home {
  flex: 1 1 auto;
  min-height: 0;
  overflow: auto;
}

.module-shell-welcome {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1.25rem;
  padding: 1.5rem;
  border-radius: 8px;
  margin-bottom: 1.25rem;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.98), rgba(232, 238, 241, 0.9));
  border: 1px solid rgba(85, 96, 128, 0.12);
  box-shadow: 0 14px 30px rgba(73, 86, 114, 0.1);
}

.module-shell-welcome-copy {
  max-width: 560px;
}

.module-shell-welcome-media {
  display: flex;
  align-items: center;
  justify-content: center;
}

.module-shell-eyebrow {
  color: var(--bluePerry);
  font-size: 0.82rem;
  font-weight: 800;
  letter-spacing: 0;
  text-transform: uppercase;
}

.module-shell-title {
  color: var(--blueBerry);
  font-size: 1.9rem;
  font-weight: 800;
  line-height: 1.1;
  letter-spacing: 0;
}

.module-shell-subtitle {
  color: #5a6677;
  font-size: 0.94rem;
  line-height: 1.4;
}

.module-shell-image {
  width: min(320px, 28vw);
  min-width: 180px;
  max-height: 190px;
  object-fit: contain;
  filter: drop-shadow(0 16px 24px rgba(73, 86, 114, 0.18));
}

.module-shell-grid {
  display: grid;
  grid-template-columns: repeat(12, minmax(0, 1fr));
  gap: 1rem;
}

.module-shell-card {
  grid-column: span 4;
  display: flex;
  align-items: stretch;
  gap: 1rem;
  min-width: 0;
  padding: 1.25rem;
  text-align: left;
  border: 1px solid rgba(85, 96, 128, 0.14);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.96);
  box-shadow: 0 10px 24px rgba(73, 86, 114, 0.08);
  transition: transform 0.18s ease, box-shadow 0.18s ease, border-color 0.18s ease;
}

.module-shell-card:hover {
  transform: translateY(-2px);
  border-color: rgba(85, 96, 128, 0.28);
  box-shadow: 0 16px 30px rgba(73, 86, 114, 0.14);
}

.module-shell-card-wide {
  grid-column: span 12;
  max-width: 520px;
}

.module-shell-card-icon {
  flex: 0 0 62px;
  width: 62px;
  height: 62px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  background: var(--babyBlue);
  color: var(--blueBerry);
  font-size: 1.75rem;
  --icon_color: var(--blueBerry);
  --icon_color_selected: var(--blueBerry);
  --icon_color_hover: var(--bluePerry);
}

.module-shell-card-body {
  min-width: 0;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;
}

.module-shell-card-title {
  color: var(--blueBerry);
  font-size: 1.08rem;
  font-weight: 800;
  margin-bottom: 0.35rem;
}

.module-shell-card-text {
  color: #5b6673;
  font-size: 0.93rem;
  line-height: 1.5;
  margin-bottom: 0.75rem;
}

.module-shell-card-action {
  color: var(--bluePerry);
  font-size: 0.8rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0;
}

.module-shell-section {
  flex: 1 1 auto;
  min-height: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.module-shell-empty {
  padding: 1.5rem;
  color: #6c757d;
  text-align: center;
}

@media (max-width: 991px) {
  .module-shell-welcome {
    flex-direction: column;
    align-items: flex-start;
  }

  .module-shell-welcome-media {
    width: 100%;
  }

  .module-shell-image {
    width: min(280px, 70vw);
  }

  .module-shell-card,
  .module-shell-card-wide {
    grid-column: span 12;
  }
}

@media (max-width: 576px) {
  .module-shell-title {
    font-size: 1.45rem;
  }

  .module-shell-account {
    white-space: normal;
    text-align: center;
  }

  .module-shell-card {
    flex-direction: column;
  }

  .module-shell-card-icon {
    width: 56px;
    height: 56px;
    flex-basis: 56px;
  }
}
</style>
