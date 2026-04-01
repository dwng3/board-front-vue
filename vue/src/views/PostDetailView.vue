<script setup>
import { onMounted, ref } from "vue";
import { RouterLink, useRoute, useRouter } from "vue-router";
import PostDetail from "@/components/board/PostDetail.vue";
import {
  clearAccessToken,
  createAuthHeaders,
  getAccessToken,
  getAuthUsername,
} from "@/utils/auth";

const route = useRoute();
const router = useRouter();
const post = ref(null);
const currentUsername = ref(getAuthUsername());

function moveToSignIn() {
  clearAccessToken();
  router.push({ name: "SignInView" });
}

async function fetchPost() {
  if (!getAccessToken()) {
    moveToSignIn();
    return;
  }

  const id = route.params.id;

  const response = await fetch(`/api/boards/${id}`, {
    headers: createAuthHeaders(),
  });

  if (response.status === 401) {
    moveToSignIn();
    return;
  }

  if (!response.ok) {
    throw new Error("Failed to fetch post");
  }

  post.value = await response.json();
}

function editPost(id) {
  router.push(`/post/${id}/edit`);
}

async function deletePost(id) {
  const confirmed = window.confirm("이 게시글을 삭제하시겠습니까?");
  if (!confirmed) return;

  const response = await fetch(`/api/boards/${id}`, {
    method: "DELETE",
    headers: createAuthHeaders(),
  });

  if (response.status === 401) {
    moveToSignIn();
    return;
  }

  if (response.status === 403) {
    alert("본인 게시글만 삭제할 수 있습니다.");
    return;
  }

  if (!response.ok) {
    alert("게시글 삭제에 실패했습니다.");
    return;
  }

  router.push({ name: "BoardView" });
}

onMounted(fetchPost);
</script>

<template>
  <div class="detail-page">
    <RouterLink :to="{ name: 'BoardView' }" class="back-link">뒤로 가기</RouterLink>
    <PostDetail
      :post="post"
      :current-username="currentUsername"
      @edit="editPost"
      @delete="deletePost"
    />
  </div>
</template>

<style scoped>
.detail-page {
  width: min(800px, calc(100% - 32px));
  margin: 40px auto;
}

.back-link {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;
  padding: 10px 14px;
  border-radius: 999px;
  color: #2563eb;
  background: #eff6ff;
  text-decoration: none;
  font-weight: 700;
}
</style>
