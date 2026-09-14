import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import cesium from "vite-plugin-cesium";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    cesium(), // Handles CesiumJS static asset copying & CESIUM_BASE_URL injection
  ],
  server: {
    port: 5173,
    proxy: {
      // Proxy API calls to the FastAPI backend during development
      "/api": {
        target: "http://localhost:8000",
        changeOrigin: true,
      },
    },
  },
  build: {
    // CesiumJS is handled externally by vite-plugin-cesium; no manual chunking needed
    chunkSizeWarningLimit: 5000,
  },
});
