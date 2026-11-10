export default [
  {
    files: ["src/**/*.js", "test/**/*.{js,mjs}", "studio/**/*.js"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module"
    },
    rules: {
      semi: ["error", "always"],
      "prefer-const": "error"
    }
  },
  {
    // The React editor (app/): JSX in .js and .jsx modules.
    files: ["app/src/**/*.{js,jsx}"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      parserOptions: { ecmaFeatures: { jsx: true } }
    },
    rules: {
      semi: ["error", "always"],
      "prefer-const": "error"
    }
  }
];
