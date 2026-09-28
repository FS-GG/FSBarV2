import { defineConfig } from "vite";
import { resolve } from "node:path";

export default defineConfig({
  resolve: {
    alias: {
      long: resolve(import.meta.dirname, "node_modules/long/index.js"),
      "protobufjs/minimal.js": resolve(import.meta.dirname, "node_modules/protobufjs/minimal.js")
    }
  },
  build: {
    emptyOutDir: true,
    lib: {
      entry: resolve(import.meta.dirname, "entry.js"),
      formats: ["es"],
      fileName: () => "assets/barc-preview.js"
    },
    cssCodeSplit: false,
    rollupOptions: { output: { assetFileNames: "assets/barc-preview.css" } }
  }
});
