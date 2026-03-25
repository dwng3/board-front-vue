<script setup>
import { reactive, registerRuntimeCompiler } from "vue";
import { RouterLink, useRouter } from "vue-router";

const router = useRouter();

const form = reactive({
  title: "",
  writer: "",
  content: "",
  password: ""
});

async function submitPost() {

  if (!form.password) {
    alert("비밀번호를 입력하세요.");
    return;
  }
  
  const response = await fetch(`/api/boards`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(form),
  });

  router.push("/");
}
</script>

<template>
  <section class="write-page">
    <div class="write-header">
      <div>
        <h1>글 작성</h1>
      </div>
      <RouterLink to="/" class="back-link">뒤로가기</RouterLink>
    </div>

    <form class="write-form" @submit.prevent="submitPost">
      <label class="field">
        <span>제목</span>
        <input v-model="form.title" type="text" placeholder="제목" />
      </label>

      <label class="field">
        <span>작성자</span>
        <input v-model="form.writer" type="text" placeholder="작성자" />
      </label>

      <label class="field">
        <span>내용</span>
        <textarea
          v-model="form.content"
          rows="10"
          placeholder="내용"
        ></textarea>
      </label>

      <label class="field">
        <span>비밀번호</span>
        <input v-model="form.password" type="password" placeholder="비밀번호" />
      </label>

      <div class="actions">
        <RouterLink to="/" class="cancel-button">취소</RouterLink>
        <button type="submit" class="submit-button">저장</button>
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
  border: 1px solid #dbe3f0;
  border-radius: 20px;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.96), rgba(248, 250, 252, 0.96)),
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
  border-color: #2563eb;
  box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.12);
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
.ghost-button {
  color: #2563eb;
  background: #eff6ff;
}

.submit-button {
  border: 0;
  color: #fff;
  background: linear-gradient(135deg, #2563eb, #1d4ed8);
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
