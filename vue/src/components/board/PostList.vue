<script setup>
defineProps({
  posts: {
    type: Array,
    required: true,
  },
  canLike: {
    type: Boolean,
    default: false,
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
        <div class="post-mainline">
          <span class="meta-badge">{{ post.id }}</span>
          <h2 class="post-title">{{ post.title }}</h2>
        </div>
      </RouterLink>

      <div class="post-meta-row">
        <div class="post-meta">
          <span class="meta-item author">{{ post.writer }}</span>
          <span class="meta-item date">{{ formatCreatedAt(post.updatedAt) }}</span>
          <span class="meta-item views">조회수 {{ post.viewCount }}</span>
        </div>
      </div>
    </li>
  </ul>
</template>

<style scoped>
.post-list {
  display: grid;
  gap: 18px;
  list-style: none;
  padding: 0;
  margin: 0;
  font-family:
    "Pretendard",
    "Noto Sans KR",
    "Apple SD Gothic Neo",
    "Malgun Gothic",
    sans-serif;
}

.post-card {
  overflow: hidden;
  border: 1px solid rgba(203, 213, 225, 0.82);
  border-radius: 20px;
  background:
    radial-gradient(circle at top right, rgba(255, 255, 255, 0.7), transparent 26%),
    linear-gradient(180deg, #ffffff, #f3f4f6);
  box-shadow: 0 14px 28px rgba(15, 23, 42, 0.06);
  transition: border-color 0.2s ease, transform 0.2s ease, box-shadow 0.2s ease;
}

.post-card:hover {
  border-color: #94a3b8;
  box-shadow: 0 18px 32px rgba(15, 23, 42, 0.08);
  transform: translateY(-2px);
}

.post-link {
  display: grid;
  align-items: center;
  min-height: 72px;
  padding: 18px 20px 10px;
  color: inherit;
  text-decoration: none;
}

.post-mainline {
  display: flex;
  align-items: center;
  gap: 12px;
}

.post-meta-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 0 20px 18px;
}

.post-meta {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
}

.meta-badge,
.meta-item {
  border-radius: 999px;
  padding: 6px 11px;
  font-size: 12px;
  font-weight: 700;
}

.meta-badge {
  color: #111827;
  background: #e5e7eb;
}

.post-author {
  color: #4b5563;
  font-size: 14px;
  font-weight: 700;
}

.post-title {
  margin: 0;
  color: #111827;
  font-size: 22px;
  line-height: 1.2;
  letter-spacing: -0.02em;
}

.meta-item {
  color: #4b5563;
  background: #f3f4f6;
}

.like-button {
  border: 0;
  border-radius: 999px;
  padding: 8px 13px;
  font: inherit;
  font-weight: 700;
  color: #f8fafc;
  background: linear-gradient(135deg, #111827 0%, #374151 58%, #94a3b8 100%);
  box-shadow: 0 12px 20px rgba(15, 23, 42, 0.12);
  cursor: pointer;
}

.view-count {
  border-radius: 999px;
  padding: 8px 13px;
  color: #334155;
  background: #f3f4f6;
  font-size: 12px;
  font-weight: 700;
}

.like-button:hover {
  transform: translateY(-1px);
}

@media (max-width: 640px) {
  .post-title {
    width: 100%;
    font-size: 20px;
  }

  .post-meta-row {
    align-items: flex-start;
    flex-direction: column;
  }
}
</style>
