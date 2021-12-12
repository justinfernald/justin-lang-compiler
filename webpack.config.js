const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const webpack = require("webpack");

module.exports = {
    entry: "./src/index.js",
    mode: "development",
    devtool: "inline-source-map",
    devServer: {
        static: "./dist",
    },
    resolve: {
        fallback: {
            path: require.resolve("path-browserify"),
            crypto: require.resolve("crypto-browserify"),
            buffer: require.resolve("buffer-browserify"),
            stream: require.resolve("stream-browserify"),
            assert: require.resolve("assert/"),
            fs: false,
        },
    },
    output: {
        filename: "bundle.js",
        // eslint-disable-next-line no-undef
        path: path.resolve(__dirname, "dist"),
        clean: true,
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: "src/index.html",
            inject: false,
        }),
        new webpack.ProvidePlugin({
            wabt: "wabt",
        }),
    ],
};
