<script setup>
import { onMounted, ref } from "vue";
import { RouterLink, useRoute, useRouter } from "vue-router";
import PostList from "@/components/board/PostList.vue";

const keyword = ref("");
const posts = ref([]);
const currentPage = ref(0);
const totalPages = ref(0);
const pageSize = 5;

const route = useRoute();
const router = useRouter();

const showPasswordModal = ref(false);
const password = ref("");
const passwordError = ref("");
const pendingAction = ref("");
const targetPostId = ref(null);

async function syncListQuery(page) {
  const nextQuery = {};

  if (page > 0) {
    nextQuery.page = String(page + 1);
  }

  if (keyword.value.trim()) {
    nextQuery.keyword = keyword.value.trim();
  }

  await router.replace({ query: nextQuery });
}

async function fetchPosts(page = 0) {
  await syncListQuery(page);

  const params = new URLSearchParams({
    page: String(page),
    size: String(pageSize),
  });

  if (keyword.value.trim()) {
    params.set("keyword", keyword.value.trim());
  }

  const response = await fetch(`/api/boards?${params.toString()}`);

  if (!response.ok) {
    throw new Error("게시글 목록을 불러오지 못했습니다.");
  }

  const data = await response.json();
  posts.value = data.content ?? [];
  currentPage.value = data.number ?? 0;
  totalPages.value = data.totalPages ?? 0;
}

onMounted(() => {
  keyword.value = typeof route.query.keyword === "string" ? route.query.keyword : "";

  const queryPage = Number(route.query.page ?? 1);
  const initialPage =
    Number.isFinite(queryPage) && queryPage > 0
      ? queryPage - 1
      : 0;

  fetchPosts(initialPage);
});

function goToPage(page) {
  if (page < 0 || page >= totalPages.value) return;
  fetchPosts(page);
}

function searchPosts() {
  fetchPosts(0);
}

function openPasswordModal(action, id) {
  pendingAction.value = action;
  targetPostId.value = id;
  password.value = "";
  passwordError.value = "";
  showPasswordModal.value = true;
}

function closePasswordModal() {
  showPasswordModal.value = false;
  password.value = "";
  passwordError.value = "";
  pendingAction.value = "";
  targetPostId.value = null;
}

function deletePost(id) {
  openPasswordModal("delete", id);
}

function editPost(id) {
  openPasswordModal("edit", id);
}

async function submitPasswordAction() {
  if (!password.value.trim()) {
    passwordError.value = "비밀번호를 입력하세요.";
    return;
  }

  if (pendingAction.value === "delete") {
    await deletePostWithPassword(targetPostId.value, password.value);
    return;
  }

  if (pendingAction.value === "edit") {
    await editPostWithPassword(targetPostId.value, password.value);
  }
}

async function deletePostWithPassword(id, rawPassword) {
  const response = await fetch(`/api/boards/${id}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ password: rawPassword }),
  });

  if (!response.ok) {
    passwordError.value = "비밀번호가 일치하지 않거나 삭제에 실패했습니다.";
    return;
  }

  closePasswordModal();

  const nextPage =
    posts.value.length === 1 && currentPage.value > 0
      ? currentPage.value - 1
      : currentPage.value;

  await fetchPosts(nextPage);
}

async function editPostWithPassword(id, rawPassword) {
  const response = await fetch(`/api/boards/check/${id}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ password: rawPassword }),
  });

  if (!response.ok) {
    passwordError.value = "비밀번호가 일치하지 않습니다.";
    return;
  }

  closePasswordModal();
  router.push(`/post/${id}/edit`);
}

async function likePost(id) {
  const response = await fetch(`/api/boards/likes/${id}`, {
    method: "PUT",
  });

  if (!response.ok) {
    throw new Error("좋아요 처리에 실패했습니다.");
  }

  const updatedPost = await response.json();
  const target = posts.value.find((post) => post.id === id);

  if (target) {
    target.likeCount = updatedPost.likeCount;
  }
}
</script>

<template>
  <section class="board-page">
    <div class="board-header">
      <div>
        <h1>게시판</h1>
      </div>
      <RouterLink to="/write" class="write-link">글 작성</RouterLink>
    </div>

    <div class="board-toolbar">
      <label class="search-box">
        <span class="search-label">검색</span>
        <input
          v-model="keyword"
          type="text"
          placeholder="제목, 작성자, 내용을 검색하세요"
          class="search-input"
          @keyup.enter="searchPosts"
        />
      </label>
      <button type="button" class="search-button" @click="searchPosts">검색</button>
    </div>

    <PostList :posts="posts" @delete="deletePost" @like="likePost" @edit="editPost" />

    <div class="pagination" v-if="totalPages > 0">
      <button
        class="page-button nav-button"
        @click="goToPage(currentPage - 1)"
        :disabled="currentPage === 0"
      >
        이전
      </button>

      <button
        v-for="page in totalPages"
        :key="page"
        class="page-button"
        @click="goToPage(page - 1)"
        :class="{ active: page - 1 === currentPage }"
      >
        {{ page }}
      </button>

      <button
        class="page-button nav-button"
        @click="goToPage(currentPage + 1)"
        :disabled="currentPage === totalPages - 1"
      >
        다음
      </button>
    </div>
  </section>

  <Teleport to="body">
    <div v-if="showPasswordModal" class="modal-backdrop" @click.self="closePasswordModal">
      <div class="password-modal" role="dialog" aria-modal="true" aria-labelledby="password-modal-title">
        <p class="modal-description">
          {{ pendingAction === "delete" ? "삭제를" : "수정을" }} 진행하려면 게시물 비밀번호를 입력하세요.
        </p>
        <input
          v-model="password"
          type="password"
          class="password-input"
          placeholder="비밀번호 입력"
          @keyup.enter="submitPasswordAction"
        />
        <p v-if="passwordError" class="password-error">{{ passwordError }}</p>
        <div class="modal-actions">
          <button type="button" class="cancel-button" @click="closePasswordModal">취소</button>
          <button type="button" class="confirm-button" @click="submitPasswordAction">확인</button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.board-page {
  width: min(880px, calc(100% - 32px));
  margin: 40px auto 56px;
}

