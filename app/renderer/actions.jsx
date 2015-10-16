// Actions
import ipc from 'electron-safe-ipc/guest';
import _actions from '../shared/actions';

ipc.on('fromMain', function fromMain(action, ...args) {
  console.log('fromMain', action);
  if (!_actions[action]) {
    console.warn(new Error('Unrecognised action'), action);
  } else {
    _actions[action](...args);
  }
});

const actions = {};

Object.keys(_actions).forEach(action => {
  actions[action] = (...args) => {
    console.log('sending', action, ...args);
    ipc.send('fromRenderer', action, ...args);
    _actions[action](action, ...args);
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
