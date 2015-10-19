import './actions';
import './Stores/Commands';
import {setServices, beforeQuit, willQuit} from './Stores/Services';
import {setupDock} from './dock';
let _app;

export function setup(services, app) {
  _app = app;

  setServices(services);
  setupDock(app);

  app.on('will-quit', willQuit);
  app.on('before-quit', beforeQuit);
}

export function getApp() {
  return _app;
}
