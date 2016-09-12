/**
 * Created by Tim on 12/09/16.
 */

var path = require('path');
var webpack = require('webpack');

module.exports = {
    entry: __dirname + '/public/js/app.js',
    output: {
        path: __dirname + '/public',
        filename: 'bundle.js'
    },
    debug: true,
    devtool: 'source-map'
};