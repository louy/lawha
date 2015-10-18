// Actions
import ipc from 'electron-safe-ipc/host';
import _actions from '../shared/actions';

ipc.on('fromRenderer', function fromRenderer(action, ...args) {
  console.log('fromRenderer', action, ...args);
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
