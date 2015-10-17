// Actions
import ipc from 'electron-safe-ipc/host';
import _actions from '../shared/actions';

ipc.respond('fromRenderer', function fromRenderer(action, ...args) {
  console.log('fromRenderer', action, ...args);
  if (!_actions[action]) {
    const err = new Error('Unrecognised action: ' + action);
    console.warn(err);
    return err;
  }
  return new Promise((resolve, reject) => {
    console.log('calling '+action+' with arguments', resolve, reject, ...args);
    _actions[action](resolve, reject, ...args);
  });
});

const actions = {};

Object.keys(_actions).forEach(action => {
  actions[action] = (...args) => {
    _actions[action](action, ...args);
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
