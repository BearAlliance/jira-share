import js from "@eslint/js";

export default [
  js.configs.recommended,
  {
    files: ["content.js", "popup.js"],
    languageOptions: {
      ecmaVersion: 2022,
      globals: {
        document: "readonly",
        window: "readonly",
        navigator: "readonly",
        MutationObserver: "readonly",
        chrome: "readonly",
        setTimeout: "readonly",
        clearTimeout: "readonly",
        URL: "readonly",
        URLSearchParams: "readonly",
      },
    },
    rules: {
      "no-unused-vars": "warn",
      "no-console": "warn",
    },
  },
  {
    ignores: ["node_modules/", "icons/"],
  },
];
