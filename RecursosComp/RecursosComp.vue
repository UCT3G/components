<template>
    <LoadingScreen :visible="LoadingS" />

    <!-- Contenedor de contenido dinámico -->
    <div class="contenido-recurso">
        <template v-if="temaSeleccionado.recurso_basico_tipo == 'VIDEO'">
            <video controls :src="temaSeleccionado.recurso_url" @canplaythrough="handleVideoLoad"></video>
        </template>

        <template v-else-if="temaSeleccionado.recurso_basico_tipo == 'IMAGEN'">
            <img class="img-contenido-recurso" :src="temaSeleccionado.recurso_url" @load="handleVideoLoad" alt="Imagen" :class="{ zoom: isZoomed }"
            @click="toggleZoom" />
        </template>

        <template v-else-if="temaSeleccionado.recurso_basico_tipo == 'PRESENCIAL'">
            <img class="img-contenido-recurso" width="800" src="@/assets/images/recurso-presencial.png" alt="Imagen" @load="handleVideoLoad" />
        </template>

        <template v-else-if="
            temaSeleccionado.recurso_basico_tipo == 'DOCUMENTO' ||
            temaSeleccionado.recurso_basico_tipo == 'ARCHIVO'
        ">
            <a @click.prevent="descargarArchivo(1)">
            <img class="img-contenido-recurso" width="800" src="@/assets/images/archivo-general.png" alt="Imagen" @load="handleVideoLoad" />
            </a>
        </template>

        <template v-else-if="temaSeleccionado.recurso_basico_tipo == 'PRACTICA'">
            <div class="contenido-recurso-practica">
            <div class="w3-row w3-margin">
                <a class="a-fondo-morado" href="" @click.prevent="descargarArchivo(1)">
                <b>DESCARGAR PRÁCTICA</b>
                </a>

                <div class="a-fondo-verde">
                <span>Cargar Practica</span>
                <input type="file" @change="handleFileUpload" sizetag="4Mb" />
                </div>

                <a class="a-fondo-azul" href="" @click.prevent="descargarArchivo(2)">
                <b>EVIDENCIA</b>
                </a>
            </div>
            <div class="ObservacionesClass">
                <input type="text" :value="temaSeleccionado.observaciones" readonly />
            </div>
            <img class="img-contenido-recurso" style="width: 650px" src="@/assets/images/practica-guia.png" alt="Imagen"
                @load="handleVideoLoad" />
            </div>
        </template>

        <template v-else-if="temaSeleccionado.recurso_basico_tipo == 'PDF'">
            <iframe :src="temaSeleccionado.recurso_url" class="classiframe" @load="handleVideoLoad"></iframe>
        </template>

        <template v-else-if="temaSeleccionado.recurso_basico_tipo == 'PRESENTACION'">
            <div class="carousel-container">
            <carousel :items-to-show="1">
                <slide v-for="(image, index) in temaSeleccionado.slide_images" :key="index" class="bordershadow">
                <div class="carousel__item">
                    <img :src="image" alt="Slide" class="carousel-image img-contenido-recurso" @load="handleVideoLoad" />
                </div>
                </slide>
                <template #addons>
                <navigation />
                <pagination />
                </template>
            </carousel>
            </div>
        </template>

        <template v-else-if="temaSeleccionado.recurso_basico_tipo == 'INTERACTIVO'">
            <iframe ref="iframeRef" class="iframeHTML" :src="interactiveUrl" @load="handleVideoLoad" frameborder="0">
            </iframe>
        </template>

        <template v-else-if="
            temaSeleccionado.recurso_basico_tipo == 'EVALUACION' ||
            temaSeleccionado.recurso_basico_tipo == 'QUIZ' || temaSeleccionado.recurso_basico_tipo == 'ENCUESTA'
        ">
            <!-- Contenedor flexible para YowiBot -->
            <div class="encuestas-center-content">
            <ComicBallon :config="{ borde: 'bottom', y: 50 }" :textoHTML="mensaje" />
            <BotonYowi v-if="temaSeleccionado.recurso_basico_tipo == 'EVALUACION'" class="btnCenter"
              width_icon="13px" iconName="FACULTADES-04.svg" @click="AbrirEvaluacion">Contestar Evaluación
            </BotonYowi>
            <BotonYowi v-if="temaSeleccionado.recurso_basico_tipo == 'ENCUESTA'" class="btnCenter" width_icon="13px"
                iconName="FACULTADES-04.svg" @click="AbrirEncuesta">Contestar Encuesta</BotonYowi>
            <img class="img-fluid yowiEncuestas" :src="yowiEncuestas" alt="Yowi Encuestas" @load="handleVideoLoad" />
            </div>
        </template>
    </div>
  </template>
  
  <script>
