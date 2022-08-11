const path = require("path");

module.exports = {
  devServer: {
    port: 3000,
    historyApiFallback: true,
  },
  mode: "development",
  entry: "./src/app.ts",
  output: {
    filename: "bundle.js",
    path: path.resolve(__dirname, "dist"),
    publicPath: "dist",
  },
  devtool: "inline-source-map",
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: "ts-loader",
        exclude: path.resolve(__dirname, "node_modules"),
      },
    ],
  },

  resolve: {
    extensions: [".ts", ".js"],
  },
};
