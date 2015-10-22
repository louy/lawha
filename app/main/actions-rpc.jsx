// Actions
import ipc from 'electron-safe-ipc/host';
import _actions from '../shared/actions';

import debug from 'debug';
const log = debug('app:actions-rpc');

ipc.respond('fromRenderer', function fromRenderer(action, ...args) {
  log('fromRenderer', action, ...args);
  if (!_actions[action]) {
    const err = new Error('Unrecognised action: ' + action);
    console.warn(err);
    return err;
  }

  log('exec rpc', action, ...args);
  return new Promise((resolve, reject) => {
    _actions[action](resolve, reject, ...args);
  });
});

const actions = {};

Object.keys(_actions).forEach(action => {
  actions[action] = (...args) => {
    log('sending rpc', action, ...args);
    return ipc.request('fromMain', action, ...args);
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
