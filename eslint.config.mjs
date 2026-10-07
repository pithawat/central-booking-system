import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
 {files:['src/features/cars/**/*.{ts,tsx}'],rules:{'no-restricted-imports':['error',{patterns:['@/shared/data/mock','@/shared/data/mock/*','@/shared/data/api','@/shared/data/api/*','@/features/rooms/*']}] }},
 {files:['src/features/rooms/**/*.{ts,tsx}'],rules:{'no-restricted-imports':['error',{patterns:['@/shared/data/mock','@/shared/data/mock/*','@/shared/data/api','@/shared/data/api/*','@/features/cars/*']}] }},
 {files:['src/app/**/*.{ts,tsx}','src/shared/ui/**/*.{ts,tsx}'],rules:{'no-restricted-imports':['error',{patterns:['@/shared/data/mock','@/shared/data/mock/*','@/shared/data/api','@/shared/data/api/*']}] }},

  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
