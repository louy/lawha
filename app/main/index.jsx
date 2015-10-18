import './actions';
import './Stores/Commands';
import {setServices} from './Stores/Services';
import {setupDock} from './dock';
let _app;

export function setup(services, app) {
  setServices(services);
  setupDock(app);

  _app = app;
}

export function getApp() {
  return _app;
}