import axios from "@/../axios-config.js";
import { defineComponent, onMounted, ref, watch } from "vue";
import { DEV_BASE_URL } from "@/../axios-config.js";
import { useStore } from "vuex";
//   import DynamicSvgLoader from "@/components/LoaderSVG/LoaderSVG.vue";
import ComicBallon from "@/components/ComicBallon/ComicBallon.vue";
import BotonYowi from "@/components/ButtonWithIcon/ButtonYowi.vue";
import LoadingScreen from "@/components/Loading/LoadingScreen.vue";
import { Carousel, Slide, Navigation, Pagination } from "vue3-carousel";
import yowiEncuestas from "@/assets/images/generales/yowiEncuestas.png";
  
  export default defineComponent({
    data() {
      return {
        isZoomed: false,
      };
    },
    components: {
    //   DynamicSvgLoader
        Carousel,
        Slide,
        Navigation,
        Pagination,
        BotonYowi,
        ComicBallon,
        LoadingScreen
    },
    props: {
        temaSeleccionado: {
            type: Object,  // Aquí defines que el prop es de tipo objeto
            required: true
      },
    },
    computed: {
      interactiveUrl() {
        console.log("HOLIIIIIIII");
        if (this.temaSeleccionado.recurso_basico_tipo == "INTERACTIVO") {
          const rutaRecurso = this.temaSeleccionado.ruta_recurso; // Ruta como: data/UC3G_MATERIAS/materia1012/unidad1103/tema3745/recurso_basico
          const partes = rutaRecurso.split("/"); // Divide la ruta en partes

          const materia = partes[2].replace("materia", ""); // Obtener el id de materia
          const unidad = partes[3].replace("unidad", ""); // Obtener el id de unidad
          const tema = partes[4].replace("tema", ""); // Obtener el id de tema

          var servidor = "";
          // Llamada a interactive.html y paso de parámetros en la URL
          if (DEV_BASE_URL == "http://localhost:8000") {
            servidor = "http://localhost:8080/interactive.html";
          } else {
            servidor = DEV_BASE_URL + "static/interactive.html";
          }

          // servidor = 'https://uct.tresguerras.com.mx:8000/static/interactive.html'

          const url = new URL(servidor);
          console.log("URL: " + url);

          // Pasar parámetros a interactive.html
          url.searchParams.set("materia", materia);
          url.searchParams.set("unidad", unidad);
          url.searchParams.set("tema", tema);
          url.searchParams.set("ruta_recurso", rutaRecurso);

          return url.toString(); // Devuelve la URL a interactive.html con los parámetros
        }
        return "";
      },
    },
    methods:{
      toggleZoom() {
        this.isZoomed = !this.isZoomed; // Alterna entre el estado de zoom y normal
      },
    },
    setup(props, {emit}) {

      const store = useStore();
      const LoadingS = ref(false);
      const mensaje = ref("");
      const showMessage = ref(false);

       // RECUPERAMOS EL TOKEN
      const getCredenciales = () => {
        const token = store.state.user.token; // Ajusta según la estructura de tu store
        return {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        };
      };

      onMounted(() =>{
        console.log("HOLI SI ENTRE")
        LoadingS.value = true;

        const newTemaSeleccionado = props.temaSeleccionado;
        const tipotema = newTemaSeleccionado.recurso_basico_tipo;
        if (tipotema == "EVALUACION") {
        console.log("INTENTOS");
        console.log(newTemaSeleccionado.intentos_consumidos);

          const intentosConsumidos = newTemaSeleccionado.intentos_consumidos;
          const maximointentos = newTemaSeleccionado.intentos_disponibles;

          if (intentosConsumidos <= maximointentos) {
            mensaje.value = `<h3 class='titulo'>Estimado estudiante.</h3>
                          <p  class='texto-caja'>
                          ¡Estás por iniciar una evaluación! La calificación mínima es de <b> 80 </b>.<br>
                          Esto contará como <b> ${intentosConsumidos + 1
              } oportunidad(es) de las ${maximointentos} disponibles. </b>,
                          Al aceptar, estás indicando que has revisado y entendido los contenidos previos y que estás listo para contestar tu evaluación.
                          (Abrir la evaluación para sólo ver las preguntas <b> ES HACER TRAMPA </b>, aún cuando no contestes nada cuenta como una oportunidad)
                          </p>`;
          } else {
            mensaje.value = `<h3 class='titulo'>Estimado estudiante.</h3>
                          <p  class='texto-caja'>
                            Has alcanzado el límite máximo de intentos, contacta con el administrador de la competencia para una nueva oportunidad.
                          </p>`;
          }
          showMessage.value = true;
        } else if (tipotema == "QUIZ") {
          mensaje.value = `<h3 class='titulo'>Estimado estudiante.</h3>
                          <p  class='texto-caja'>
                          ¡Estás por iniciar un QUIZ! Aquí no hay calificación mínima.<br>
                          Estos no tienen cantidad limite de intentos. !Buena Suerte!
                          </p>`;
        } else if (tipotema == "ENCUESTA") {
          mensaje.value = `<h3 class='titulo'>Estimado estudiante.</h3>
                          <p  class='texto-caja'>
                          ¡Estás por iniciar una ENCUESTA! Aquí no hay calificación mínima.<br>
                          Estos no tienen cantidad limite de intentos. !Buena suerte!
                          </p>`;
        } 
      });

      watch(() => {
        console.log("HOLAAAA");
        const newTemaSeleccionado = props.temaSeleccionado;
        const tipotema = newTemaSeleccionado.recurso_basico_tipo;
        if (tipotema == "EVALUACION") {
        console.log("INTENTOS");
        console.log(newTemaSeleccionado.intentos_consumidos);

          const intentosConsumidos = newTemaSeleccionado.intentos_consumidos;
          const maximointentos = newTemaSeleccionado.intentos_disponibles;

          if (intentosConsumidos <= maximointentos) {
            mensaje.value = `<h3 class='titulo'>Estimado estudiante.</h3>
                          <p  class='texto-caja'>
                          ¡Estás por iniciar una evaluación! La calificación mínima es de <b> 80 </b>.<br>
                          Esto contará como <b> ${intentosConsumidos + 1
              } oportunidad(es) de las ${maximointentos} disponibles. </b>,
                          Al aceptar, estás indicando que has revisado y entendido los contenidos previos y que estás listo para contestar tu evaluación.
                          (Abrir la evaluación para sólo ver las preguntas <b> ES HACER TRAMPA </b>, aún cuando no contestes nada cuenta como una oportunidad)
                          </p>`;
          } else {
            mensaje.value = `<h3 class='titulo'>Estimado estudiante.</h3>
                          <p  class='texto-caja'>
                            Has alcanzado el límite máximo de intentos, contacta con el administrador de la competencia para una nueva oportunidad.
                          </p>`;
          }
          showMessage.value = true;
        } else if (tipotema == "QUIZ") {
          mensaje.value = `<h3 class='titulo'>Estimado estudiante.</h3>
                          <p  class='texto-caja'>
                          ¡Estás por iniciar un QUIZ! Aquí no hay calificación mínima.<br>
                          Estos no tienen cantidad limite de intentos. !Buena Suerte!
                          </p>`;
        }else if (tipotema == "ENCUESTA") {
          mensaje.value = `<h3 class='titulo'>Estimado estudiante.</h3>
                          <p  class='texto-caja'>
                          ¡Estás por iniciar una ENCUESTA! Aquí no hay calificación mínima.<br>
                          Estos no tienen cantidad limite de intentos. !Buena suerte!
                          </p>`;
        } 
      });

        const AbrirEvaluacion = () => {
          emit('verificarTemas', props.temaSeleccionado)
        }

        const AbrirEncuesta = () => {
          emit('AbrirEncuesta', props.temaSeleccionado)
        }

        const handleVideoLoad = () => {
            LoadingS.value = false; // Oculta la ventana de carga
        };


        const descargarArchivo = async (dato) => {
          // Extraer los segmentos de la ruta
          const rutaRecursoN = props.temaSeleccionado.ruta_recurso; // Por ejemplo: data/UC3G_MATERIAS/materia1012/unidad1103/tema3745/recurso_basico.doc

          // Reemplazar todas las barras invertidas (\) por barras normales (/)
          const rutaRecurso = rutaRecursoN.replace(/\\/g, "/");

          const partes = rutaRecurso.split("/");

          const materiaId = partes[2].replace("materia", ""); // Obtener el id de materia
          const unidadId = partes[3].replace("unidad", ""); // Obtener el id de unidad
          const temaId = partes[4].replace("tema", ""); // Obtener el id de tema
          var linkcompleto = "";
          var fileName = "";
          // Construir la URL para la descarga
          if (dato == 1) {
            fileName = partes[5]; // Nombre del archivo
            if (DEV_BASE_URL == "http://localhost:8000") {
              linkcompleto = `http://localhost:8000/descargar/${materiaId}/${unidadId}/${temaId}/${fileName}`;
            } else {
              linkcompleto = `${DEV_BASE_URL}descargar/${materiaId}/${unidadId}/${temaId}/${fileName}`;
            }
          } else {
            const usuarioid = store.state.user.userProfile.id_usuario;
            fileName = "practica_tema" + temaId + ".pdf";
            if (DEV_BASE_URL == "http://localhost:8000") {
              linkcompleto = `http://localhost:8000/descargarPractica/${usuarioid}/${fileName}`;
            } else {
              linkcompleto = `${DEV_BASE_URL}descargarPractica/${usuarioid}/${fileName}`;
            }
          }

          // Hacer la solicitud al servidor
          try {
            const response = await fetch(linkcompleto);

            if (!response.ok) {
              // Manejar el error, por ejemplo, si el archivo no se encuentra
              const errorData = await response.json(); // Obtener el mensaje de error
              alert(errorData.comentario); // Mostrar el mensaje de error al usuario
              return;
            }

            // Crear un blob del archivo recibido
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);

            // Crear el link para la descarga
            const link = document.createElement("a");
            link.href = url;
            link.download = fileName; // Establecer el nombre de descarga
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url); // Liberar la memoria del objeto URL
          } catch (error) {
            console.error("Error al descargar el archivo:", error);
          }
        };

        //SUBIR ARCHIVOS DE PRACTICA
        const handleFileUpload = async (event) => {
          const file = event.target.files[0];

          // Validar si es un archivo PDF
          if (file.type !== "application/pdf") {
            alert("SOLAMENTE SE PERMITEN ARCHIVOS PDF");
            return;
          }

          // Validar el tamaño del archivo (máximo 4 MB)
          const maxSize = 4 * 1024 * 1024; // 4 MB en bytes
          if (file.size > maxSize) {
            alert("EL ARCHIVO NO DEBE SUPERAR LOS 4MB");
            return;
          }

          const formData = new FormData();
          formData.append("file", file);

          try {
            const rutaRecursoN = props.temaSeleccionado.ruta_recurso; // Por ejemplo: data/UC3G_MATERIAS/materia1012/unidad1103/tema3745/recurso_basico.doc

            // Reemplazar todas las barras invertidas (\) por barras normales (/)
            const rutaRecurso = rutaRecursoN.replace(/\\/g, "/");

            const partes = rutaRecurso.split("/"); // Divide la ruta en partes
            const idtema = partes[4].replace("tema", ""); // Obtener el id de tema
            const usuario = store.state.user.userProfile.id_usuario;
            console.log("RUTA: " + rutaRecurso);
            console.log("TEMAAA: " + idtema);
            formData.append("usuario", usuario);
            formData.append("idtema", idtema);

            const headers = getCredenciales();
            const response = await axios.post(
              "/CURSOS/subirPracticaUsuario",
              formData,
              headers
            );

            console.log(response);
          } catch (error) {
            console.error("Error en la subida del archivo:", error);
            alert("Hubo un error al subir el archivo.");
          }
        };

        return {
            handleVideoLoad,
            LoadingS,
            yowiEncuestas,
            mensaje,
            showMessage,
            AbrirEvaluacion,
            descargarArchivo,
            handleFileUpload,
            AbrirEncuesta
            // interactiveUrl
        }

     },
  });
  </script>
  
