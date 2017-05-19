// webpack.config.js
var webpack = require('webpack');

var ExtractTextPlugin = require("extract-text-webpack-plugin");
module.exports = {
    // The standard entry point and output config
    target: "node",
    entry: {
        app : ["./app/app.js"],
    },
    output: {
        filename: "./js/[name].js",
        chunkFilename: "[id].js"
    },
    module: {
        loaders: [
            // Extract css files
            {
                test: /\.css$/,
                loader: ExtractTextPlugin.extract("css-loader")
            }
        ]
    },
    // Use the plugin to specify the resulting filename (and add needed behavior to the compiler)
    plugins: [
        new ExtractTextPlugin("./js/[name].css"),
        new webpack.ProvidePlugin({
            _: 'underscore'
        })
    ]
}
