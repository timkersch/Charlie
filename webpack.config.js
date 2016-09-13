/**
 * Created by Tim on 12/09/16.
 */

var path = require('path');
var webpack = require('webpack');

module.exports = {
    entry: __dirname + '/public/js/app.js',
    output: {
        path: __dirname + '/public/dist',
        filename: 'bundle.js'
    },
    module: {
        loaders: [
            {
                test: /\.css$/,
                loader: "style-loader!css-loader"
            },

            {
                test: /\.(jpe?g|png|gif|svg)$/i,
                loader:'file'
            },

            {
                test: /\.(jpe?g|png|gif|svg|eot|woff|ttf|svg|woff2)$/,
                loader: "file?name=[name].[ext]"
            },

            {
                test: /\.html$/,
                loader: "html-loader"
            }
        ]
    },
    debug: true,
    devtool: 'source-map'
};