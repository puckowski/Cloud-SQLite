const webpack = require('webpack');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');

var config = {
    context: __dirname + '/src',
    entry: {
        app: './index.js',
    },
    output: {
        path: __dirname + '/dist',
        filename: 'dist.js',
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: [{
                    loader: 'babel-loader',
                    options: {
                      plugins: ['@babel/plugin-syntax-dynamic-import']
                    }
                  }]
            },
            {
                test: /\.css$/,
                use: [
                    'style-loader',
                    'css-loader'
                ]
            }
        ]
    },
    optimization: {
        minimize: true,
        minimizer: [new TerserPlugin({
            terserOptions: {
                ecma: undefined,
                warnings: false,
                parse: {},
                compress: {},
                mangle: true,
                module: false,
                output: null,
                toplevel: false,
                nameCache: null,
                ie8: false,
                keep_classnames: undefined,
                keep_fnames: false,
                safari10: false
            },
            extractComments: true,
        })],
    },
    plugins: [
        new CopyWebpackPlugin([
            { from: './*.html', to: '' },
            { from: './css', to: '' },
            { from: './js', to: '' },
            { from: './icons', to: '' }
        ]),
    ]
};

module.exports = config;