<style scoped>

.contenido-recurso {
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
}

.carousel-container {
  width: 100%;
  max-width: 63%; /* Limita el ancho máximo al 100% del contenedor padre */
  margin: 0 auto;
  /* Centra el contenedor horizontalmente */
}

.carousel__viewport {
  box-shadow: 0px 0px 50px 0px rgba(0, 0, 0, 90); /* Sombra alrededor del viewport */
  border-radius: 8px; /* Opcional: si quieres bordes redondeados */
  overflow: hidden; /* Para asegurarte de que el contenido no se salga de los bordes */
}

/* Ajusta el tamaño de los elementos del carrusel */
.carousel__item {
  width: 100%;
  max-height: 600px;
  box-shadow: 0px 0px 8px rgba(0, 0, 0, 50); 
  border-radius: 8px; /* Opcional: para redondear bordes */
  overflow: hidden; /* Para evitar que el contenido sobresalga del borde redondeado */
  /* Limita la altura del slide */
}

/* Asegura que las imágenes no sean más grandes que el contenedor */
.carousel-image {
  width: 100%;
  max-width: 100%;
  height: auto;
  max-height: 100%;
  object-fit: contain;
  /* Ajusta la imagen dentro del contenedor */
}


.contenido-recurso-practica {
  margin-top: 35px;
  display: flex;
  flex-direction: column;
  /* Los elementos se apilan en una columna */
  align-items: center;
  /* Centrar horizontalmente el botón y la imagen */
}

