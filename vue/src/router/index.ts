import { createWebHistory, createRouter } from "vue-router";
import { getAccessToken, isGuestMode } from "@/utils/auth";

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

router.beforeEach((to) => {
  const token = getAccessToken();
  const guest = isGuestMode();
  const hasSession = Boolean(token) || guest;
  const isAuthPage = to.name === "SignInView" || to.name === "SignUpView";
  const isWritePage = to.name === "PostWrite" || to.name === "PostEdit";

  if (hasSession && isAuthPage) {
    return { name: "BoardView" };
  }

  if (!hasSession && !isAuthPage) {
    return { name: "SignInView" };
  }

  if (guest && isWritePage) {
    return { name: "BoardView" };
  }
});

export default router;
