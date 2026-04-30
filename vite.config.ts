// Standard Vite config for a React + TypeScript project.
// We use @vitejs/plugin-react for Fast Refresh and JSX transforms.
// The "@" alias maps to ./src so imports look like "@/components/..."

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [
    // Enables React Fast Refresh during development + handles JSX transformation
    react(),
  ],
  resolve: {
    alias: {
      // "@/..." resolves to "src/..." throughout the project
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
