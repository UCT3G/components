<template>
  <div class="m-0">
    <!-- Lista de Tabs -->
    <ul class="nav nav-underline m-0">
      <li
        v-for="(tab, index) in data_tab"
        :key="index"
        class="nav-item"
      >
        <a
          :class="['nav-link', { active: activeTab === index }]"
          href="#"
          @click.prevent="changeTab(index)"
        >
          {{ tab }}
        </a>
      </li>
    </ul>

    <!-- Contenido de las Tabs -->
    <transition name="fade" mode="out-in">
      <div v-if="activeTabContent !== null" :key="activeTabContent">
        <slot :name="'tab' + activeTab"></slot>
      </div>
    </transition>
  </div>
</template>

<script>
import { defineComponent, ref, watch } from 'vue';

export default defineComponent({
  name: 'TabDinamico',
  props: {
    data_tab: {
      type: Array,
      required: true
    },
    indiceActivo: {
      type: Number,
      default: 0
    }
  },
  setup(props, { emit }) {
    const activeTab = ref(props.indiceActivo);

    const changeTab = (newIndex) => {
      const previousIndex = activeTab.value;
      activeTab.value = newIndex;
      emit('tab-changed', { previous: previousIndex, current: newIndex });
    };

    watch(() => props.indiceActivo, (newIndex) => {
      activeTab.value = newIndex;
    });

    return {
      activeTab,
      changeTab,
    };
  }
});
</script>

<style scoped>
.nav-underline .nav-link {
  border-bottom: 2px solid transparent;
}

.nav-underline .nav-link.active {
  border-bottom-color: currentColor;
}

.nav-link {
  color: var(--blueBerry);
}

.nav-underline .nav-link.active {
  color: var(--bluePerry);
}

.fade-enter-active, .fade-leave-active {
  transition: opacity 0.5s;
}
.fade-enter, .fade-leave-to {
  opacity: 0;
}
</style>
