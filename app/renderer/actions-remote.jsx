import ipc from 'electron-safe-ipc/guest';
import _actions from '../shared/actions';

import debug from 'debug';
const log = debug('app:actions-remote');

const actions = {};

Object.keys(_actions).forEach(action => {
  ipc.on('guest.' + action, function gotAction(...args) {
    log(action, ...args);
    _actions[action](...args);
  });

  actions[action] = (...args) => {
    log('sending', action, ...args);
    return ipc.send('host.' + action, ...args);
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
