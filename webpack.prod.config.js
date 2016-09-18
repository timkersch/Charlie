/**
 * Created by Tim on 18/09/16.
 */

var path = require('path');
var webpack = require('webpack');

module.exports = {
    entry: __dirname + '/public/js/app.js',
    output: {
        path: __dirname + '/public/dist',
        filename: 'bundle.js'
    },

    plugins: [
        new webpack.optimize.DedupePlugin(),
        new webpack.optimize.UglifyJsPlugin({
            minimize: true,
            compress: {
                warnings: false
            }
        }),
        new webpack.DefinePlugin({
            'process.env': {
                'NODE_ENV': JSON.stringify('production')
            }
        })
    ],

    module: {
        preLoaders: [
            {
                test: /\.(js|css|html)$/,
                exclude: /node_modules/,
                loader: "stripcomment"
            },

            {
                test: /\.js$/,
                exclude: /node_modules/,
                loader: "webpack-strip?strip[]=debug,strip[]=console.log"
            },


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
                test: /\.html$/,
                loader: "html-loader"
            },

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
        ]
    },
    devtool: 'cheap-module-source-map'
};