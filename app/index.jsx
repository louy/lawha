import React from 'react';
import App from './Components/App';
import './app.css';
import './css/photon.css';

React.render(<App />, document.body);

var ipc = require("electron-safe-ipc/guest");

ipc.on('fromMain', function (a, b) {
  ipc.send('fromRenderer', a, b);
});
