
const path = require('path');
const fs = require("fs");
const getBuilder = require("metaphorjs-build/src/func/getBuilder.js");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const WatchExternalFilesPlugin = require("webpack-watch-files-plugin").default;

const builder = getBuilder("test");
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
    optimization: {
        concatenateModules: true
    },
    devServer: {
        static: {
            directory: path.join(__dirname, 'dev-test'),
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
                './dev-test/templates/**/*.html'
            ]
        }),
        builder.getTemplateWatcher()
    ]
}