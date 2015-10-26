import ipc from 'electron-safe-ipc/guest';
import _actions from '../shared/actions';

import debug from 'debug';
const log = debug('app:actions-rpc');

const actions = {};

Object.keys(_actions).forEach(action => {
  ipc.respond('guest.' + action, function gotRequest(...args) {
    log('exec rpc', action, ...args);
    return new Promise((resolve, reject) => {
      _actions[action]((...all) => {
        log('resolving %s %j with %j', action, args, ...all);
        resolve(...all);
      }, reject, ...args);
    });
  });

  actions[action] = (...args) => {
    log('sending rpc', action, ...args);
    return ipc.request('host.' + action, ...args);
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
