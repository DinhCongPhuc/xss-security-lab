import js from "@eslint/js";
import { defineConfig } from "eslint/config";
import tseslint from "typescript-eslint";
export default defineConfig([
  { ignores: ["**/dist/**", "playwright-report/**", "test-results/**"] },
  {
    files: ["**/*.ts", "**/*.tsx"],
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
  },
  {
    files: ["**/*.mjs"],
    extends: [js.configs.recommended],
    languageOptions: { globals: { console: "readonly", process: "readonly" } },
  },
]);
