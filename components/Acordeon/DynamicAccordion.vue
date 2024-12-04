<template>
    <div class="accordion" id="DynamicAccordion">
      <template v-for="(item, index) in data_acordeon" :key="item.id">
        <div class="accordion-item">
          <h2 class="accordion-header subtitulo" :id="'heading' + index">
            <button
              class="accordion-button"
              :class="{ 'collapsed': !isExpanded(index) }"
              type="button"
              data-bs-toggle="collapse"
              :data-bs-target="'#collapse' + index"
              :aria-expanded="isExpanded(index)"
              :aria-controls="'collapse' + index"
            >
              {{ item.titulo }}
            </button>
          </h2>
          <div
            :id="'collapse' + index"
            class="accordion-collapse collapse"
            :class="{ 'show': isExpanded(index) }"
            :aria-labelledby="'heading' + index"
            data-bs-parent="#DynamicAccordion"
          >
            <div class="accordion-body">
              <slot :name="'collapse' + index"></slot>
            </div>
          </div>
        </div>
      </template>
    </div>
  </template>
  
  <script>
  import { defineComponent} from 'vue';
  
  export default defineComponent({
    name: 'DynamicAccordion',
    props: {
      data_acordeon: {
        type: Array,
        required: true
      },
      comportamiento: {
        type: String,
        default: 'desplegado' // puede ser 'desplegado', 'cerrado', 'tema1'
      }
    },
    setup(props) {
      const isExpanded = (index) => {
        if (props.comportamiento === 'desplegado') {
          return true;
        } else if (props.comportamiento === 'cerrado') {
          return false;
        } else if (props.comportamiento === 'tema1') {
          return index === 0;
        }
        return false;
      };
  
      return {
        isExpanded
      };
    }
  });
  </script>
  
  <style scoped>
  .accordion-item {
    margin-bottom: 20px;
  }
  #DynamicAccordion {
    max-height: 100%;
    position: relative;
  }
  #DynamicAccordion .accordion-button {
    background: var(--babyBlue) !important;
    position: relative;
    border: unset !important;
    border-radius: 30px !important;
  }
  #DynamicAccordion .accordion-item {
    background: var(--blanco) !important;
    border: unset;
  }
  #DynamicAccordion .subtitulo {
    border-radius: 30px !important;
  }
  </style>
  