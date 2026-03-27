<script setup>
import { onMounted, ref, watch } from "vue";
import { RouterLink, useRouter } from "vue-router";
import PostList from "@/components/board/PostList.vue";

const keyword = ref("");
const posts = ref([]);
const currentPage = ref(0);
const totalPages = ref(0);
const pageSize = 5;

const router = useRouter();

async function fetchPosts(page = 0) {
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
  fetchPosts();
});

watch(keyword, () => {
  fetchPosts(0);
});

function goToPage(page) {
  if (page < 0 || page >= totalPages.value) return;
  fetchPosts(page);
}

async function deletePost(id) {
  const password = prompt("게시물 비밀번호를 입력하세요.");

  if (password === null || password.trim() === "") {
    return;
  }

  const response = await fetch(`/api/boards/${id}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ password }),
  });

  if (!response.ok) {
    alert("비밀번호가 일치하지 않거나 삭제에 실패했습니다.");
    return;
  }

  const nextPage =
    posts.value.length === 1 && currentPage.value > 0
      ? currentPage.value - 1
      : currentPage.value;

  await fetchPosts(nextPage);
}

async function editPost(id) {
  const password = prompt("게시물 비밀번호를 입력하세요.");

  if (password === null || password.trim() === "") {
    return;
  }

  const response = await fetch(`/api/boards/check/${id}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ password }),
  });

  if (!response.ok) {
    alert("비밀번호가 일치하지 않습니다.");
    return;
  }

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
        />
      </label>
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

.search-input {
  width: 100%;
  border: 1px solid #cbd5e1;
  border-radius: 12px;
  padding: 12px 14px;
  font: inherit;
  background: #fff;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.search-input:focus {
  outline: none;
  border-color: #2563eb;
  box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.12);
}

.result-count {
  white-space: nowrap;
  font-size: 14px;
  font-weight: 700;
  color: #64748b;
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

@media (max-width: 640px) {
  .board-header,
  .board-toolbar {
    align-items: stretch;
    flex-direction: column;
  }

  .write-link {
    width: 100%;
  }

  .result-count {
    white-space: normal;
  }
}
</style>
