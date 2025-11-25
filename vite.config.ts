import path from "path";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: { alias: { "@": path.resolve(__dirname, "./src") } },

  server: {
    port: Number(process.env.PORT) || 3000,
    strictPort: true,
    proxy: {
      // 🔐 인증 관련 프록시는 ❌ 제거
      // "/auth": {
      //   target: "http://18.205.229.159:8000",
      //   changeOrigin: true,
      // },

      "/api": {
        target: "http://18.205.229.159:8000",
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api/, ""),
      },
      "/v1": {
        target: "http://18.205.229.159:8000",
        changeOrigin: true,
      },
    },
    host: true,
  },
});
