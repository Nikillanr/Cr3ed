// Generated using webpack-cli https://github.com/webpack/webpack-cli

const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const WorkboxWebpackPlugin = require("workbox-webpack-plugin");
const Dotenv = require("dotenv-webpack");

const isProduction = process.env.NODE_ENV === "production";

const stylesHandler = "style-loader";

const config = {
  entry: "./src/index.js",
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "bundle.js",
    publicPath: "/", // Important: this ensures correct routing
  },
  devServer: {
    historyApiFallback: true, // This line is important for SPA routing
    static: {
      directory: path.join(__dirname, "public"),
    },
    open: true,
    host: "localhost",
    port: 8081, // You can change the port if needed
  },

  plugins: [
    new HtmlWebpackPlugin({
      template: "./public/index.html",
    }),
    new Dotenv(),
    // Add your plugins here
    // Learn more about plugins from https://webpack.js.org/configuration/plugins/
  ],
  resolve: {
    extensions: [".js", ".jsx"], // Resolve .js and .jsx file extensions
    fallback: {
      http: require.resolve("stream-http"),
      https: require.resolve("https-browserify"),
      zlib: require.resolve("browserify-zlib"),
      url: require.resolve("url/"),
      util: require.resolve("util/"),
      assert: require.resolve("assert/"),
      stream: require.resolve("stream-browserify"),
    },
  },
  module: {
    rules: [
      {
        test: /\.s[ac]ss$/i,
        use: [stylesHandler, "css-loader", "postcss-loader", "sass-loader"],
      },
      {
        test: /\.css$/i,
        use: [stylesHandler, "css-loader", "postcss-loader"],
      },
      {
        test: /\.(eot|svg|ttf|woff|woff2|png|jpg|gif)$/i,
        type: "asset",
      },
      {
        test: /\.(js|jsx)$/, // Match .js and .jsx files
        exclude: /node_modules/, // Exclude node_modules
        use: {
          loader: "babel-loader", // Use Babel to transpile JSX and ES6
          options: {
            presets: ["@babel/preset-env", "@babel/preset-react"],
          },
        },
      },

      // Add your rules for custom modules here
      // Learn more about loaders from https://webpack.js.org/loaders/
    ],
  },
};

module.exports = () => {
  if (isProduction) {
    config.mode = "production";

    config.plugins.push(new WorkboxWebpackPlugin.GenerateSW());
  } else {
    config.mode = "development";
  }
  return config;
};
