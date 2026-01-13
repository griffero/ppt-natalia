import { createRouter, createWebHistory } from "vue-router";
import FormView from "./views/FormView.vue";
import WallView from "./views/WallView.vue";

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: "/", name: "form", component: FormView },
    { path: "/wall", name: "wall", component: WallView },
  ],
});


