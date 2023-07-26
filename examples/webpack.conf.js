/* eslint-disable no-var */

var webpack = require('webpack');
var path = require('path');
var PORT = 8081

module.exports = {
    devtool: 'source-map',
    cache: true,

    entry: {
        app: [
            './index.js'
        ]
    },

    output: {
        path: path.resolve(__dirname, 'build'),
        publicPath: `http://localhost:${PORT}/build/`,
        filename: '[name].js'
    },

    module: {
        loaders: [
            {
                test: /\.js?$/,
                exclude: /node_modules/,
                loaders: [
                    'babel-loader'
                ],
                cacheDirectory: true
            },
            {
                test: /\.css?$/,
                loaders: [
                    'style-loader',
                    'css-loader'
                ],
                cacheDirectory: true
            }
        ]
    },

    plugins: [
        new webpack.DefinePlugin({
            process: {
                env: {
                    NODE_ENV: JSON.stringify(process.env.NODE_ENV)
                }
            }
        })
    ],

    devServer: {
           contentBase: './',
           port: PORT
    }
};
