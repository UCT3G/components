<template>
  <div class="tooltip-wrapper" :class="{ 'has-tooltip': showTooltip }">
    <div class="circular-div" 
      :style="{ background: color, color: letraColor, height: perfilHeight, width: perfilWidth }">
        {{ initials }}
    </div>
    <div v-if="showTooltip" class="tooltiptext">{{ tooltipText }}</div>
  </div>
</template>

<script>
import { defineComponent, ref, watch } from 'vue';

export default defineComponent({
  name: 'IconoPerfil',
  props: {
    name_sistema_l1: {
      type: String,
      default: 'Nombre del sistema'
    },
    color: {
      type: String,
      default: '#add8e6'
    },
    letraColor: {
      type: String,
      default: '#ffffff'
    },
    showTooltip: {
      type: Boolean,
      default: false
    },
    tooltipText: {
      type: String,
      default: ''
    },
    perfilHeight: {
      type: String,
      require: true
    },
    perfilWidth: {
      type: String,
      require: true
    }
  },
  setup(props) {
    const initials = ref('');

    // Función para calcular las iniciales
    const calculateInitials = (name) => {
      const words = name.split(' ');
      let initialsValue = '';
      for (let i = 0; i < 2 && i < words.length; i++) {
        initialsValue += words[i].charAt(0).toUpperCase();
      }
      return initialsValue;
    };

    // Inicializar las iniciales al principio
    initials.value = calculateInitials(props.name_sistema_l1);

    // Observar cambios en name_sistema_l1 y actualizar las iniciales
    watch(() => props.name_sistema_l1, (newValue) => {
      initials.value = calculateInitials(newValue);
    },{
      deep: true,
      immediate: true
    });

    return {
      initials
    };
  }
});
</script>

<style scoped>
.circular-div {
    border-radius: 50%;
    display: flex;
    align-content: center;
    justify-content: center;
    align-items: center;
    margin-right: 5px;
    width: 100%;
    height: 100%;
    box-shadow: 
    var(--blueBerry) 0px 2px 6px,
    var(--blueBerryPastel) 0px 6px 12px;
    

}
.tooltip-wrapper {
    position: relative;
    display: inline-block;
}
.tooltiptext {
    visibility: hidden;
    width: 200px;
    background-color: #333;
    color: #fff;
    text-align: center;
    border-radius: 6px;
    padding: 5px 0;
    position: absolute;
    z-index: 100;
    bottom: 125%;
    left: 50%;
    margin-left: -180px;
    opacity: 0;
    transition: opacity 0.3s;
    font-size: 7px;
}
.tooltip-wrapper.has-tooltip:hover .tooltiptext {
    visibility: visible;
    opacity: 1;
}
.tooltiptext::after {
    content: "";
    position: absolute;
    top: 100%;
    left: 50%;
    margin-left: 75px;
    border-width: 5px;
    border-style: solid;
    border-color: #333 transparent transparent transparent;
}
</style>
