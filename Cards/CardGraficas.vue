<template>
    <div class="col-12">
      <div class="card card-height-100">
        <div class="card-header align-items-center d-flex justify-content-between">
          <slot name="HeadTitulo"></slot>
          <div class="position-relative">
            <div class="d-none d-xl-block">
              <slot name="headBTN"></slot>
            </div>
            <div class="dropdown d-block d-xl-none">
              <a
                class="text-reset dropdown-btn"
                href="#"
                data-bs-toggle="dropdown"
                aria-haspopup="true"
                aria-expanded="false"
              >
                <span class="text-muted fs-16"
                  ><i class="mdi mdi-dots-vertical align-middle"></i
                ></span>
              </a>
              <div class="dropdown-menu dropdown-menu-end">
                <slot name="headBTN"></slot>
              </div>
            </div>
          </div>
        </div>
        <!-- end card header -->
        <div class="card-body">
          <slot name="BodyContenido"></slot>
        </div>
        <!-- end cardbody -->
        <div v-if="$slots.Foother" class="card-footer">
    <slot name="Foother"></slot>
  </div>
        <!-- end card footer -->
      </div>
      <!-- end card -->
    </div>
  </template>
  
  <script>
  import { defineComponent } from 'vue';
  
  export default defineComponent({
    name: 'CardGraficas',
    props: {
      
    },
    setup() {
      return {
        chartData: {
          labels: [],
          datasets: []
        }
      };
    }
  });
  </script>
  
  <style scoped>
  .card {
    /* Agregar estilos personalizados si es necesario */
    border: unset;    
    box-shadow: rgba(0, 0, 0, 0.05) 10px 6px 24px 10px, rgba(0, 0, 0, 0.08) 0px 0px 0px 1px;
    
    box-shadow: rgba(14, 30, 37, 0.12) 0px 2px 4px 0px, rgba(14, 30, 37, 0.32) 0px 2px 16px 0px;
    margin:10px;
  }  
  .dropdown-btn {
    cursor: pointer;
  }
  .card-footer{
    background: unset;
    border: unset;
  }
  </style>
  