<script setup>
import { reactive } from "vue";
import { RouterLink, useRouter } from "vue-router";
import { setAccessToken, setAuthUser, setGuestMode } from "@/utils/auth";

const router = useRouter();

const form = reactive({
  username: "",
  password: "",
});

async function submitPost() {
  if (!form.username.trim()) {
    alert("아이디를 입력하세요.");
    return;
  }

  if (!form.password.trim()) {
    alert("비밀번호를 입력하세요.");
    return;
  }

  const response = await fetch("/api/auth/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(form),
  });

  if (!response.ok) {
    alert("로그인에 실패했습니다.");
    return;
  }

  const data = await response.json();
  setAccessToken(data.accessToken);
  setAuthUser(data.username, data.nickname);
  router.replace({ name: "BoardView" });
}

function enterAsGuest() {
  setGuestMode();
  router.replace({ name: "BoardView" });
}
</script>

<template>
  <section class="signin-shell">
    <div class="signin-card">
      <aside class="intro-panel">
        <h1>LOGIN</h1>
      </aside>

      <form class="signin-form" @submit.prevent="submitPost">
        <div class="form-header">
          <h2>로그인</h2>
        </div>

        <label class="field">
          <span>아이디</span>
          <input
            v-model="form.username"
            type="text"
            placeholder="아이디를 입력하세요"
            @keydown.enter.prevent="submitPost"
          />
        </label>

        <label class="field">
          <span>비밀번호</span>
          <input
            v-model="form.password"
            type="password"
            placeholder="비밀번호를 입력하세요"
            @keydown.enter.prevent="submitPost"
          />
        </label>

        <button type="submit" class="primary-button">로그인</button>

        <div class="sub-actions">
          <RouterLink :to="{ name: 'SignUpView' }" class="sub-link">회원가입</RouterLink>
          <button type="button" class="sub-button" @click="enterAsGuest">비회원 입장</button>
        </div>
      </form>
    </div>
  </section>
</template>

<style scoped>
.signin-shell {
  width: min(920px, calc(100% - 32px));
  margin: 64px auto;
}

.signin-card {
  display: grid;
  grid-template-columns: 1.05fr 0.95fr;
  overflow: hidden;
  border: 1px solid rgba(203, 213, 225, 0.8);
  border-radius: 36px;
  background: linear-gradient(180deg, #ffffff, #f3f4f6);
  box-shadow: 0 30px 64px rgba(15, 23, 42, 0.1);
}

.intro-panel {
  display: grid;
  align-items: center;
  padding: 42px 40px;
  color: #f8fafc;
  background:
    radial-gradient(circle at top left, rgba(255, 255, 255, 0.08), transparent 26%),
    radial-gradient(circle at bottom right, rgba(148, 163, 184, 0.16), transparent 30%),
    linear-gradient(160deg, #111827 0%, #374151 52%, #6b7280 100%);
}

.intro-panel h1 {
  margin: 0;
  font-size: clamp(44px, 5vw, 60px);
  line-height: 0.94;
  letter-spacing: -0.05em;
}

.signin-form {
  display: grid;
  align-content: center;
  gap: 20px;
  padding: 42px 38px;
  background:
    radial-gradient(circle at top right, rgba(255, 255, 255, 0.6), transparent 22%),
    radial-gradient(circle at bottom left, rgba(203, 213, 225, 0.24), transparent 26%),
    linear-gradient(180deg, #ffffff, #f8fafc);
}

.form-header h2 {
  margin: 0;
  color: #0f172a;
  font-size: 28px;
  letter-spacing: -0.03em;
}

.field {
  display: grid;
  gap: 9px;
}

.field span {
  color: #334155;
  font-size: 13px;
  font-weight: 700;
}

.field input {
  width: 100%;
  border: 1px solid #d1d9e6;
  border-radius: 18px;
  padding: 15px 16px;
  color: #0f172a;
  background: #ffffff;
  font: inherit;
  box-shadow: inset 0 1px 2px rgba(15, 23, 42, 0.03);
  transition: border-color 0.2s ease, box-shadow 0.2s ease, transform 0.2s ease;
}

.field input::placeholder {
  color: #94a3b8;
}

.field input:focus {
  outline: none;
  border-color: #4b5563;
  box-shadow: 0 0 0 4px rgba(107, 114, 128, 0.12);
  transform: translateY(-1px);
}

.primary-button {
  min-height: 54px;
  border: 0;
  border-radius: 18px;
  color: #ffffff;
  background: linear-gradient(135deg, #0f172a 0%, #374151 55%, #94a3b8 100%);
  font: inherit;
  font-weight: 800;
  cursor: pointer;
  box-shadow: 0 18px 30px rgba(17, 24, 39, 0.18);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.primary-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 22px 36px rgba(17, 24, 39, 0.22);
}

.sub-actions {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.sub-link,
.sub-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 46px;
  border-radius: 16px;
  font-weight: 700;
  text-decoration: none;
  transition: transform 0.2s ease, border-color 0.2s ease;
}

.sub-link {
  color: #ffffff;
  background: linear-gradient(135deg, #111827 0%, #4b5563 58%, #9ca3af 100%);
  box-shadow: 0 12px 22px rgba(31, 41, 55, 0.14);
}

.sub-button {
  border: 1px solid rgba(148, 163, 184, 0.18);
  color: #ffffff;
  background: linear-gradient(135deg, #1f2937 0%, #6b7280 58%, #d1d5db 100%);
  box-shadow: 0 12px 22px rgba(75, 85, 99, 0.14);
  cursor: pointer;
}

.sub-link:hover,
.sub-button:hover {
  transform: translateY(-1px);
}

@media (max-width: 820px) {
  .signin-card {
    grid-template-columns: 1fr;
  }

  .intro-panel,
  .signin-form {
    padding: 30px 24px;
  }
}

@media (max-width: 640px) {
  .signin-shell {
    margin: 28px auto;
  }

  .sub-actions {
    grid-template-columns: 1fr;
  }
}
</style>
