<script setup>
defineProps({
  post: {
    type: Object,
    default: null,
  },
});

function formatCreatedAt(value) {
  if (!value) return "";

  const [datePart = "", timePart = ""] = String(value).split("T");
  return timePart ? `${datePart} ${timePart.slice(0, 5)}` : datePart;
}
</script>

<template>
  <div class="post-detail">
    <template v-if="post">
    <h2>{{ post.title }}</h2>
    <p class="meta">
      작성자 : {{ post.writer }} | 작성일시 : {{ formatCreatedAt(post.updatedAt) }} 
    </p>
    <p class="content">
      {{ post.content }}
    </p>
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

.meta {
  color: #666;
  font-size: 14px;
  margin: 10px 0 20px;
}

.content {
  line-height: 1.7;
  white-space: pre-line;
}
</style>
