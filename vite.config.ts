// vite.config.ts (VERSÃO FINAL PARA VERCEL)

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
// import { componentTagger } from "lovable-tagger"; // Removido se não for usado no build

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  // ALTERAÇÃO FINAL: use './' para caminhos relativos.
  base: './', 
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    // mode === 'development' && componentTagger(), // Removido para simplificar o build de produção
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));