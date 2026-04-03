import globals from "globals"
import pluginJs from "@eslint/js"

export default [
  pluginJs.configs.recommended,
  {
    files: ["**/*.js", "**/*.jsx"],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },
      ecmaVersion: 2022,
      sourceType: "module",
    },
    rules: {
      "no-unused-vars": "warn",
      "no-undef": "error",
      "semi": ["error", "always"],
      "quotes": ["warn", "single"],
      "indent": ["warn", 2],
      "no-trailing-spaces": "warn",
      "eol-last": ["warn", "always"],
      "no-control-regex": "off",
    },
  },
  {
    files: ["**/*.jsx"],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
        React: "readonly",
        useState: "readonly",
        useEffect: "readonly",
        useCallback: "readonly",
        useRef: "readonly",
        useMemo: "readonly",
      },
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
        ecmaVersion: 2022,
      },
    },
    rules: {
      "react/prop-types": "off",
      "react/react-in-jsx-scope": "off",
    },
  },
]
