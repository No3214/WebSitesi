// For more info, see https://github.com/storybookjs/eslint-plugin-storybook#configuration-flat-config-format
import storybook from "eslint-plugin-storybook";

import { FlatCompat } from "@eslint/eslintrc";

const compat = new FlatCompat({
  baseDirectory: import.meta.dirname,
});

const eslintConfig = [
  { ignores: [".next/**", "dist/**", "build/**", "storybook-static/**", "test-results/**", "playwright-report/**", "src/payload-types.ts", "next-env.d.ts", "public/**", "*.log", "_legacy-emergent/**", "agent/**", "scripts/**"] },
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  ...storybook.configs["flat/recommended"]
];

export default eslintConfig;
