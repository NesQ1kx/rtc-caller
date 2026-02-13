<script setup lang="ts">
import Button from 'primevue/button';

interface Emits {
  exitCall: [];
}

const emit = defineEmits<Emits>();

const isMicroActive = defineModel<boolean>("is-micro-active", { required: true });
const isCameraActive = defineModel<boolean>("is-camera-active", { required: true });

function toggleMicro() {
  isMicroActive.value = !isMicroActive.value;
}

function toggleCamera() {
  isCameraActive.value = !isCameraActive.value;
}
</script>

<template>
  <div class="controls flex items-center gap-16 absolute bottom-12">
    <Button icon="pi pi-microphone"  rounded size="large" :class="{ 'non-active': !isMicroActive }" @click="toggleMicro"/>
    <Button icon="pi pi-camera"  rounded size="large" :class="{ 'non-active': !isCameraActive }" @click="toggleCamera" />
    <Button icon="pi pi-desktop"  rounded size="large" />
    <Button label="Завершить звонок" rounded icon="pi pi-phone" size="large" severity="danger" @click="emit('exitCall')" />
  </div>
</template>
<style scoped>
.controls .non-active {
  background-color: grey;
  border-color: grey;
}
</style>
