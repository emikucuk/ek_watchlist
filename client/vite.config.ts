import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "node:path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": resolve(__dirname, "src"),
    },
  },
  server: {
    host: "0.0.0.0",
    port: 5170,
    strictPort: true,
    // Tailscale: MagicDNS (*.ts.net) veya 100.x IP — Vite 6 host koruması
    allowedHosts: true,
    proxy: {
      "/api": {
        target: "http://localhost:3100",
        changeOrigin: true,
      },
      "/auth": {
        target: "http://localhost:3100",
        changeOrigin: true,
      },
    },
  },
});
