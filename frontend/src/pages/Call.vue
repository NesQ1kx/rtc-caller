<script setup lang="ts">
import {onBeforeUnmount, ref, watch} from "vue";
import {useRoute, useRouter} from "vue-router";

import useSocket from "../composables/socket"
import {SocketEvents} from "../types/socket.ts";
import Video from "../components/call/Video.vue";
import CallControls from "../components/call/CallControls.vue";
import {iceServers} from "../const";

const localVideoRef = ref();
const remoteVideoRef = ref();
const localStream = ref<MediaStream | undefined>();

const route = useRoute();
const router = useRouter();

const roomId = route.params.roomId;

const isPeerConnected = ref(false);

const isInitiator = ref(false);

const isMicroActive = ref(true);
const isCameraActive = ref(true);

const configuration = {
  iceServers,
}

const socket = useSocket();

let peerConnection: RTCPeerConnection | null = null;
let tracksAdded = false;

socket.send({
  type: SocketEvents.JOIN_ROOM,
  roomId,
});

socket.subscribe(async (data: any) => {
  if (data.type === SocketEvents.JOIN_ROOM) {
    isInitiator.value = data.isInitiator;
    await start();
    createPeer();

    if (!isInitiator.value) {
      isPeerConnected.value = true;
    }
  }

  if (data.type === SocketEvents.PEER_JOINED && isInitiator.value) {
      remoteVideoRef.value.videoRef.srcObject = null;
      addLocalTracks();
      await makeOffer();
      isPeerConnected.value = true;
  }

    if (data.type === SocketEvents.OFFER) {
      await start();
      createPeer();

      await peerConnection!.setRemoteDescription(data.offer);

      addLocalTracks();

      const answer = await peerConnection!.createAnswer();
      await peerConnection!.setLocalDescription(answer);
      socket.send({ type: SocketEvents.ANSWER, answer, roomId });
    }

    if (data.type === SocketEvents.ANSWER) {
      await peerConnection!.setRemoteDescription(data.answer);
    }

    if (data.type === SocketEvents.ICE) {
      await peerConnection!.addIceCandidate(data.candidate);
    }

    if (data.type === SocketEvents.PEER_DISCONNECTED) {
      isInitiator.value = true;
      cleanupRemote();
    }
});

async function start() {
  if (localStream.value) return;

  try {
    const constraints = { video: true, audio: true };
    localStream.value = await navigator.mediaDevices.getUserMedia(constraints);
    localVideoRef.value.videoRef.srcObject = localStream.value;
  } catch (error) {
    console.error('Error opening video stream from camera.', error);
  }
}

function createPeer() {
  if (peerConnection) return;

  peerConnection = new RTCPeerConnection(configuration);
  if (localStream.value) {
    peerConnection.onicecandidate = e => {
      if (e.candidate) {
        socket.send({
          type: SocketEvents.ICE,
          candidate: e.candidate,
          roomId,
        })
      }
    }


    peerConnection.ontrack = e => {
      remoteVideoRef.value.videoRef.srcObject = e.streams[0];
    }
  }
}

async function makeOffer() {
    const offer = await peerConnection!.createOffer();
    await peerConnection!.setLocalDescription(offer);
    socket.send({ type: SocketEvents.OFFER, offer, roomId });
}

function addLocalTracks() {
  if (tracksAdded) return;
  tracksAdded = true;

  if (localStream.value) {
    localStream.value.getTracks().forEach(track =>
        peerConnection!.addTrack(track, localStream.value!)
    );
  }
}

onBeforeUnmount(() => {
  socket.send({ type: SocketEvents.PEER_DISCONNECTED, roomId });
  cleanupLocal();
});

window.addEventListener('beforeunload', () => {
  socket.send({ type: SocketEvents.PEER_DISCONNECTED, roomId });
  cleanupLocal();
});

function cleanupRemote() {
  remoteVideoRef.value.videoRef.srcObject = null;
  isPeerConnected.value = false;
}

function cleanupLocal() {
  peerConnection!.getSenders().forEach(sender => {
    sender.track?.stop();
  });

  peerConnection!.close();
  peerConnection = null;

  localStream.value?.getTracks().forEach(track => track.stop());
}

function handleCallExit() {
  router.push("/");
}

watch(isCameraActive, val => {
  if (!localStream.value) return;

  localStream.value.getVideoTracks().forEach(track => {
    track.enabled = val;
  });
});

watch(isMicroActive, val => {
  if (!localStream.value) return;

  localStream.value.getAudioTracks().forEach(track => {
    track.enabled = val;
  });
})

</script>

<template>
    <div class="h-screen flex items-center justify-center gap-20 px-32">
      <Video ref="localVideoRef" muted />
      <Video v-show="isPeerConnected" ref="remoteVideoRef" />
      <CallControls v-model:is-micro-active="isMicroActive" v-model:is-camera-active="isCameraActive" @exit-call="handleCallExit" />
    </div>
</template>