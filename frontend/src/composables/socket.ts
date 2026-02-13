import {createGlobalState} from "@vueuse/core";

function useSocket() {
  const socket = new WebSocket("ws://localhost:8080");

  socket.addEventListener("message", message => {
    for (let listener of Array.from(listeners)) {
      listener(JSON.parse(message.data));
    }
  });

  const listeners = new Set<(data: any) => void>();

  function subscribe(listener: (data: any) => void) {
    listeners.add(listener);
  }

  function send(data: any) {
    if (socket.readyState === 1) {
      socket.send(JSON.stringify(data));
    } else {
      setTimeout(() => {
        socket.send(JSON.stringify(data));
      }, 200);
    }
  }

  return {
    socket,
    send,
    subscribe
  }
}

export default createGlobalState(useSocket);