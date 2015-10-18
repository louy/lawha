/* eslint strict: 0, vars-on-top: 0 */
'use strict';

var path = require('path');

module.exports = {
  context: path.join(__dirname, 'app'),
  module: {
    loaders: [{
      test: /\.jsx?$/,
      loaders: ['babel-loader'],
      exclude: /node_modules/,
    }, {
      // Fonts
      test: /\.(ttf|eot|svg|woff(2)?)(\?[a-z0-9]+)?$/,
      loaders: ['file-loader'],
    }, {
      // json
      test: /\.json$/,
      loaders: ['json-loader'],
    }],
  },
  output: {
    path: path.join(__dirname, 'app/dist'),
    filename: '[name].js',

    // libraryTarget: 'commonjs2'
  },
  resolve: {
    extensions: ['', '.js', '.jsx'],
    packageMains: ['webpack', 'browser', 'web', 'browserify', ['jam', 'main'], 'main'],
  },
  plugins: [

  ],
  externals: [

    // put your node 3rd party libraries which can't be built with webpack here (mysql, mongodb, and so on..)
  ],
};
