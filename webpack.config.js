/**
 * Created by Tim on 12/09/16.
 */

var webpack = require('webpack');

module.exports = {
    entry: __dirname + '/public/js/app.js',
    output: {
        path: __dirname + '/public/dist',
        filename: 'bundle.js'
    },
    module: {
        preLoaders: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                loader: 'jshint-loader'

            }
        ],

        loaders: [
            {
                test: /\.js$/,
                loader: 'babel',
                exclude: /node_modules/,
                query: {
                    presets: ['es2015']
                }
            },

            {
                test: /\.css$/,
                loader: "style-loader!css-loader"
            },
        ]
    },
    jshint: {
        esversion: 6,
        curly: true,
        eqeqeq: true,
        undef: true,
        unused: true,
        browser: true,
        predef: [ "console", "angular", "alert"]
    },
    debug: true,
    devtool: 'eval',
    watch: true
};