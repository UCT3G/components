<template>
  <div class="card card-mapa-funcional" :class="{ 'card-mapa-funcional-alt': condicionBackground }">
    <div class="row">
      <div class="col-4 icono-contenedor"  :class="{ 'icono-contenedor-alterno': condicionBackground }" v-if="MFSN > 0">
        <DynamicSvgLoader
          class="d-block p-0 icono-mapa-funcional"
          fileName="icons/UCT_Recursos/MF_1"
          width_icon="65px"
          :icon_active="false"
        ></DynamicSvgLoader>
      </div>
      <div class="col-4 icono-contenedor"  :class="{ 'icono-contenedor-alterno': condicionBackground }" v-if="MFSN < 0">
        <DynamicSvgLoader
          class="d-block p-0 icono-mapa-funcional"
          fileName="icons/UCT_Recursos/MFN_1"
          width_icon="65px"
          :icon_active="false"
        ></DynamicSvgLoader>
      </div>
      <div class="col-8 contenido">
        <slot name="contenido-card"></slot>
      </div>
    </div>
  </div>
</template>

<script>
import { defineComponent } from "vue";
import DynamicSvgLoader from "@/components/LoaderSVG/LoaderSVG.vue";

export default defineComponent({
  components: {
    DynamicSvgLoader
  },
  props: {
    condicionBackground: {
      type: Boolean,
      default: false,
    },
    MFSN:{
      type: Number,
      default: 0
    }
  },
  setup() { },
});
</script>

<style scoped>
.card-mapa-funcional {
  width: 300px;
  margin-right: 10px;
  display: inline-block;
  max-height: 100px;
  border-radius: 20px;
  align-items: end;
  justify-content: end;
  overflow: hidden;
  border: none;
  box-shadow: rgba(0, 0, 0, 0.16) 0px 3px 6px, rgba(0, 0, 0, 0.23) 0px 3px 6px;
  cursor: pointer;
}

.card-mapa-funcional-alt {
  background: var(--haze);
  box-shadow: none;
}

.row{
  display: flex;
  height: 100%;
}

.icono-contenedor{
  background: linear-gradient(90deg,
      var(--purple-sb) 0%,
      var(--bluelight-sb) 100%);
  max-height: 100%;
  display: flex;
  align-items: center;
  justify-content: end;
}

.icono-contenedor-alterno {
  background: none;
}

.icono-mapa-funcional {
  padding: unset;
  margin-right: 5px;
  fill: var(--blanco);
  cursor: default;
}

.contenido {
  padding: 5px;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  height: 100%;
}
</style>
