<script setup>
import { computed, onMounted, ref } from "vue";
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
  display: inline-block;
  margin-bottom: 16px;
  color: #2563eb;
  text-decoration: none;
}
</style>
