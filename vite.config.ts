import path from "path";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: { alias: { "@": path.resolve(__dirname, "./src") } },

  server: {
    // ✅ Vercel dev가 넘겨주는 PORT를 우선 사용
    port: Number(process.env.PORT) || 5173,
    // 포트를 자동으로 바꾸지 말고 실패시키기(불일치 디버그 쉬움)
    strictPort: true,
    // 로컬 단독 실행용 프록시(= vercel dev에서 /api는 함수가 먼저 매칭되므로 영향 없음)
    proxy: {
      // 🔐 인증 관련
      "/auth": {
        target: "http://18.205.229.159:8000",
        changeOrigin: true,
      },
      // 🔎 현재 로그인 유저, 기타 API
      "/api": {
        target: "http://18.205.229.159:8000",
        changeOrigin: true,
      },
      // 📦 유저 목록 등 v1 엔드포인트
      "/v1": {
        target: "http://18.205.229.159:8000",
        changeOrigin: true,
      },
    },
    // 일부 환경에서 IPv6 문제 회피
    host: true,
  },
});
