<template>
  <div class="p-2 WorkArea-Contenedor" v-if="isLoggedIn">
    <div class="WorkArea-Titulos d-flex flex-wrap align-items-center ">
      <div class="col-md-6 col-12"> <!--Primer espacio-->
        <div>
          <h5 class="titulo">
            {{ name_sistema_l1 }}
            <span v-if="name_sistema_l2" class="titulo2"
              >{{ name_sistema_l2 }}
            </span>
          </h5>
        </div>
        <div class="WorkArea-Titulos-lInferior"></div>
      </div>
      <div class="col-md-6 col-12"> <!--Segundo espacio-->
        <slot name="elementos_opcionales"></slot>
      </div>
    </div>

    <div class="WorkArea-contenido p-2">
      <slot> </slot>
    </div>
  </div>
  <div v-else>
    <!-- Redireccionar o mostrar un mensaje si el usuario no ha iniciado sesión -->
    <div
      class="d-flex justify-content-center align-items-center h-100 DB-redireccion"
    >
      <div class="spinner-grow" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
    </div>
  </div>
</template>

<script>
import { defineComponent } from "vue";
import { useRouter } from "vue-router";

export default defineComponent({
  name: "WorkArea",
  props: {
    name_sistema_l1: {
      type: String,
      default: "Nombre del sistema",
    },
    name_sistema_l2: {
      type: String,
    },
    isLoggedIn: {
      type: Boolean,
      default: false,
    },
  },
  setup(props) {
    const router = useRouter();

    if (!props.isLoggedIn) {
      // Redireccionar a la página de inicio de sesión si no hay token o userProfile
      router.push("/login");
    }

    return {};
  },
});
</script>

<style scoped>
.WorkArea-Contenedor {
  background-color: rgba(255, 99, 71, 0);
  width: 100%;
  margin-left: 1rem;
  height: 88vh;
  display: flex;
  flex-direction: column;
  position: relative;
}

.WorkArea-contenido {
  overflow-y: auto;
  overflow-x: hidden;
  width: calc(100% - 10px);
  height: 100%;
  background-color: rgba(218, 255, 71, 0);
  padding-left: 20px !important;
}

.WorkArea-Titulos {
  margin: 1rem 0 0 1.5rem;
}
.WorkArea-Titulos h5 {
  line-height: 0.8;
  font-family: "MonserratBoldItalic", sans-serif;
  font-size: 22px;
}
.WorkArea-Titulos h5:nth-child(1) {
  font-family: "MonserratSemiBoldItalic";
}
.WorkArea-Titulos-lInferior {
  width: 33%;
  max-width: 200px;
  height: 5px;
  background: var(--blueBerry);
  margin-bottom: 5px;
  box-shadow: rgba(0, 0, 0, 0.45) 0px 25px 20px -20px;
}

.WorkArea-Titulos .titulo2 {
  font-size: 22px;
  font-family: "MonserratBoldItalic", sans-serif;
}

@media (min-width: 768px) {
  .WorkArea-Contenedor {
    width: calc(100% - 3rem);
    margin-left: 3rem;
  }

  .WorkArea-Titulos-lInferior {
    max-width: 500px;
  }
}
</style>
