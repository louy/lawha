var path = require('path');
var fs = require('fs');
var webpack = require('webpack');

var nodeModules = {};
fs.readdirSync('node_modules')
  .filter(function(x) {
    return ['.bin'].indexOf(x) === -1;
  })
  .concat(['browser-window', 'remote', 'ipc', 'protocol'])
  .forEach(function(mod) {
    nodeModules[mod] = 'commonjs ' + mod;
  });

module.exports = {
  entry: {
    'main': './main/index',
  },
  context: path.join(__dirname, 'app'),
  module: {
    loaders: [{
      test: /\.jsx?$/,
      loaders: ['babel-loader'],
      exclude: /node_modules/,
    }, {
      // json
      test: /\.json$/,
      loaders: ['json-loader'],
    },],
  },
  output: {
    path: path.join(__dirname, 'app/dist'),
    filename: '[name].js',

    // libraryTarget: 'commonjs2'
  },
  resolve: {
    extensions: ['', '.js', '.jsx'],
  },
  target: 'node',
  plugins: [
    new webpack.NoErrorsPlugin(),
    new webpack.DefinePlugin({
      '__DEV__': process.env.NODE_ENV === 'development',
    }),
  ],
  externals: nodeModules,
};