.contenido-recurso video {
  max-width: 100%;
  max-height: 100%;
  width: auto;
  height: auto;
  object-fit: contain;
  /* Esto mantendrá la proporción del contenido */
  box-shadow: 0px 0px 25px 0px rgba(0, 0, 0, 1); /* Sombra alrededor del viewport */
  border-radius: 8px;
}

/* .contenido-recurso img {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  transition: transform 0.3s ease, max-width 0.3s ease, max-height 0.3s ease;
  cursor: zoom-in;
  box-shadow: 0px 0px 25px 0px rgba(0, 0, 0, 1); 
  border-radius: 8px; 
} */

.img-contenido-recurso {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  transition: transform 0.3s ease, max-width 0.3s ease, max-height 0.3s ease;
  cursor: zoom-in;
  box-shadow: 0px 0px 25px 0px rgba(0, 0, 0, 1); /* Sombra alrededor del viewport */
  border-radius: 8px; /* Bordes redondeados */
}

.contenido-recurso img.zoom { 
  transform: scale(2.5);
  /* Ajusta este valor según lo que necesites */
  transform-origin: top center;
  /* Ajustamos el origen del zoom */
  object-fit: contain;
  cursor: zoom-out;
  transition: transform 0.3s ease;
  max-width: 100%;
  /* No permitimos que el ancho exceda el contenedor */
  max-height: 100%;
  /* Evitamos que se desborde del alto del contenedor */
}

