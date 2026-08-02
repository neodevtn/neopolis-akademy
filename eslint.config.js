import js from "@eslint/js";
import tseslint from "typescript-eslint";
import reactHooks from "eslint-plugin-react-hooks";

export default tseslint.config(
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    plugins: {
      "react-hooks": reactHooks,
    },
    rules: {
      // Enforce Rules of Hooks - prevents conditional hook calls
      "react-hooks/rules-of-hooks": "error",
      // Warn on missing dependencies in useEffect/useMemo/useCallback
      "react-hooks/exhaustive-deps": "warn",
      // Relax some TypeScript rules for existing codebase
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
    },
  },
  {
    ignores: [
      "node_modules/",
      "dist/",
      ".manus-logs/",
      "client/public/__manus__/",
    ],
  }
);
