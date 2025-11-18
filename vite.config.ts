// vite.config.ts
import path from "path";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  // 🔥 여기 있던 server.proxy /api 설정은 지우기
  // server: {
  //   proxy: {
  //     "/api": {
  //       target: "http://18.205.229.159:8000",
  //       changeOrigin: true,
  //       rewrite: (p) => p.replace(/^\/api/, ""),
  //     },
  //   },
  // },
});
