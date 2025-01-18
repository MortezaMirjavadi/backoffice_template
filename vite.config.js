import * as path from "path";

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import rollupReplace from "@rollup/plugin-replace";
import { resolve } from "path";
import fs from "fs";

function getAppEntries() {
  const baseDir = resolve(__dirname, "apps");
  const entries = {};

  fs.readdirSync(baseDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .forEach((dir) => {
      if (dir.name !== "shell") {
        const appName = dir.name;
        const entryPath = resolve(baseDir, appName, "index.html");
        entries[appName] = entryPath;
      }
    });
  console.log(entries);
  return entries;
}

const appEntries = getAppEntries();

export default defineConfig({
  provide: {
    React: "react",
  },
  server: {
    port: 3000,
  },
  entry: "server.ts",
  plugins: [
    rollupReplace({
      preventAssignment: true,
      values: {
        "process.env.NODE_ENV": JSON.stringify("development"),
      },
    }),
    react(),
  ],
  build: {
    sourcemap: true,
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, "index.html"),
        ...appEntries,
      },
    },
    outDir: "dist",
    server: {
      open: true,
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      ui: path.resolve(__dirname, "./src/components/ui"),
      "shared-ui": path.resolve(__dirname, "./src/components/shared"),
    },
  },
});
