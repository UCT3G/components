<template>
    <button class="btn-primary" :disabled="isDisabled" @click="handleClick">
      <span v-html="svgContent" class="icon"></span>
      
      <slot></slot>
    </button>
  </template>
  
  <script>
  import { ref, watch } from 'vue'
  
  
  export default {
    name: 'BotonIconoPrimary',
    components:{
      
    },
    props: {
      iconName: {
        type: String,
        required: true
      },
      isDisabled: {
        type: Boolean,
        default: false
      },
      width_icon: {
        type: String,
        default: '10px' // Este es el ancho predeterminado del icono SVG
      }
    },
    setup(props, { emit }) {
      const svgContent = ref('');
  
      const loadSvg = async () => {
        try {
          const svgPath = require(`@/assets/images/icons/${props.iconName}`);
          const response = await fetch(svgPath);          
          const svgText = await response.text(); 
          svgContent.value = svgText.replace(/<svg /, `<svg style="width: ${props.width_icon};" `);     
            
        } catch (error) {
          console.error('Error loading the SVG:', error);
          svgContent.value = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100"><text y="50%" x="50%" dy="0.3em" text-anchor="middle" fill="red">Error</text></svg>';
        }
      };
  
      watch(() => props.iconName, loadSvg, { immediate: true });
  
      const handleClick = () => {
        if (!props.isDisabled) {
          emit('clickPrymary');
        }
      }
  
      return { handleClick, svgContent };
    }
  }
  </script>
  
  <style scoped>
  .btn-primary {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 5px;
      color: #fff;
      background-color: #007bff;
      border-color: unset;
      padding: 3px 12px!important;
      border-radius: 10px!important;
      /* background: linear-gradient(50deg, rgba(132, 169, 202), rgba(87, 83, 152)); */
      background: linear-gradient(50deg, rgba(98, 214, 239), rgba(158, 145, 234));
      cursor: pointer;
      border: none;
      outline: none;
      transition: transform 0.3s ease;
      margin:5px;
      font-size: 13px;
      font-weight: 500;
  }
  
  .btn-primary:hover {
      background: var(--purple-sb);
  }
  
  .btn-primary:active {
      background: var(--purple-sb);
  }
  
  .icon {
      
      fill: var(--babyBlue);
      min-height: 25px;
      padding: 3px;
  }

  .btn-primary:disabled {
      background: var(--purple-sb)!important;
      cursor: not-allowed;
  }
  </style>
  