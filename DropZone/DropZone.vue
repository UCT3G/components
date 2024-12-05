<template>
  <div>
    <div ref="dropRef" class="dropzone custom-dropzone"></div>
    <div class="dropzone preview-container"></div>
  </div>
</template>

<script>
import { ref, onMounted, defineComponent } from 'vue'
import { Dropzone } from 'dropzone'
import { useStore } from 'vuex'
import axios from '@/../axios-config.js'
import { toast } from 'vue3-toastify'

export default defineComponent({
  name: 'DropzoneUCT',
  props: {
      paramName: {
          type: String,
          default: 'file'
      },
      url_api: {
          type: String,
          default: 'https://backendUrl/uploadFile/'
      },
      acceptedFiles: {
          type: String,
          default: '.jpg,.png,.jpeg,.webp,.pdf,.doc,.docx,.zip'
      },
      other_data: {
          type: Array,
          default: () => []
      },
      maxsizeMB: {
          type: Number,
          default: 10
      },
      maxFiles: {
          type: Number,
          default: 20
      }
  },
  emits: ['uploadStart', 'uploadSuccess', 'uploadError', 'uploadEnd'],
  setup(props, { emit }) {
      const store = useStore()
      const dropRef = ref(null)
      let uploadedFiles = 0 // Variable para contar archivos subidos

      const customPreview = `
      <div class="d-flex flex-wrap dz-preview dz-processing dz-image-preview dz-complete">
          <div class="dz-image">
              <img data-dz-thumbnail>
          </div>
          <div class="dz-details">
              <div class="dz-size"><span data-dz-size></span></div>
              <div class="dz-filename"><span data-dz-name></span></div>
          </div>
          <div class="dz-progress">
              <span class="dz-upload" data-dz-uploadprogress></span>
          </div>
          <div class="dz-error-message"><span data-dz-errormessage></span></div>
          <div class="dz-success-mark">
              <i class="bi bi-check-circle-fill" style="font-size: 2rem; color: green;"></i>
          </div>
          <div class="dz-error-mark">
              <i class="bi bi-exclamation-circle-fill" style="font-size: 2rem; color: red;"></i>
          </div>
      </div>
      `

      const uploadStart = async ({ formData, file, myDropzone }) => {
          emit('uploadStart', { formData, file })
          myDropzone.processQueue()
      }

      const handleUploadSuccess = (data) => {
          emit('uploadSuccess', data)
      }

      const handleUploadError = (error) => {
          emit('uploadError', error)
      }

      const checkIfAllFilesUploaded = () => {
          uploadedFiles += 1
          const totalFiles = dropRef.value.dropzone.getAcceptedFiles().length
          if (uploadedFiles === totalFiles) {
              emit('uploadEnd')
              uploadedFiles = 0 // Reinicia el contador
          }
      }

      onMounted(() => {
          if (dropRef.value !== null) {
              const myDropzone = new Dropzone(dropRef.value, {
                  url: props.url_api,
                  autoProcessQueue: false,
                  paramName: props.paramName,
                  acceptedFiles: props.acceptedFiles,
                  previewTemplate: customPreview,
                  previewsContainer: dropRef.value.parentElement.querySelector('.preview-container'),
                  maxFiles: props.maxFiles,
                  uploadMultiple: true
              })

              myDropzone.on('error', function (file, errorMessage, xhr) {
                  console.error('Error en la carga:', errorMessage)
                  const dzErrorMessageElement = file.previewElement.querySelector("[data-dz-errormessage]")
                  if (xhr && xhr.status === 400) {
                      dzErrorMessageElement.textContent = "Error al subir el archivo. Verifica los datos y vuelve a intentarlo."
                  } else if (xhr && xhr.status === 500) {
                      dzErrorMessageElement.textContent = "Error interno del servidor. Inténtalo más tarde."
                  } else {
                      dzErrorMessageElement.textContent = "Error desconocido al intentar subir el archivo."
                  }
                  dzErrorMessageElement.style.display = 'none'
              })

              myDropzone.on('addedfile', async function (file) {
                  if (file.size > props.maxsizeMB * 1024 * 1024) {
                      myDropzone.removeFile(file)
                      toast.error(`El tamaño máximo del archivo es: ${props.maxsizeMB} MB`, {
                          position: toast.POSITION.BOTTOM_LEFT,
                          timeout: 4000,
                          closeOnClick: true,
                          pauseOnHover: true,
                          draggable: true
                      })
                      return
                  }

                  const formData = new FormData()
                  formData.append(props.paramName, file)
                  props.other_data.forEach(data => {
                      formData.append(data.name, data.value)
                  })

                  uploadStart({ formData, file, myDropzone })

                  axios.post(props.url_api, formData, {
                      headers: {
                          'Authorization': 'Bearer ' + store.state.user.token,
                          'Content-Type': 'multipart/form-data'
                      }
                  }).then(response => {
                      file.previewElement.classList.add("dz-success")
                      handleUploadSuccess(response.data)
                      checkIfAllFilesUploaded() // Llama a la función después de cada carga exitosa
                  }).catch(error => {
                      console.error(error)
                      file.previewElement.classList.add("dz-error")
                      handleUploadError(error)
                      checkIfAllFilesUploaded() // Asegura que también se llame en caso de error
                  })
              })

              if (dropRef.value.querySelector('.dz-default')) {
                  dropRef.value.querySelector('.dz-default').innerHTML = `
                  <div style="display: flex; justify-content: center;">
                      <i class="bi bi-cloud-arrow-up-fill" style="font-size: 5rem;"></i>
                  </div>
                  <p style="text-align: center; margin: 0;"><strong>Arrastra y suelta tu archivo</strong></p>
                  `
              }
          }
      })

      return {
          dropRef
      }
  }
})
</script>

<style scoped>
.custom-dropzone {
  border-style: dashed;
  border-width: 3px;
  padding: 20px;
  color: rgb(114, 114, 114);
}
.dz-error-message {
  color: red;
  display: none!important;
}
</style>
