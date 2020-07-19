module.exports = {
  mode: "production",
  entry: {
    script: "./src/assets/js/script.js",
  },
  output: {
    path: __dirname + "/dist/assets/js/",
    filename: "[name].js",
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: ["babel-loader"],
      },
    ],
  },
};
