<script setup lang="ts">
import Button from 'primevue/button';
import useSocket from "../composables/socket.ts";
import {useRouter} from "vue-router";
import {SocketEvents} from "../types/socket.ts";

const socket = useSocket();

const router = useRouter();

function handleCreateRoom() {
  socket.send({ type: SocketEvents.CREATE_ROOM });
}

socket.subscribe((data) => {
  if (data.type === SocketEvents.CREATE_ROOM) {
    router.push(`/call/${data.roomId}`);
  }
});
</script>

<template>
  <div class="h-screen flex justify-center items-center">
    <div class="flex flex-col items-center max-w-[600px]">
      <div class="text-40 text-center">Общайтесь  в ClearCall</div>
      <div class="text-24 text-center mb-32">Полностью анонимно. <br /> Мы не сохраняем данные пользователей</div>
      <Button @click="handleCreateRoom"  label="Создать комнату" severity="primary" size="large" icon="pi pi-phone" rounded  />
    </div>
  </div>
</template>

<style scoped>

</style>