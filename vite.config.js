import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  base: "./",
  server: {
    port: 3000,
    host: true,
    allowedHosts: true,
    open: false
  },
  build: {
    outDir: "dist",
    // всё медиа вшивается в бандл как data:URI — чтобы собрать один .html
    assetsInlineLimit: 256 * 1024 * 1024
  },
  resolve: {
    alias: {
      "@": "/src"
    }
  }
});