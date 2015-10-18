// Actions
import ipc from 'electron-safe-ipc/guest';
import _actions from '../shared/actions';

ipc.respond('fromMain', function fromMain(action, ...args) {
  console.log('fromMain', action, ...args);
  if (!_actions[action]) {
    const err = new Error('Unrecognised action: ' + action);
    console.warn(err);
    return err;
  }
  return new Promise((resolve, reject) => {
    _actions[action](resolve, reject, ...args);
  });
});

const actions = {};

Object.keys(_actions).forEach(action => {
  actions[action] = (...args) => {
    return ipc.request('fromRenderer', action, ...args);
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
