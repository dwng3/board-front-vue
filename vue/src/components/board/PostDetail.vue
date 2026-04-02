<script setup>
import { computed, ref, watch } from "vue";
import { clearAccessToken, createAuthHeaders, getAccessToken } from "@/utils/auth";

const props = defineProps({
  post: {
    type: Object,
    default: null,
  },
  currentUsername: {
    type: String,
    default: "",
  },
});

const emit = defineEmits(["edit", "delete"]);
const commentText = ref("");
const comments = ref([]);

function formatCreatedAt(value) {
  if (!value) return "";

  const [datePart = "", timePart = ""] = String(value).split("T");
  return timePart ? `${datePart} ${timePart.slice(0, 5)}` : datePart;
}


async function fetchComments() {

  const response = await fetch(`/api/comments?boardId=${props.post.id}`, {
    method: "GET",
    headers: createAuthHeaders(),
  });

  if(!response.ok){
    throw new Error("댓글 목록을 불러오지 못했습니다.");
  }

  const data = await response.json();
  comments.value = data ?? [];
}

async function submitComment() {
  const content = commentText.value.trim();
  if (!content) return;

  const payload = {
    boardId: props.post.id,
    content,
  }

  const response = await fetch(`/api/comments`, {
    method: "POST",
    headers: createAuthHeaders({
      "Content-Type": "application/json",
    }),
    body: JSON.stringify(payload)
  });

  if(!response.ok){
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
      <div class="detail-header">
        <div>
          <h2>{{ post.title }}</h2>
          <p class="meta">
            작성자: {{ post.writer }} | 작성일시: {{ formatCreatedAt(post.updatedAt) }}
          </p>
        </div>

        <div v-if="post.writerUsername === currentUsername" class="detail-actions">
          <button type="button" class="edit-button" @click="emit('edit', post.id)">수정</button>
          <button type="button" class="delete-button" @click="emit('delete', post.id)">삭제</button>
        </div>
      </div>

      <p class="content">
        {{ post.content }}
      </p>

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
            placeholder="댓글을 입력하세요"
          ></textarea>
          <div class="comment-form-footer">
            <span class="comment-writer">{{ commentWriter }}</span>
            <button type="button" class="comment-submit" @click="submitComment">등록</button>
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
  border: 1px solid #ddd;
  border-radius: 12px;
  padding: 24px;
  background: #fff;
}

.detail-header {
  display: flex;
  justify-content: space-between;
  gap: 16px;
}

.meta {
  color: #666;
  font-size: 14px;
  margin: 10px 0 20px;
}

.detail-actions {
  display: flex;
  align-items: flex-start;
  gap: 10px;
}

.edit-button,
.delete-button {
  border: 0;
  border-radius: 999px;
  padding: 10px 14px;
  font: inherit;
  font-weight: 700;
  cursor: pointer;
}

.edit-button {
  color: #2563eb;
  background: #eff6ff;
}

.delete-button {
  color: #fff;
  background: #dc2626;
}

.content {
  line-height: 1.7;
  white-space: pre-line;
}

.comment-section {
  margin-top: 32px;
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
  font-size: 22px;
  color: #0f172a;
}

.comment-count {
  border-radius: 999px;
  padding: 6px 10px;
  color: #475569;
  background: #f8fafc;
  font-size: 13px;
  font-weight: 700;
}

.comment-form {
  display: grid;
  gap: 12px;
  padding: 16px;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  background: linear-gradient(180deg, #ffffff, #f8fbff);
}

.comment-input {
  width: 100%;
  border: 1px solid #cbd5e1;
  border-radius: 12px;
  padding: 14px 16px;
  font: inherit;
  color: #0f172a;
  background: #fff;
  resize: vertical;
  min-height: 110px;
}

.comment-input:focus {
  outline: none;
  border-color: #2563eb;
  box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.12);
}

.comment-form-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.comment-writer {
  color: #475569;
  font-size: 14px;
  font-weight: 700;
}

.comment-submit {
  border: 0;
  border-radius: 999px;
  padding: 10px 16px;
  color: #fff;
  background: linear-gradient(135deg, #2563eb, #1d4ed8);
  font: inherit;
  font-weight: 700;
  cursor: pointer;
}

.comment-list {
  display: grid;
  gap: 12px;
  list-style: none;
  padding: 0;
  margin: 20px 0 0;
}

.comment-card {
  padding: 16px 18px;
  border: 1px solid #e5e7eb;
  border-radius: 14px;
  background: #fff;
}

.comment-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 10px;
  color: #64748b;
  font-size: 13px;
}

.comment-card p {
  margin: 0;
  color: #0f172a;
  line-height: 1.6;
  white-space: pre-line;
}

.comment-empty {
  margin: 18px 0 0;
  color: #64748b;
}

@media (max-width: 640px) {
  .detail-header,
  .detail-actions,
  .comment-form-footer,
  .comment-meta {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
