<script setup>
import { onMounted, ref } from "vue";
import { RouterLink, useRoute, useRouter } from "vue-router";
import PostDetail from "@/components/board/PostDetail.vue";
import {
  clearAccessToken,
  createAuthHeaders,
  getAccessToken,
  getAuthUsername,
  isGuestMode,
} from "@/utils/auth";

const route = useRoute();
const router = useRouter();
const post = ref(null);
const currentUsername = ref(getAuthUsername());
const guestMode = ref(isGuestMode());

function moveToSignIn() {
  clearAccessToken();
  router.push({ name: "SignInView" });
}

async function fetchPost() {
  const id = route.params.id;

  const response = await fetch(`/api/boards/${id}`, {
    headers: createAuthHeaders(),
  });

  if (response.status === 401) {
    if (!guestMode.value) {
      moveToSignIn();
    }
    return;
  }

  if (!response.ok) {
    throw new Error("Failed to fetch post");
  }

  post.value = await response.json();
}

function editPost(id) {
  if (guestMode.value || !getAccessToken()) {
    moveToSignIn();
    return;
  }

  router.push(`/post/${id}/edit`);
}

async function deletePost(id) {
  if (guestMode.value || !getAccessToken()) {
    moveToSignIn();
    return;
  }

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
  <section class="detail-shell">
    <div class="detail-topbar">
      <div class="detail-topbar-copy">
      </div>
      <RouterLink :to="{ name: 'BoardView' }" class="back-link">목록으로</RouterLink>
    </div>

    <PostDetail
      :post="post"
      :current-username="currentUsername"
      :guest-mode="guestMode"
      @edit="editPost"
      @delete="deletePost"
    />
  </section>
</template>

<style scoped>
.detail-shell {
  width: min(860px, calc(100% - 40px));
  margin: 42px auto 64px;
  font-family:
    "Pretendard",
    "Noto Sans KR",
    "Apple SD Gothic Neo",
    "Malgun Gothic",
    sans-serif;
}

.detail-topbar {
  display: flex;
  align-items: end;
  justify-content: space-between;
  gap: 18px;
  margin-bottom: 20px;
}

.detail-kicker {
  margin: 0 0 8px;
  color: #6b7280;
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 0.16em;
}

.detail-topbar h1 {
  margin: 0;
  color: #111827;
  font-size: clamp(30px, 4vw, 40px);
  letter-spacing: -0.04em;
}

.back-link {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 46px;
  padding: 0 18px;
  border-radius: 999px;
  color: #f8fafc;
  background: linear-gradient(135deg, #111827 0%, #374151 58%, #94a3b8 100%);
  text-decoration: none;
  font-weight: 700;
  box-shadow: 0 14px 26px rgba(15, 23, 42, 0.14);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.back-link:hover {
  transform: translateY(-2px);
  box-shadow: 0 18px 30px rgba(15, 23, 42, 0.18);
}

@media (max-width: 640px) {
  .detail-shell {
    width: min(100%, calc(100% - 24px));
  }

  .detail-topbar {
    align-items: stretch;
    flex-direction: column;
  }
}
</style>
