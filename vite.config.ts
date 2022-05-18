import { defineConfig } from "vite";
import solid from "vite-plugin-solid"
import path from "path";

export default defineConfig({
  plugins: [solid()],
  build: {
    lib: {
      entry: path.resolve(__dirname, "src/index.ts"),
      formats: ["es", "cjs"],
    },
    rollupOptions: {
      // make sure to externalize deps that shouldn't be bundled
      // into your library
      external: ["solid-js"],
    },
  },
});
