/* eslint strict: 0 */
'use strict';

process.env.NODE_ENV = 'production';

var webpack = require('webpack');
var ExtractTextPlugin = require('extract-text-webpack-plugin');
var webpackTargetElectronRenderer = require('webpack-target-electron-renderer');
var baseConfig = require('./webpack.config.base');

var config = Object.create(baseConfig);

config.devtool = 'source-map';

config.entry = {
  renderer: './renderer/index',
};

config.output.publicPath = '/dist/';

var stylesTextPlugin = new ExtractTextPlugin('style.css', { allChunks: true });

config.module.loaders.push({
  test: /^((?!\.module).)*\.(c|sc|sa)ss$/,
  loader: stylesTextPlugin.extract(
    'style-loader',
    'css-loader!less-loader'
  ),
});

config.plugins.push(
  new webpack.optimize.OccurenceOrderPlugin(),
  new webpack.DefinePlugin({
    '__DEV__': false,
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
  }),
  new webpack.optimize.UglifyJsPlugin({
    compressor: {
      screw_ie8: true,
      warnings: false,
    },
  }),
  stylesTextPlugin
);

config.target = webpackTargetElectronRenderer(config);

module.exports = config;
