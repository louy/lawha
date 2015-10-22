import _actions from '../shared/actions';

import debug from 'debug';
const log = debug('app:actions');

const actions = {};

Object.keys(_actions).forEach(action => {
  actions[action] = (...args) => {
    log('calling', action, ...args);
    return _actions[action](...args);
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
