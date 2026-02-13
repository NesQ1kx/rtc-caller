import {createRouter, createWebHistory} from "vue-router";

const routes = [
  {
    path: "/",
    component: () => import("./pages/Main.vue"),
  },
  {
    path: "/call/:roomId",
    component: () => import("./pages/Call.vue"),
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;

