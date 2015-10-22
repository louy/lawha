// Actions
import ipc from 'electron-safe-ipc/host';
import _actions from '../shared/actions';

import debug from 'debug';
const log = debug('app:actions-remote');

ipc.on('fromRenderer', function fromRenderer(action, ...args) {
  log('fromRenderer', action, ...args);
  if (!_actions[action]) {
    const err = new Error('Unrecognised action: ' + action);
    console.warn(err);
    return err;
  }
  _actions[action](...args);
});

const actions = {};

Object.keys(_actions).forEach(action => {
  actions[action] = (...args) => {
    log('send fromMain', action, ...args);
    return ipc.send('fromMain', action, ...args);
  };
  actions[action].on = (event, func) => {
    _actions[action].on(event, func);
  };
  actions[action].off = (event, func) => {
    _actions[action].off(event, func);
  };
  actions[action].handlerName = _actions[action].handlerName;
});

export default actions;
