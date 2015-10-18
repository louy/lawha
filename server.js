/* eslint strict: 0, vars-on-top: 0, no-console: 0 */
'use strict';

var path = require('path');
var express = require('express');
var webpack = require('webpack');
var config = require('./webpack.config.development');

var app = express();
var compiler = webpack(config);

app.use(require('webpack-dev-middleware')(compiler, {
  publicPath: config.output.publicPath,
  stats: {
    colors: true,
  },
}));

app.use(require('webpack-hot-middleware')(compiler));

app.get('*', function get(req, res) {
  res.sendFile(path.join(__dirname, 'app/renderer', 'hot-dev-app.html'));
});

app.listen(6060, 'localhost', function listening(err) {
  if (err) {
    console.log(err);
    return;
  }

  console.log('Listening at http://localhost:6060');
});
