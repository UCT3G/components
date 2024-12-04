<template>    
    <div class="m-2 search-content d-block">        
        <div class="d-flex" @click="showPopUp">
            <img :src="lupa" alt="buscar" class="icono-search">            
        </div>                                
    </div>

    <PopUp :visible="isPopUpVisible" size="medium" @update:visible="isPopUpVisible = $event" titulo="">
        <p>¿Que estas buscando?</p>
        <div class="d-flex justify-content-center aling-items-center h-100 p-4">
            <img :src="lupa" alt="buscar" class="icono-search-popup">
            <input type="text" class="form-control input-search" required aria-describedby="emailHelp" v-model="username">
        </div>        
    </PopUp>

      
  </template>
  
<script>
    import {ref} from 'vue';
    import lupa from '../../assets/images/icons/magnifying-glass-solid.svg';
    import PopUp from '@/components/Modal/Modal.vue';

    export default {
        name: 'SearchUCT',
        components:{
            PopUp,
        },
        setup(){
            const isPopUpVisible = ref(false)

            const showPopUp = ()=> {
                isPopUpVisible.value = true;
            };

            return{
                showPopUp,
                lupa,
                isPopUpVisible
            }
        }
    
    }
</script>
  
<style scoped>
    .search-content{
        /*margin-right: 6rem!important;*/
        cursor:pointer;
    }

    .icono-search,
    .icono-search-popup{
        background-color:unset;        
        padding: 0px 5px;
        width: 40px; 
        filter: invert(1);
    }
    .icono-search-popup{
        background: var(--babyBlue);
        border-radius: 10px 0px 0px 10px;
        filter: invert(0);
    }
    .input-search{
        border:unset;
        border-radius: 0px 10px 10px 0px;
        background: var(--babyBlue);
        outline: none !important;
        
    }

    .input-search:focus {
        outline: none;
        
        box-shadow: 0 0 8px rgba(255, 255, 255, 0.5);
    }

</style>
  