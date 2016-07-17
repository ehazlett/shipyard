var path = require('path');
var express = require('express');
var webpack = require('webpack');
var config = require('./webpack.config.dev');

var app = express();
var compiler = webpack(config);
var proxy = require('http-proxy-middleware');

app.use(require('webpack-dev-middleware')(compiler, {
  noInfo: true,
  publicPath: config.output.publicPath
}));

app.use(require('webpack-hot-middleware')(compiler));

// var wsProxy = proxy('ws://' + process.env.CONTROLLER_URL.replace('http://', '') + '/ws/events', {changeOrigin: true, ws: true})
// app.use(wsProxy);

var controllerUrl = process.env.CONTROLLER_URL || "http://controller:8080";

app.use('*', proxy({target: controllerUrl, changeOrigin: true}));
app.get('/', function(req, res) {
  res.sendFile(path.join(__dirname, 'index.html'));
});

var server = app.listen(8080, '0.0.0.0', function(err) {
  if (err) {
    console.log(err);
    return;
  }

  console.log('Listening at http://0.0.0.0:8080');
});

// server.on('upgrade', wsProxy.upgrade);
