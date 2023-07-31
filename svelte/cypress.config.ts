import { defineConfig } from "cypress";

export default defineConfig({
  component: {
    devServer: {
      framework: "svelte",
      bundler: "vite",
    },
    viewportHeight: 500,
    viewportWidth: 500,
  },
});
