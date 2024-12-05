<template>
   <nav class="nav d-flex justify-content-between navBarUCT-content">
        <div class=" d-flex flex-row align-items-center  ms-2 mt-2">
            <div class="Dashboard-logouct-content">
               
                <img v-if="temaActual != 'UCT-TRESGUERRAS-SELECTED'" class="Dashboard-logouct" :src="logoUC3GWhite" alt="logo">
                <img v-else class="Dashboard-logouct-Gold" :src="logoUC3GGold" alt="logo">
            </div>
            <div class="d-flex flex-column ms-2">                
                <h4 class="m-0 d-none d-md-block titulo-light">{{ userName }}</h4> <!-- Muestra el nombre del usuario -->
                <p class="m-0 d-none d-md-block texto-caja-light ">{{ puesto }}</p>
            </div>
        </div> 

        <quickMenu @process="functionHamburguer"></quickMenu>                
    </nav>

  <PopUp
    :visible="PopUpUsuarioPerfil"
    @update:visible="PopUpUsuarioPerfil = $event"
    :size="'medium'"
    titulo="Perfil"
  >
    <div class="popup-container">
      <div
        class="col-12 d-flex align-items-center justify-content-center d-xxl-none"
      >
        <IconoPerfil
          style="font-size: 500%"
          :name_sistema_l1="userName"
          :perfilHeight="'150px'"
          :perfilWidth="'150px'"
        ></IconoPerfil>
      </div>
      <div class="row">
        <div
          class="col-xxl-3 d-flex align-items-center justify-content-center d-none d-xxl-flex"
        >
          <IconoPerfil
            style="font-size: 500%"
            :name_sistema_l1="userName"
            :perfilHeight="'150px'"
            :perfilWidth="'150px'"
          ></IconoPerfil>
        </div>
        <div class="col-xxl-9 p-3">
          <div
            class="row d-flex align-items-center justify-content-between margen"
          >
            <div class="col-12 col-sm-6 flex-column">
              <div class="margen">
                <span class="perfil-titulos">Nombre(s)</span>
              </div>
              <div class="margen">
                <input
                  type="text"
                  class="input-text"
                  v-model="nombres"
                  disabled
                  readonly
                />
              </div>
            </div>
            <div class="col-12 col-sm-6 flex-column">
              <div class="margen">
                <span class="perfil-titulos">Apellidos</span>
              </div>
              <div class="margen">
                <input
                  type="text"
                  class="input-text"
                  v-model="apellidos"
                  disabled
                  readonly
                />
              </div>
            </div>
          </div>
          <div
            class="row d-flex align-items-center justify-content-between margen"
          >
            <div class="col-12 col-sm-6 flex-column">
              <div class="margen">
                <span class="perfil-titulos">PUESTO</span>
              </div>
              <div class="margen">
                <input
                  type="text"
                  class="input-text"
                  v-model="puesto"
                  disabled
                  readonly
                />
              </div>
            </div>
            <div class="col-12 col-sm-6 flex-column">
              <div class="margen">
                <span class="perfil-titulos">ÁREA</span>
              </div>
              <div class="margen">
                <input
                  type="text"
                  class="input-text"
                  v-model="area"
                  disabled
                  readonly
                />
              </div>
            </div>
          </div>
          <div
            class="row d-flex align-items-center justify-content-between margen"
          >
            <div class="col-12 flex-column">
              <div class="margen">
                <span class="perfil-titulos">Correo personal</span>
              </div>
              <div class="margen">
                <input
                  type="text"
                  class="input-text"
                  v-model="correoPersonal"
                />
              </div>
            </div>
          </div>
          <!-- <div class="row d-flex align-items-center justify-content-between margen">
                        <div class="col-xl-6 col-lg-6 col-md-12 flex-column margen-medallas">
                            <div class="position-relative ">
                                <input 
                                    type="text" 
                                    class="input-opciones perfil-titulos"  
                                    value="MEDALLAS"
                                    disabled readonly
                                />
                                <div class="icono-medallas position-absolute d-flex justify-content-center align-items-center">
                                    <DynamicSvgLoader width_icon="30px" fileName="icons/CALIFICACIÓN-24"></DynamicSvgLoader> 
                                </div>
                            </div>
                        </div>
                        <div class="col-xl-6 col-lg-6 col-md-12 flex-column margen-medallas">
                            <div class="position-relative ">
                                <input 
                                    type="text" 
                                    class="input-opciones perfil-titulos" 
                                    value="RANKING"
                                    disabled readonly
                                />
                                <div class="icono-medallas position-absolute d-flex justify-content-center align-items-center fs-2">
                                    5
                                </div>
                            </div>
                        </div>
                    </div> -->
        </div>
      </div>
      <div class="col-12 mb-1">
        <div class="mb-2">
          <span class="perfil-titulos">Avance</span>
        </div>
        <div
          class="progress"
          role="progressbar"
          aria-label="Basic example"
          :aria-valuenow="promedio"
          aria-valuemin="0"
          aria-valuemax="100"
        >
          <div class="progress-bar" :style="{ width: promedio + '%' }"></div>
        </div>
      </div>
      <div class="col-12">
        <div class="mb-2">
          <span class="perfil-titulos">Sobre mí</span>
        </div>
        <div class="mb-2">
          <textarea
            class="form-control textarea-sobreMi"
            v-model="sobreMi"
          ></textarea>
        </div>
      </div>
      <div class="col-12">
        <div class="d-flex justify-content-center">
          <button class="btn btn-primary" @click="updateSobreMi">
            Actualizar
          </button>
        </div>
      </div>
    </div>
    <!--{{ user_profile }}-->
  </PopUp>

  <YowiBot
    :showMessage="showMessage2"
    :messageText="`<p class='texto-caja'>
                        ${mensaje}
                    </p>`"
    @update:showMessage="showMessage2 = $event">
    <template #contenidoextra>
      <div class="text-center" style="padding-top: 0%;">
        <button @click="logoutUser" class="btn reiniciar">Salir</button>
      </div>
    </template>
  </YowiBot>


</template>

<script>
import { computed, ref } from "vue";
import { useStore } from "vuex";
import { useRouter } from "vue-router";
import quickMenu from "./MenuHamburguer.vue";
import PopUp from "../Modal/ModalSolid.vue";
import IconoPerfil from "../IconPerfil/IconoPerfil.vue";
import YowiBot from '@/components/BotYowi/YowiBot.vue';

 //--------Imagenes
import logoUC3GWhite from '@/assets/images/generales/logoUC3G.svg'
import logoUC3GGold from '@/assets/images/generales/UCT.svg';

export default {
  name: "NavBarUCT",
  components: {
    quickMenu,
    PopUp,
    IconoPerfil,
    YowiBot
  },
  props: {
    user_profile: Object, // Espera un objeto de perfil de usuario
    default: () => ({
      // Valor por defecto de la propiedad
      nombres: "Nombre Completo",
      apellido_paterno: "",
      apellido_materno: "",
    }),
  },
  setup(props) {
    const store = useStore();
    const router = useRouter();
    const PopUpUsuarioPerfil = ref(false);
    const sobreMi = ref(props.user_profile.sobre_mi);
    const correoPersonal = ref(props.user_profile.correo_personal);
    const showMessage2 = ref(false);
    const mensaje = ref('');
    
    // Usa una propiedad computada para manejar el nombre del usuario
    const userName = computed(
      () =>
        `${props.user_profile.nombres} ${props.user_profile.apellido_paterno} ${props.user_profile.apellido_materno}`
    );

    const puesto = computed(() => `${props.user_profile.nombre_puesto}`);

    const nombres = computed(() => `${props.user_profile.nombres}`);

    const apellidos = computed(
      () =>
        `${props.user_profile.apellido_paterno} ${props.user_profile.apellido_materno}`
    );

    const area = computed(() => `${props.user_profile.nombre_area}`);

    const temaActual = computed(() => {
      return store.getters['tema/getTemaActual']
    });

    //UsuarioCompetencias
    const promedio = computed(
      () => store.getters["UsuarioCompetencias/promedioAvance"]
    );

    /**
     *********     HAMBURGUER FUNCTION   ************************
     */
    const functionHamburguer = (index) => {
      //Funciones que se disparan en los botones del menu de hamburguesa
      switch (index) {
        case 0:
          PopUpUsuarioPerfil.value = true;
          break;
        case 2:
          {
            // showMessage2.value = true;
            // mensaje.value = `<h3 class='titulo'>Estimado Colaborador.</h3>
            //               <p  class='texto-caja'>
            //               Si retrocedes, saldrás del sistema. ¿Deseas continuar?
            //               </p>`;
            // const confirmLeave = confirm('Si retrocedes, saldrás del sistema. ¿Deseas continuar?');
            // console.log(confirmLeave);
            // if (confirmLeave) {
              logoutUser();
            // } 
            
          }
          break;
      }
    };

    //EVENTOS PARA EL MENU HAMBURGUER
    const logoutUser = () => {
      // store.dispatch("user/logout"); // Llamar a la acción de logout
      router.push("/login"); // Redireccionar al usuario a la pantalla de inicio de sesión
    };

    const updateSobreMi = () => {
      const nuevoSobreMi = {
        id_usuario_metricas: props.user_profile.id_usuario_metricas,
        sobre_mi: sobreMi.value,
        id_usuario: props.user_profile.id_usuario,
        correo_personal: correoPersonal.value,
      };
      store.dispatch("user/actualizarSobreMi", nuevoSobreMi);
    };

    return {
      userName,
      puesto,
      nombres,
      apellidos,
      area,
      logoUC3GWhite,
      logoUC3GGold,
      functionHamburguer,
      PopUpUsuarioPerfil,
      sobreMi,
      updateSobreMi,
      promedio,
      correoPersonal,
      temaActual,
      showMessage2,
      mensaje,
      logoutUser
    }; // Devuelve userName en lugar de user_profile
  },
};
</script>

