import { dts } from "rollup-plugin-dts";
import nodePolyfills from "rollup-plugin-polyfill-node";

export default [
  {
    input: "src/Aria2.js",
    output: {
      file: "dist/esm/index.js",
      format: "esm",
    },
    external: ["events"],
  },
  {
    input: "src/Aria2.js",
    output: {
      file: "dist/esm-browser/bundle.js",
      format: "esm",
    },
    plugins: [nodePolyfills()],
  },
  {
    input: "src/Aria2.d.ts",
    output: {
      file: "dist/index.d.ts",
      format: "esm",
    },
    plugins: [dts()],
    external: ["events"],
  },
];
