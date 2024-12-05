<template>
    <div class="card">
        <div class="card-header"></div>
        <div class="card-body">
            <slot name="card-body"></slot>
        </div>
    </div>
</template>

<script>
import { defineComponent } from 'vue';

export default defineComponent({

})
</script>

<style scoped>
.card {
    border-radius: 10px;
    box-shadow: rgba(60, 64, 67, 0.3) 0px 1px 2px 0px, rgba(60, 64, 67, 0.15) 0px 2px 6px 2px;
    /*overflow-x: hidden;
    overflow-y: auto;*/
    scrollbar-width: none;
}

.card-header {
    background: linear-gradient(90deg, var(--purple-sb) 0%, var(--bluelight-sb) 60%);   
    height: 30px;    
    border-radius: 0 0 15px 15px; 
    margin-right: 30px;
    margin-left: 30px;
}
</style>