/* Ajustes zoom para pantallas más pequeñas */
@media (max-width: 900px) {
  .contenido-recurso img.zoom {
    transform: scale(2);
    /* Ajusta este valor según lo que necesites */
  }

  .contenido-recurso-practica {
    margin-top: 75px;
    display: flex;
    flex-direction: column;
    /* Los elementos se apilan en una columna */
    align-items: center;
    /* Centrar horizontalmente el botón y la imagen */
  }
}

/* Ajustes zoom para pantallas más pequeñas */
@media (max-width: 768px) {
  .contenido-recurso img.zoom {
    transform: scale(1.5);
    /* Ajusta este valor según lo que necesites */
  }
}

/* Ajustes zoom para pantallas más pequeñas */
@media (max-width: 568px) {
  .contenido-recurso img.zoom {
    transform: scale(1);
    /* Ajusta este valor según lo que necesites */
  }
}

/* Ajustes para pantallas pequeñas */
@media (max-width: 768px) {
  .contenido-recurso {
    margin: 20px 0px;
    max-width: 100vw;
    max-height: 100vh;
  }
}

.iframeHTML {
  width: 100vw !important;
  height: 100vh !important;
  box-shadow: 0px 0px 25px 0px rgba(0, 0, 0, 1); /* Sombra alrededor del viewport */
  border-radius: 8px; /* Opcional: si quieres bordes redondeados */
}

