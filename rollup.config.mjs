import commonjs from "@rollup/plugin-commonjs";
import resolve from "@rollup/plugin-node-resolve";
import typescript from "@rollup/plugin-typescript";
import peerDepsExternal from "rollup-plugin-peer-deps-external";

import pkg from "./package.json" assert { type: "json" };

const config = {
    input: "src/index.tsx",
    output: [
        {
            file: pkg.main,
            format: "cjs",
            exports: "auto",
            sourcemap: true,
            inlineDynamicImports: true
        },
        {
            file: pkg.module,
            format: "esm",
            exports: "auto",
            sourcemap: true,
            inlineDynamicImports: true
        }
    ],
    external: ["react", "dayjs"],
    plugins: [
        peerDepsExternal(),
        resolve(),
        commonjs(),
        typescript({ tsconfig: "./tsconfig.json", jsx: "react" })
    ]
};

export default config;
