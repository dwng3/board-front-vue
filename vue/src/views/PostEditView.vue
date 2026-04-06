<script setup>
import { onMounted, reactive } from "vue";
import { RouterLink, useRoute, useRouter } from "vue-router";
import { clearAccessToken, createAuthHeaders, getAccessToken } from "@/utils/auth";

const router = useRouter();
const route = useRoute();

const form = reactive({
  title: "",
  content: "",
});

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

  const data = await response.json();
  form.title = data.title;
  form.content = data.content;
}

async function submitPost() {
  if (!getAccessToken()) {
    moveToSignIn();
    return;
  }

  const id = route.params.id;
  const response = await fetch(`/api/boards/${id}`, {
    method: "PUT",
    headers: createAuthHeaders({
      "Content-Type": "application/json",
    }),
    body: JSON.stringify(form),
  });

  if (response.status === 401) {
    moveToSignIn();
    return;
  }

  if (!response.ok) {
    throw new Error("Failed to update post");
  }

  router.push(`/post/${id}`);
}

onMounted(fetchPost);
</script>

<template>
  <section class="write-page">
    <div class="write-header">
      <div>
      </div>
      <RouterLink :to="{ name: 'BoardView' }" class="back-link">뒤로 가기</RouterLink>
    </div>

    <form class="write-form" @submit.prevent="submitPost">
      <label class="field">
        <span>제목</span>
        <input v-model="form.title" type="text" placeholder="제목" />
      </label>

      <label class="field">
        <span>내용</span>
        <textarea v-model="form.content" rows="10" placeholder="내용"></textarea>
      </label>

      <div class="actions">
        <RouterLink :to="{ name: 'BoardView' }" class="cancel-button">취소</RouterLink>
        <button type="submit" class="submit-button">수정</button>
      </div>
    </form>
  </section>
</template>

<style scoped>
.write-page {
  width: min(800px, calc(100% - 32px));
  margin: 40px auto;
}

.write-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 24px;
}

h1 {
  margin: 0;
  font-size: clamp(28px, 4vw, 40px);
  line-height: 1.1;
}

.write-form {
  display: grid;
  gap: 20px;
  padding: 28px;
  border: 1px solid #d1d5db;
  border-radius: 20px;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.98), rgba(243, 244, 246, 0.98)),
    #ffffff;
  box-shadow: 0 18px 40px rgba(15, 23, 42, 0.08);
}

.field {
  display: grid;
  gap: 8px;
}

.field span {
  font-size: 14px;
  font-weight: 700;
  color: #334155;
}

.field input,
.field textarea {
  width: 100%;
  border: 1px solid #cbd5e1;
  border-radius: 12px;
  padding: 14px 16px;
  font: inherit;
  color: #0f172a;
  background: #fff;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.field textarea {
  resize: vertical;
  min-height: 220px;
}

.field input:focus,
.field textarea:focus {
  outline: none;
  border-color: #4b5563;
  box-shadow: 0 0 0 4px rgba(107, 114, 128, 0.12);
}

.actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.back-link,
.cancel-button,
.submit-button {
  border-radius: 999px;
  padding: 12px 18px;
  text-decoration: none;
  font-weight: 700;
}

.back-link,
.cancel-button {
  color: #374151;
  background: #f3f4f6;
}

.submit-button {
  border: 0;
  color: #fff;
  background: linear-gradient(135deg, #111827 0%, #374151 58%, #94a3b8 100%);
  cursor: pointer;
}

@media (max-width: 640px) {
  .write-header {
    flex-direction: column;
  }

  .actions {
    flex-direction: column;
  }

  .cancel-button,
  .submit-button {
    text-align: center;
  }
}
</style>
