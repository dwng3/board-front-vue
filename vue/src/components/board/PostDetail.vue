<script setup>
import { computed, ref, watch } from "vue";
import { createAuthHeaders } from "@/utils/auth";

const props = defineProps({
  post: {
    type: Object,
    default: null,
  },
  currentUsername: {
    type: String,
    default: "",
  },
  guestMode: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["edit", "delete"]);
const commentText = ref("");
const comments = ref([]);
const commentWriter = computed(() => props.currentUsername || "비회원");

function formatCreatedAt(value) {
  if (!value) return "";

  const [datePart = "", timePart = ""] = String(value).split("T");
  return timePart ? `${datePart} ${timePart.slice(0, 5)}` : datePart;
}

async function fetchComments() {
  if (!props.post?.id) return;

  const response = await fetch(`/api/comments?boardId=${props.post.id}`, {
    method: "GET",
    headers: createAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error("댓글 목록을 불러오지 못했습니다.");
  }

  const data = await response.json();
  comments.value = data ?? [];
}

async function submitComment() {
  if (props.guestMode) {
    alert("댓글 작성은 로그인 후 사용할 수 있습니다.");
    return;
  }

  const content = commentText.value.trim();
  if (!content) return;

  const payload = {
    boardId: props.post.id,
    content,
  };

  const response = await fetch(`/api/comments`, {
    method: "POST",
    headers: createAuthHeaders({
      "Content-Type": "application/json",
    }),
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    alert("댓글 작성에 실패했습니다.");
    return;
  }

  commentText.value = "";
  fetchComments();
}

watch(
  () => props.post?.id,
  (postId) => {
    if (postId) {
      fetchComments();
    }
  },
  { immediate: true }
);
</script>

<template>
  <div class="post-detail">
    <template v-if="post">
      <section class="detail-hero">
        <div class="detail-header">
          <div class="title-block">
            <h2>{{ post.title }}</h2>
          </div>

          <div v-if="post.writerUsername === currentUsername && !guestMode" class="detail-actions">
            <button type="button" class="edit-button" @click="emit('edit', post.id)">수정</button>
            <button type="button" class="delete-button" @click="emit('delete', post.id)">삭제</button>
          </div>
        </div>

        <div class="detail-meta-grid">
          <div class="meta-card">
            <span class="meta-label">작성자</span>
            <strong>{{ post.writer }}</strong>
          </div>
          <div class="meta-card">
            <span class="meta-label">작성일</span>
            <strong>{{ formatCreatedAt(post.updatedAt) }}</strong>
          </div>
          <div class="meta-card">
            <span class="meta-label">조회수</span>
            <strong>{{ post.viewCount }}</strong>
          </div>
        </div>
      </section>

      <section class="content-section">
        <p class="content">
          {{ post.content }}
        </p>
      </section>

      <section class="comment-section">
        <div class="comment-header">
          <h3>댓글</h3>
          <span class="comment-count">{{ comments.length }}개</span>
        </div>

        <div class="comment-form">
          <textarea
            v-model="commentText"
            class="comment-input"
            rows="4"
            :placeholder="guestMode ? '비회원은 댓글을 작성할 수 없습니다.' : '댓글을 입력하세요'"
            :disabled="guestMode"
          ></textarea>
          <div class="comment-form-footer">
            <span class="comment-writer">{{ commentWriter }}</span>
            <button
              type="button"
              class="comment-submit"
              @click="submitComment"
              :disabled="guestMode"
            >
              등록
            </button>
          </div>
        </div>

        <ul v-if="comments.length" class="comment-list">
          <li v-for="comment in comments" :key="comment.id" class="comment-card">
            <div class="comment-meta">
              <strong>{{ comment.writer }}</strong>
              <span>{{ formatCreatedAt(comment.createdAt) }}</span>
            </div>
            <p>{{ comment.content }}</p>
          </li>
        </ul>

        <p v-else class="comment-empty">아직 댓글이 없습니다. 첫 댓글을 남겨보세요.</p>
      </section>
    </template>

    <template v-else>
      <p>Post not found.</p>
    </template>
  </div>
</template>

<style scoped>
.post-detail {
  border: 1px solid rgba(203, 213, 225, 0.82);
  border-radius: 30px;
  padding: 28px;
  background:
    radial-gradient(circle at top right, rgba(255, 255, 255, 0.7), transparent 24%),
    linear-gradient(180deg, #ffffff, #f3f4f6);
  box-shadow: 0 22px 42px rgba(15, 23, 42, 0.08);
  font-family:
    "Pretendard",
    "Noto Sans KR",
    "Apple SD Gothic Neo",
    "Malgun Gothic",
    sans-serif;
}

.detail-hero {
  padding-bottom: 24px;
  border-bottom: 1px solid #e5e7eb;
}

.detail-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 20px;
}

.title-block {
  max-width: 640px;
}

.detail-label {
  margin: 0 0 10px;
  color: #6b7280;
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 0.16em;
}

.title-block h2 {
  margin: 0;
  color: #111827;
  font-size: clamp(34px, 5vw, 46px);
  line-height: 1.06;
  letter-spacing: -0.05em;
}

.detail-actions {
  display: flex;
  gap: 10px;
}

.edit-button,
.delete-button,
.comment-submit {
  border: 0;
  border-radius: 999px;
  color: #f8fafc;
  font: inherit;
  font-weight: 700;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.edit-button,
.comment-submit {
  background: linear-gradient(135deg, #111827 0%, #374151 58%, #94a3b8 100%);
  box-shadow: 0 12px 22px rgba(15, 23, 42, 0.14);
}

.delete-button {
  background: linear-gradient(135deg, #1f2937 0%, #4b5563 58%, #9ca3af 100%);
  box-shadow: 0 12px 22px rgba(15, 23, 42, 0.14);
}

.edit-button,
.delete-button {
  padding: 10px 16px;
}

.detail-meta-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
  margin-top: 18px;
}

.meta-card {
  display: grid;
  gap: 5px;
  padding: 12px 14px;
  border: 1px solid #e5e7eb;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.88);
}

.meta-label {
  color: #6b7280;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.08em;
}

.meta-card strong {
  color: #111827;
  font-size: 14px;
}

.content-section {
  margin-top: 26px;
}

.section-title {
  margin: 0 0 14px;
  color: #111827;
  font-size: 20px;
  letter-spacing: -0.02em;
}

.content {
  margin: 0;
  min-height: 300px;
  padding: 24px;
  border: 1px solid #e5e7eb;
  border-radius: 22px;
  background: #ffffff;
  color: #111827;
  font-size: 16px;
  line-height: 1.85;
  white-space: pre-line;
}

.comment-section {
  margin-top: 34px;
  padding-top: 24px;
  border-top: 1px solid #e2e8f0;
}

.comment-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 16px;
}

.comment-header h3 {
  margin: 0;
  color: #111827;
  font-size: 22px;
  letter-spacing: -0.02em;
}

.comment-count {
  border-radius: 999px;
  padding: 6px 11px;
  color: #4b5563;
  background: #e5e7eb;
  font-size: 12px;
  font-weight: 700;
}

.comment-form {
  display: grid;
  gap: 10px;
  padding: 16px;
  border: 1px solid rgba(203, 213, 225, 0.72);
  border-radius: 18px;
  background: linear-gradient(180deg, #ffffff, #f3f4f6);
}

.comment-input {
  width: 100%;
  min-height: 92px;
  resize: vertical;
  border: 1px solid #cbd5e1;
  border-radius: 16px;
  padding: 13px 15px;
  font: inherit;
  color: #0f172a;
  background: #fff;
  box-shadow: inset 0 1px 2px rgba(15, 23, 42, 0.04);
}

.comment-input:disabled {
  border-color: #d1d5db;
  background: linear-gradient(180deg, #e5e7eb, #d1d5db);
  color: #6b7280;
  box-shadow: inset 0 1px 2px rgba(15, 23, 42, 0.03);
  cursor: not-allowed;
}

.comment-input:focus {
  outline: none;
  border-color: #4b5563;
  box-shadow: 0 0 0 4px rgba(107, 114, 128, 0.14);
}

.comment-form-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.comment-writer {
  color: #475569;
  font-size: 13px;
  font-weight: 700;
}

.comment-submit {
  padding: 9px 15px;
}

.comment-submit:disabled {
  background: #cbd5e1;
  box-shadow: none;
  cursor: default;
}

.guest-message {
  margin: 14px 0 0;
  color: #374151;
  font-weight: 700;
}

.comment-list {
  display: grid;
  gap: 12px;
  list-style: none;
  padding: 0;
  margin: 20px 0 0;
}

.comment-card {
  padding: 14px 16px;
  border: 1px solid rgba(226, 232, 240, 0.95);
  border-radius: 16px;
  background: #ffffff;
  box-shadow: 0 12px 24px rgba(15, 23, 42, 0.05);
}

.comment-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 8px;
  color: #64748b;
  font-size: 12px;
}

.comment-card p {
  margin: 0;
  color: #0f172a;
  font-size: 14px;
  line-height: 1.6;
  white-space: pre-line;
}

.comment-empty {
  margin: 18px 0 0;
  color: #64748b;
}

.edit-button:hover,
.delete-button:hover,
.comment-submit:hover:not(:disabled) {
  transform: translateY(-2px);
}

@media (max-width: 640px) {
  .detail-header,
  .detail-actions,
  .comment-form-footer,
  .comment-meta {
    flex-direction: column;
    align-items: flex-start;
  }

  .detail-meta-grid {
    grid-template-columns: 1fr 1fr;
  }

  .post-detail {
    padding: 22px 18px;
    border-radius: 22px;
  }

  .title-block h2 {
    font-size: 30px;
  }
}

@media (max-width: 480px) {
  .detail-meta-grid {
    grid-template-columns: 1fr;
  }
}
</style>
