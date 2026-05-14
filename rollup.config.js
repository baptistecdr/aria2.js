import { dts } from "rollup-plugin-dts";

export default [
  {
    input: "src/Aria2.js",
    output: {
      file: "dist/esm/index.js",
      format: "esm",
      sourcemap: true,
    },
  },
  {
    input: "src/Aria2.js",
    output: {
      file: "dist/esm-browser/bundle.js",
      format: "esm",
      sourcemap: true,
    },
  },
  {
    input: "dist/types/Aria2.d.ts",
    output: {
      file: "dist/index.d.ts",
      format: "esm",
    },
    plugins: [dts()],
  },
];
