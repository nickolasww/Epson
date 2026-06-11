import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  esbuild: {
    drop: ["console", "debugger"],
  },
  server: {
    port: 5173,
    proxy: {
      // Proxy /api/* to the FastAPI backend so Ant Design Upload's action="/api/upload" works
      "/api": {
        target: "http://localhost:8000",
        changeOrigin: true,
      },
    },
  },
});
