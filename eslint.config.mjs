import nextVitals from "eslint-config-next/core-web-vitals";
import prettier from "eslint-config-prettier";
import betterTailwindcss from "eslint-plugin-better-tailwindcss";

const config = [
  ...nextVitals,
  prettier,
  {
    plugins: { "better-tailwindcss": betterTailwindcss },
    settings: { "better-tailwindcss": { entryPoint: "./app/globals.css" } },
    rules: {
      "better-tailwindcss/enforce-consistent-class-order": "error",
      "better-tailwindcss/no-conflicting-classes": "error",
      "react/no-unescaped-entities": "off",
    },
  },
];

export default config;
