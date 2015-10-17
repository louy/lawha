/* eslint strict: 0 */
'use strict';

var webpack = require('webpack');
var ExtractTextPlugin = require('extract-text-webpack-plugin');
var webpackTargetElectronRenderer = require('webpack-target-electron-renderer');
var baseConfig = require('./webpack.config.base');


var config = Object.create(baseConfig);

config.devtool = 'source-map';

config.entry = {
  renderer: './renderer/index',
  main: './main/index',
};

config.output.publicPath = '/dist/';

var stylesTextPlugin = new ExtractTextPlugin('style.css', { allChunks: true });
var globalStylesTextPlugin = new ExtractTextPlugin('global-style.css', { allChunks: true });

config.module.loaders.push({
  test: /^((?!\.module).)*\.css$/,
  loader: globalStylesTextPlugin.extract(
    'style-loader',
    'css-loader'
  )
}, {
  test: /\.less$/,
  loaders: globalStylesTextPlugin.extract(
    'style-loader',
    'css-loader',
    'less-loader'
  )
}, {
  test: /\.s[ac]ss$/,
  loaders: globalStylesTextPlugin.extract(
    'style-loader',
    'css-loader',
    'sass-loader'
  )
}, {
  test: /\.module\.css$/,
  loader: stylesTextPlugin.extract(
    'style-loader',
    'css-loader?modules&importLoaders=1&localIdentName=[name]__[local]___[hash:base64:5]'
  )
});

config.plugins.push(
  new webpack.optimize.OccurenceOrderPlugin(),
  new webpack.DefinePlugin({
    '__DEV__': false,
    'process.env.NODE_ENV': JSON.stringify('production')
  }),
  new webpack.optimize.UglifyJsPlugin({
    compressor: {
      screw_ie8: true,
      warnings: false
    }
  }),
  stylesTextPlugin,
  globalStylesTextPlugin
);

config.target = webpackTargetElectronRenderer(config);

module.exports = config;
