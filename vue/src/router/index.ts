import { createWebHistory, createRouter } from "vue-router";

const routes = [
  {
    path: "/board",
    name: "BoardView",
    component: () => import("@/views/BoardView.vue"),
  },
  {
    path: "/post/:id",
    name: "PostDetail",
    component: () => import("@/views/PostDetailView.vue"),
  },
  {
    path: "/write",
    name: "PostWrite",
    component: () => import("@/views/PostWriteView.vue"),
  },
  {
    path: "/post/:id/edit",
    name: "PostEdit",
    component: () => import("@/views/PostEditView.vue"),
  },
  {
    path: "/",
    name: "SignInView",
    component: () => import("@/views/SignInView.vue"),
  },
  {
    path: "/signUp",
    name: "SignUpView",
    component: () => import("@/views/SignUpView.vue"),
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