.encuestas-center-content {
  color: var(--blueBerryGlass);
  color: var(--card-title-color);
  font-weight: bolder;
  font-size: xx-large;
  position: absolute;
  top: 225px;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 1;
  width: 80%;
}

.yowiEncuestas {
  width: 100px;
  max-height: 150%;
  height: auto;
  display: block;
  position: absolute;
  align-items: center;
  left: calc(50% - 50px);
  top: calc(120% - -30px);
}

.btnCenter {
  height: auto;
  display: block;
  position: absolute;
  left: calc(50% - 100px);
}

@media (max-width: 700px) {
  .yowiEncuestas {
    width: 100px;
    max-height: 110% !important;
    height: auto;
    display: block;
    position: absolute;
    left: calc(50% - 60px);
    top: calc(120% - 0px);
  }
}

@media (max-width: 568px) {
  .yowiEncuestas {
    width: 100px;
    max-height: 80% !important;
    height: auto;
    display: block;
    position: absolute;
    
    top: calc(120% - 0px);
  }

  .contenido-recurso {
    margin: 20px 0px;
    max-width: 100vw;
    max-height: 100vh;
    margin-top: -10px;
  }

  .contenido-recurso-practica {
    margin-top: 0px;
    display: flex;
    flex-direction: column;
    /* Los elementos se apilan en una columna */
    align-items: center;
    /* Centrar horizontalmente el botón y la imagen */
  }
}


.a-fondo-morado {
  background-color: #6a0dad;
  /* Color morado */
  color: white;
  /* Color del texto en blanco */
  padding: 10px 20px;
  /* Añade relleno para que el botón tenga mejor apariencia */
  border-radius: 5px;
  /* Bordes redondeados */
  text-decoration: none;
  /* Elimina el subrayado del enlace */
  display: inline-block;
  /* Hace que el enlace se comporte como un botón */
}

.a-fondo-verde {
  margin-left: 5px;
  background-color: #228b22;
  /* Color morado */
  color: white;
  /* Color del texto en blanco */
  padding: 10px 20px;
  /* Añade relleno para que el botón tenga mejor apariencia */
  border-radius: 5px;
  /* Bordes redondeados */
  text-decoration: none;
  /* Elimina el subrayado del enlace */
  display: inline-block;
  /* Hace que el enlace se comporte como un botón */
}

.a-fondo-azul {
  margin-left: 5px;
  background-color: #007ba7;
  /* Color morado */
  color: white;
  /* Color del texto en blanco */
  padding: 10px 20px;
  /* Añade relleno para que el botón tenga mejor apariencia */
  border-radius: 5px;
  /* Bordes redondeados */
  text-decoration: none;
  /* Elimina el subrayado del enlace */
  display: inline-block;
  /* Hace que el enlace se comporte como un botón */
}

.ObservacionesClass {
  padding-top: 5px;
  padding-bottom: 5px;
}

</style>
  