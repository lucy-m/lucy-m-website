import { svelte } from "@sveltejs/vite-plugin-svelte";
import { defineConfig } from "vite";
import filterReplaceBase from "vite-plugin-filter-replace";

const filterReplace = (filterReplaceBase as any)
  .default as typeof filterReplaceBase;

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    filterReplace([
      {
        filter: "index.html",
        replace: {
          from: "__BUILD_TIMESTAMP__",
          to: new Date().toISOString(),
        },
      },
    ]),
    svelte(),
  ],
  assetsInclude: ["**/*.PNG", "**/*.svg"],
});
