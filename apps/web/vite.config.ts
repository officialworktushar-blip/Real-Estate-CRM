import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 5173,
    proxy: {
      "/api": {
        target: "http://localhost:4000",
        changeOrigin: true,
      },
    },
  },
  build: {
    sourcemap: false,
    cssCodeSplit: true,
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes("node_modules")) return;

          if (
            id.includes("react") ||
            id.includes("react-dom") ||
            id.includes("scheduler") ||
            id.includes("react-router")
          ) {
            return "react-vendor";
          }
          if (id.includes("@supabase")) return "supabase";
          if (id.includes("zustand")) return "state";
          if (id.includes("lucide-react")) return "icons";
          if (id.includes("date-fns")) return "date-utils";
          if (id.includes("clsx") || id.includes("tailwind-merge"))
            return "utils";
          return "vendor";
        },
      },
    },
  },
});