.board-header {
  display: flex;
  align-items: end;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 20px;
}

h1 {
  margin: 0;
  font-size: clamp(32px, 5vw, 44px);
  line-height: 1;
}

.board-toolbar {
  display: flex;
  align-items: end;
  justify-content: space-between;
  gap: 16px;
  padding: 18px 20px;
  margin-bottom: 20px;
  border: 1px solid #dbe3f0;
  border-radius: 18px;
  background: linear-gradient(135deg, #f8fbff, #ffffff);
  box-shadow: 0 12px 32px rgba(15, 23, 42, 0.06);
}

.search-box {
  display: grid;
  gap: 8px;
  flex: 1;
}

.search-label {
  font-size: 13px;
  font-weight: 700;
  color: #475569;
}

.search-input,
.password-input {
  width: 100%;
  border: 1px solid #cbd5e1;
  border-radius: 12px;
  padding: 12px 14px;
  font: inherit;
  background: #fff;
  color: #0f172a;
  caret-color: #0f172a;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.search-input::placeholder,
.password-input::placeholder {
  color: #94a3b8;
}

.search-input:focus,
.password-input:focus {
  outline: none;
  border-color: #2563eb;
  box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.12);
}

.write-link {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 44px;
  padding: 0 18px;
  border-radius: 999px;
  color: #fff;
  background: linear-gradient(135deg, #2563eb, #1d4ed8);
  box-shadow: 0 12px 24px rgba(37, 99, 235, 0.22);
  text-decoration: none;
  font-weight: 700;
}

.search-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 48px;
  padding: 0 18px;
  border: 0;
  border-radius: 999px;
  color: #fff;
  background: linear-gradient(135deg, #0f172a, #334155);
  box-shadow: 0 12px 24px rgba(15, 23, 42, 0.16);
  font: inherit;
  font-weight: 700;
  cursor: pointer;
}

.pagination {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 10px;
  margin-top: 28px;
}

.page-button {
  min-width: 44px;
  height: 44px;
  border: 1px solid #d6dfec;
  border-radius: 999px;
  padding: 0 16px;
  background: #fff;
  color: #334155;
  font: inherit;
  font-weight: 700;
  cursor: pointer;
  transition: transform 0.2s ease, border-color 0.2s ease, background-color 0.2s ease;
}

.page-button:hover:not(:disabled) {
  transform: translateY(-1px);
  border-color: #93c5fd;
}

.page-button:disabled {
  opacity: 0.45;
  cursor: default;
}

.page-button.active {
  border-color: #2563eb;
  background: #2563eb;
  color: #fff;
  box-shadow: 0 10px 22px rgba(37, 99, 235, 0.24);
}

.nav-button {
  min-width: 72px;
}

.modal-backdrop {
  position: fixed;
  inset: 0;
  display: grid;
  place-items: center;
  padding: 20px;
  background: rgba(15, 23, 42, 0.58);
  backdrop-filter: blur(4px);
  z-index: 9999;
}

.password-modal {
  width: min(420px, 100%);
  padding: 24px;
  border-radius: 20px;
  background: #fff;
  border: 1px solid rgba(148, 163, 184, 0.24);
  box-shadow: 0 24px 60px rgba(15, 23, 42, 0.28);
}

.password-modal h2 {
  margin: 0 0 10px;
  font-size: 24px;
}

.modal-description {
  margin: 0 0 16px;
  color: #64748b;
  line-height: 1.5;
}

.password-error {
  margin: 10px 0 0;
  color: #dc2626;
  font-size: 14px;
  font-weight: 700;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 20px;
}

.cancel-button,
.confirm-button {
  border: 0;
  border-radius: 999px;
  padding: 12px 18px;
  font: inherit;
  font-weight: 700;
  cursor: pointer;
}

.cancel-button {
  color: #2563eb;
  background: #eff6ff;
}

.confirm-button {
  color: #fff;
  background: linear-gradient(135deg, #2563eb, #1d4ed8);
}

@media (max-width: 640px) {
  .board-header,
  .board-toolbar {
    align-items: stretch;
    flex-direction: column;
  }

  .write-link {
    width: 100%;
  }

  .search-button {
    width: 100%;
  }

  .modal-actions {
    flex-direction: column;
  }
}
</style>
