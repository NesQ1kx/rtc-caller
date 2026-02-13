<script setup lang="ts">
import {ref} from "vue";

interface Props {
  muted?: boolean;
}

defineProps<Props>();

const videoRef = ref();

defineExpose({
  videoRef
})
</script>

<template>
  <div>
    <video ref="videoRef" autoplay playsinline :controls="false" :muted="muted" id="local" class="rounded-16 w-[1000px]"></video>
  </div>
</template>
