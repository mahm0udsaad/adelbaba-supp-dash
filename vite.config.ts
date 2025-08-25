import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import { fileURLToPath } from "node:url"
import path from "node:path"

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // Keep '@/...' imports working like in Next.js
      "@": fileURLToPath(new URL("./", import.meta.url)),
      // Compatibility: map next/link to a shim that uses react-router-dom
      "next/link": fileURLToPath(new URL("./src/shims/next-link.tsx", import.meta.url)),
      // Compatibility: map next/navigation hooks to react-router-dom
      "next/navigation": fileURLToPath(new URL("./src/shims/next-navigation.ts", import.meta.url)),
      // Compatibility: map next/image to a simple wrapper over <img>
      "next/image": fileURLToPath(new URL("./src/shims/next-image.tsx", import.meta.url)),
    },
  },
  server: {
    port: 5173,
    open: true,
  },
  build: {
    sourcemap: true,
    outDir: "dist",
    rollupOptions: {
      input: path.resolve(__dirname, "index.html"),
    },
  },
})


