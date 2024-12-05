<template>
  <div class="info-button-container">
    <div class="info-card" v-show="showInfoCard">
      <slot></slot>
    </div>
    <div
      class="info-icon"
      @mouseenter="showInfoCard = true"
      @mouseleave="showInfoCard = false"
    >
      <DynamicSvgLoader
        fileName="icons/info"
        width_icon="20px"
      ></DynamicSvgLoader>
    </div>
  </div>
</template>

<script>
import { ref } from "vue";
import DynamicSvgLoader from "@/components/LoaderSVG/LoaderSVG.vue";

export default {
  components: {
    DynamicSvgLoader,
  },
  setup() {
    const showInfoCard = ref(false);

    return {
      showInfoCard
    };
  },
};
</script>

<style scoped>
.info-button-container {
  position: fixed;
  top: 30px;
  right: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  z-index: 100;
}

.info-icon {
  width: 50px;
  height: 50px;
  background: linear-gradient(
    90deg,
    var(--purple-sb) 0%,
    var(--bluelight-sb) 60%
  );
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  transition: background 0.3s ease;
}

.info-icon:hover {
  background: var(--blueBerryPastel);
}

.info-card {
  width: 500px;
  background-color: white;
  padding: 20px;
  box-shadow: 0px 5px 15px rgba(0, 0, 0, 0.2);
  position: absolute;
  top: 60px;
  right: 0;
  transition: opacity 0.3s ease;
  border-radius: 10px;
  z-index: 10;
}

.info-card .card-content {
  font-size: 16px;
  color: #333;
}

.info-card::before {
  content: "";
  position: absolute;
  bottom: -10px;
  right: 20px;
  border-width: 10px;
  border-style: solid;
  border-color: white transparent transparent transparent;
}
</style>
