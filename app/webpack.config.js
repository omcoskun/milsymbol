// Webpack 5 + Babel 7 for the React editor. `npm start` serves it on
// http://localhost:3008; `npm run build` writes app/build/.
//
// IWC (hap or hwf, from the environment) is written into the bundle as the
// IWC constant; config.json and lang.json are fetched at run time.
import path from "node:path";
import { fileURLToPath } from "node:url";
import webpack from "webpack";
import HtmlWebpackPlugin from "html-webpack-plugin";
import CopyWebpackPlugin from "copy-webpack-plugin";

const here = path.dirname(fileURLToPath(import.meta.url));
const iwcValues = ["hap", "hwf"];

export default (env, argv) => {
  const iwc = process.env.IWC || "hap";
  if (!iwcValues.includes(iwc)) throw new Error(`IWC must be one of ${iwcValues.join(", ")}; it is "${iwc}".`);
  const production = argv.mode === "production";
  return {
    entry: path.join(here, "src", "index.jsx"),
    output: {
      path: path.join(here, "build"),
      filename: production ? "[name].[contenthash:8].js" : "[name].js",
      clean: true
    },
    resolve: { extensions: [".js", ".jsx"] },
    module: {
      rules: [
        {
          // The app, the library (../src, ../index.js) and the editor rules (../studio).
          test: /\.jsx?$/,
          exclude: /node_modules/,
          use: { loader: "babel-loader", options: { configFile: path.join(here, "babel.config.json") } }
        }
      ]
    },
    plugins: [
      new webpack.DefinePlugin({ IWC: JSON.stringify(iwc) }),
      new HtmlWebpackPlugin({ template: path.join(here, "src", "index.html") }),
      new CopyWebpackPlugin({
        patterns: [
          { from: path.join(here, "public"), to: "." },
          { from: path.join(here, "..", "studio", "favicon.svg"), to: "favicon.svg" }
        ]
      })
    ],
    devtool: production ? "source-map" : "eval-cheap-module-source-map",
    performance: { hints: false },
    devServer: {
      port: 3008,
      static: { directory: path.join(here, "public"), watch: false },
      client: { overlay: { warnings: false, errors: true } }
    }
  };
};
