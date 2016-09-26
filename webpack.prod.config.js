/**
 * Created by Tim on 18/09/16.
 */

var webpack = require('webpack');

module.exports = {
    entry: __dirname + '/public/js/app.js',
    output: {
        path: __dirname + '/public/dist',
        filename: 'bundle.js',
    },

    plugins: [
        new webpack.optimize.DedupePlugin(),
        new webpack.optimize.UglifyJsPlugin({
            beautify: false,
            comments: false,
            minimize: true,

            mangle: {
                screw_ie8: true,
                keep_fnames: false,
            },

            compress: {
                warnings: false,
                drop_console: true
            },
        }),
        new webpack.DefinePlugin({
            'process.env': {
                'NODE_ENV': JSON.stringify('production')
            }
        })
    ],

    module: {
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
    }
};