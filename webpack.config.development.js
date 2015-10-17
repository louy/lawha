/* eslint strict: 0 */
'use strict';

var webpack = require('webpack');
var webpackTargetElectronRenderer = require('webpack-target-electron-renderer');
var baseConfig = require('./webpack.config.base');


var config = Object.create(baseConfig);

config.debug = true;

config.devtool = 'cheap-source-map';

config.entry = {
  renderer: [
    'webpack-hot-middleware/client?path=http://localhost:6060/__webpack_hmr',
    './renderer/index'
  ],
  main: './main/index',
};

config.output.publicPath = 'http://localhost:6060/dist/';

config.module.loaders.push({
  test: /^((?!\.module).)*\.css$/,
  loaders: [
    'style-loader',
    'css-loader'
  ]
}, {
  test: /\.less$/,
  loaders: [
    'style-loader',
    'css-loader',
    'less-loader',
  ]
}, {
  test: /\.s[ac]ss$/,
  loaders: [
    'style-loader',
    'css-loader',
    'sass-loader',
  ]
}, {
  test: /\.module\.css$/,
  loaders: [
    'style-loader',
    'css-loader?modules&importLoaders=1&localIdentName=[name]__[local]___[hash:base64:5]!'
  ]
});


config.plugins.push(
  new webpack.HotModuleReplacementPlugin(),
  new webpack.NoErrorsPlugin(),
  new webpack.DefinePlugin({
    '__DEV__': true,
    'process.env.NODE_ENV': JSON.stringify('development'),
  })
);

config.target = webpackTargetElectronRenderer(config);

module.exports = config;
