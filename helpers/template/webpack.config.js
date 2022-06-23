
const path = require('path');
const fs = require("fs");
const getBuilder = require("metaphorjs-build/src/func/getBuilder.js");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const WatchExternalFilesPlugin = require("webpack-watch-files-plugin").default;

const builder = getBuilder("app");
builder.prepare();
builder.createPrebuildFile();
const entry = builder.createEntryFile();

module.exports = {
    mode: "development",
    devtool: "cheap-module-source-map",
    entry: entry,
    output: builder.getTarget(),
    stats: 'minimal',
    watchOptions: {
        ignored: /node_modules/
    },
    devServer: {
        static: {
            directory: path.join(__dirname, 'build'),
        },
        compress: true,
        port: 9000,
        open: true
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                use: "babel-loader"
            },
            {
                test: /\.html$/,
                use: "null-loader"
            },
            {
                test: function (resource) {
                    return builder.getExcludeList().indexOf(resource) !== -1;
                },
                use: "null-loader"
            }
        ]
    },
    plugins: [
        new WatchExternalFilesPlugin({
            files: [
                './src/templates/**/*.html'
            ]
        }),
        new HtmlWebpackPlugin({
            filename: "index.html",
            templateContent: fs.readFileSync("src/index.html").toString()
        }),
        builder.getTemplateWatcher()
    ]
}