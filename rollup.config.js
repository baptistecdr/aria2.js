import nodePolyfills from "rollup-plugin-polyfill-node";

export default [
  {
    input: "src/Aria2.js",
    output: {
      file: "dist/esm/index.js",
      format: "esm",
    },
  },
  {
    input: "src/Aria2.js",
    output: {
      file: "dist/esm-browser/bundle.js",
      format: "esm",
    },
    plugins: [nodePolyfills()],
  },
];
