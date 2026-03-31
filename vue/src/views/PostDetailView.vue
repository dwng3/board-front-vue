<script setup>
import { onMounted, ref } from "vue";
import { RouterLink, useRoute } from "vue-router";
import PostDetail from "@/components/board/PostDetail.vue";

const route = useRoute();
const post = ref(null);

async function fetchPost() {
  const id = route.params.id;

  const response = await fetch(`/api/boards/${id}`);
  if (!response.ok) {
    throw new Error("Failed to fetch post");
  }

  post.value = await response.json();
}

onMounted(fetchPost);
</script>

<template>
  <div class="detail-page">
    <RouterLink to="/" class="back-link">뒤로 가기</RouterLink>
    <PostDetail :post="post" />
  </div>
</template>

<style scoped>
.detail-page {
  width: min(800px, calc(100% - 32px));
  margin: 40px auto;
}

.back-link {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;
  padding: 10px 14px;
  border-radius: 999px;
  color: #2563eb;
  background: #eff6ff;
  text-decoration: none;
  font-weight: 700;
}
</style>
