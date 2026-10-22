import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

export default defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    rules: {
      // Existing pages intentionally reset loading state inside data-loading effects.
      // Keep this as a warning until those effects are migrated to a shared loader.
      "react-hooks/set-state-in-effect": "warn",
    },
  },
  globalIgnores([
    ".next/**",
    ".netlify/**",
    "node_modules/**",
    "out/**",
    "next-env.d.ts",
  ]),
]);
