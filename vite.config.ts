import { defineConfig } from "vite";
import path from "path";

export default defineConfig({
  plugins: [],
  build: {
    lib: {
      entry: path.resolve(__dirname, "src/index.js"),
      name: "solid-contextmenu",
      formats: ["es", "cjs", "umd"],
    },
  },
});
