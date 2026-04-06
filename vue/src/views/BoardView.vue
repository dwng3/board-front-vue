<script setup>
import { computed, onMounted, ref } from "vue";
import { RouterLink, useRoute, useRouter } from "vue-router";
import PostList from "@/components/board/PostList.vue";
import {
  clearAccessToken,
  createAuthHeaders,
  getAccessToken,
  isGuestMode,
} from "@/utils/auth";

const keyword = ref("");
const posts = ref([]);
const currentPage = ref(0);
const totalPages = ref(0);
const pageSize = 5;

const route = useRoute();
const router = useRouter();

const guestMode = computed(() => isGuestMode());
const loggedIn = computed(() => Boolean(getAccessToken()));

function moveToSignIn() {
  clearAccessToken();
  router.push({ name: "SignInView" });
}

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

  const response = await fetch(`/api/boards?${params.toString()}`, {
    headers: createAuthHeaders(),
  });

  if (response.status === 401) {
    if (!guestMode.value) {
      moveToSignIn();
    }
    return;
  }

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
  const initialPage = Number.isFinite(queryPage) && queryPage > 0 ? queryPage - 1 : 0;

  fetchPosts(initialPage);
});

function goToPage(page) {
  if (page < 0 || page >= totalPages.value) return;
  fetchPosts(page);
}

function searchPosts() {
  fetchPosts(0);
}

async function likePost(id) {
  if (!loggedIn.value) {
    alert("좋아요는 로그인 후 사용할 수 있습니다.");
    return;
  }

  const response = await fetch(`/api/boards/likes/${id}`, {
    method: "PUT",
    headers: createAuthHeaders(),
  });

  if (response.status === 401) {
    moveToSignIn();
    return;
  }

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
      <div class="header-copy">
      </div>
      <div class="header-actions">
        <button type="button" class="logout-button" @click="moveToSignIn">
          {{ guestMode ? "로그인" : "로그아웃" }}
        </button>
        <RouterLink v-if="!guestMode" :to="{ name: 'PostWrite' }" class="write-link">글 작성</RouterLink>
      </div>
    </div>

    <div class="board-toolbar">
      <label class="search-box">
        <input
          v-model="keyword"
          type="text"
          placeholder="제목, 작성자, 내용으로 검색해보세요"
          class="search-input"
          @keyup.enter="searchPosts"
        />
      </label>
      <button type="button" class="search-button" @click="searchPosts">검색</button>
    </div>

    <PostList :posts="posts" :can-like="loggedIn" @like="likePost" />

    <div v-if="guestMode" class="guest-banner">
      비회원 모드에서는 게시글 조회만 가능합니다.
    </div>

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
</template>

<style scoped>
.board-page {
  width: min(920px, calc(100% - 32px));
  margin: 42px auto 64px;
  font-family:
    "Pretendard",
    "Noto Sans KR",
    "Apple SD Gothic Neo",
    "Malgun Gothic",
    sans-serif;
}

.board-header {
  display: flex;
  align-items: end;
  justify-content: space-between;
  gap: 20px;
  margin-bottom: 22px;
}

.header-copy {
  display: grid;
  gap: 8px;
}

.board-kicker {
  margin: 0;
  color: #6b7280;
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 0.16em;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

h1 {
  margin: 0;
  font-size: clamp(34px, 5vw, 44px);
  line-height: 1;
  letter-spacing: -0.03em;
  color: #0f172a;
}

.board-toolbar {
  display: flex;
  align-items: end;
  justify-content: space-between;
  gap: 18px;
  padding: 20px 22px;
  margin-bottom: 24px;
  border: 1px solid rgba(203, 213, 225, 0.8);
  border-radius: 24px;
  background:
    radial-gradient(circle at top right, rgba(255, 255, 255, 0.18), transparent 22%),
    linear-gradient(180deg, #1f2937, #374151);
  box-shadow: 0 18px 34px rgba(15, 23, 42, 0.12);
}

.search-box {
  display: grid;
  gap: 10px;
  flex: 1;
}

.search-label {
  font-size: 12px;
  font-weight: 700;
  color: rgba(226, 232, 240, 0.76);
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.search-input {
  width: 100%;
  border: 1px solid rgba(203, 213, 225, 0.28);
  border-radius: 16px;
  padding: 14px 16px;
  font: inherit;
  background: #fff;
  color: #0f172a;
  box-shadow: inset 0 1px 2px rgba(15, 23, 42, 0.04);
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.search-input::placeholder {
  color: #94a3b8;
}

.search-input:focus {
  outline: none;
  border-color: #4b5563;
  box-shadow: 0 0 0 4px rgba(107, 114, 128, 0.14);
}

.write-link,
.logout-button,
.search-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 46px;
  border-radius: 999px;
  font-weight: 700;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.write-link,
.search-button {
  color: #fff;
  text-decoration: none;
  background: linear-gradient(135deg, #111827 0%, #374151 58%, #94a3b8 100%);
  box-shadow: 0 12px 24px rgba(15, 23, 42, 0.16);
}

.write-link {
  padding: 0 18px;
}

.logout-button {
  border: 0;
  padding: 0 18px;
  color: #f8fafc;
  background: linear-gradient(135deg, #1f2937 0%, #4b5563 58%, #9ca3af 100%);
  box-shadow: 0 12px 24px rgba(15, 23, 42, 0.12);
  cursor: pointer;
}

.search-button {
  min-width: 88px;
  padding: 0 20px;
  border: 0;
  font: inherit;
  cursor: pointer;
  background: linear-gradient(135deg, #020617 0%, #111827 55%, #374151 100%);
  box-shadow: 0 14px 26px rgba(2, 6, 23, 0.2);
}

.guest-banner {
  margin-top: 22px;
  padding: 16px 18px;
  border: 1px solid rgba(203, 213, 225, 0.75);
  border-radius: 18px;
  color: #f8fafc;
  background: linear-gradient(135deg, #111827 0%, #374151 58%, #6b7280 100%);
  font-weight: 700;
  box-shadow: 0 18px 34px rgba(15, 23, 42, 0.12);
}

.pagination {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 10px;
  margin-top: 34px;
}

.page-button {
  min-width: 44px;
  height: 44px;
  border: 1px solid rgba(203, 213, 225, 0.7);
  border-radius: 999px;
  padding: 0 16px;
  background: #ffffff;
  color: #1e293b;
  font: inherit;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 10px 18px rgba(15, 23, 42, 0.08);
  transition: transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease;
}

.page-button:hover:not(:disabled) {
  transform: translateY(-2px);
  border-color: #94a3b8;
  box-shadow: 0 14px 24px rgba(15, 23, 42, 0.1);
}

.page-button:disabled {
  opacity: 0.45;
  cursor: default;
}

.page-button.active {
  border-color: #4b5563;
  background: linear-gradient(135deg, #111827 0%, #374151 58%, #6b7280 100%);
  color: #fff;
  box-shadow: 0 14px 26px rgba(15, 23, 42, 0.14);
}

.nav-button {
  min-width: 72px;
}

.write-link:hover,
.logout-button:hover,
.search-button:hover {
  transform: translateY(-2px);
}

@media (max-width: 640px) {
  .board-header,
  .board-toolbar,
  .header-actions {
    align-items: stretch;
    flex-direction: column;
  }

  .write-link,
  .logout-button,
  .search-button {
    width: 100%;
  }

  .board-page {
    margin-top: 28px;
  }
}
</style>