<style scoped>
.popup-container {
  padding: 0 15px;
  overflow-x: hidden;
}

.navBarUCT-content {
  z-index: 1;
  position: relative;
}

.icon-img-perfil {
  filter: invert(1);
  width: 30px;
}

.icon-img-perfil-content {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: var(--glassBlue);
  backdrop-filter: blur(10px);
  display: flex;
  justify-content: center;
  align-items: center;
}

.icono-perfil-container {
  width: 150px;
  height: 150px;
  font-size: 90%;
}

.Dashboard-logouct-content {
  width: 50px;
  height: 50px;
  position: relative;
  justify-content: center;
  align-items: center;
  display: flex;
}

.Dashboard-logouct {
  width: 60px;
  position: absolute;
}

.Dashboard-logouct-Gold{
        width: 55px;
        position: absolute;
    }

.perfil-titulos {
  font-size: large;
  color: #4d4d4d;
  text-transform: uppercase;
  font-style: italic;
  font-weight: 900;
}

.input-text {
  width: 100%;
  font-size: 0.8em;
  resize: none;
  background-color: var(--blueBerryPastel);
  border: none;
  padding: 10px;
  box-sizing: border-box;
  outline: none;
  border-radius: 0 15px 15px 0;
}

.input-opciones {
  width: 100%;
  font-size: 0.8em;
  resize: none;
  background-color: var(--blueBerryPastel);
  border: none;
  padding: 10px;
  box-sizing: border-box;
  outline: none;
  border-radius: 15px 0;
}

