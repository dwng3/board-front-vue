<script setup>
defineProps({
  posts: {
    type: Array,
    required: true,
  },
});

const emit = defineEmits(["like"]);

function formatCreatedAt(value) {
  if (!value) return "";

  const [datePart = "", timePart = ""] = String(value).split("T");
  return timePart ? `${datePart} ${timePart.slice(0, 5)}` : datePart;
}
</script>

<template>
  <ul class="post-list">
    <li v-for="post in posts" :key="post.id" class="post-card">
      <RouterLink :to="`/post/${post.id}`" class="post-link">
        <div class="post-meta">
          <span class="meta-badge">글번호 : {{ post.id }}</span>
          <span class="meta-item">작성자: {{ post.writer }}</span>
          <span class="meta-item">작성일시: {{ formatCreatedAt(post.updatedAt) }}</span>
        </div>
        <h2 class="post-title">{{ post.title }}</h2>
      </RouterLink>

      <div class="post-actions">
        <button type="button" class="like-button" @click="emit('like', post.id)">
          좋아요 <span>{{ post.likeCount }}</span>
        </button>
        <span class="view-count">조회수 {{ post.viewCount }}</span>
      </div>
    </li>
  </ul>
</template>

<style scoped>
.post-list {
  display: grid;
  gap: 16px;
  list-style: none;
  padding: 0;
  margin: 0;
}

.post-card {
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  background: #fff;
  transition: border-color 0.2s ease, transform 0.2s ease, box-shadow 0.2s ease;
}

.post-card:hover {
  border-color: #93c5fd;
  box-shadow: 0 12px 24px rgba(15, 23, 42, 0.08);
  transform: translateY(-2px);
}

.post-link {
  display: block;
  padding: 20px 20px 12px;
  color: inherit;
  text-decoration: none;
}

.post-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 8px 10px;
  align-items: center;
  margin-bottom: 12px;
}

.meta-badge,
.meta-item {
  border-radius: 999px;
  padding: 6px 10px;
  font-size: 12px;
  font-weight: 700;
}

.meta-badge {
  color: #2563eb;
  background: #eff6ff;
}

.meta-item {
  color: #64748b;
  background: #f8fafc;
}

.post-title {
  margin: 0;
  font-size: 24px;
  line-height: 1.25;
  letter-spacing: -0.02em;
  color: #0f172a;
}

.post-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  padding: 0 20px 20px;
}

.like-button,
.view-count {
  border: 0;
  border-radius: 999px;
  padding: 10px 14px;
  font: inherit;
  font-weight: 700;
}

.like-button {
  color: #b91c1c;
  background: #fee2e2;
  cursor: pointer;
}

.view-count {
  color: #334155;
  background: #f8fafc;
}
</style>