.icono-medallas {
  position: absolute;
  right: 0;
  top: -20%;
  border-radius: 50%;
  text-align: center;
  width: 60px;
  height: 60px;
  padding: 6px 0 0 0;
  border: 4px solid #d1d1d1;
  background-color: #f0f0f0;
  background-image: linear-gradient(145deg, #e0e0e0, #cccccc);
  box-sizing: border-box;
  box-shadow: 0 12px 25px -4px rgba(109, 109, 109, 0.4),
    0 -10px 15px -1px rgba(255, 255, 255, 0.77), inset 2px 2px 0 #c1c1c1,
    inset -2px -2px 0px #e8e8e8;
}

.progress {
  border-radius: 0 15px 15px 0;
  height: 40px;
  background-color: var(--babyBlue);
}

.progress-bar {
  border-radius: 0 15px 15px 0;
  background: linear-gradient(
    90deg,
    var(--purple-sb-70) 0%,
    var(--bluelight-sb-70) 100%
  );
}

.textarea-sobreMi {
  width: 100%;
  height: 120px;
  resize: none;
  background-color: var(--blueBerryPastel);
  border: none;
  box-sizing: border-box;
  outline: none;
  border-radius: 15px 15px 0 0;
  border-bottom: 2px solid var(--purple-sb);
  scrollbar-width: none;
}

.margen {
  margin-bottom: 10px !important;
}

@media (min-width: 993px) and (max-width: 1199px) {
  .margen {
    margin-bottom: 5px !important;
  }

  .perfil-titulos {
    font-size: medium;
  }

  .input-text {
    padding: 5px;
  }

  .input-opciones {
    margin-top: 5px;
    padding: 5px;
  }

  .textarea-sobreMi {
    height: 100px;
    scrollbar-width: none;
  }

  .margen-medallas {
    margin-top: 25px !important;
  }
}

@media (max-width: 992px) {
  .margen {
    margin-bottom: 5px !important;
  }

  .margen-medallas {
    margin-top: 25px !important;
  }

  .perfil-titulos {
    font-size: small;
  }

  .progress {
    height: 20px;
  }

  .textarea-sobreMi {
    height: 80px;
  }
}

.reiniciar{
    background-color: #f9635c;
    color: var(--blanco)
}

</style>
