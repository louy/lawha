import flux from 'flux-react';

import actions from '../actions';
import actionsRpc from '../actions-rpc';

import MultiLoadableStore from '../../Mixins/MultiLoadableStore';

const ServiceStore = flux.createStore({
  mixins: [MultiLoadableStore],

  actions: [
    actions.getServices,
    actions.loadServices,

    actions.loadService,
    actions.getService,

    actions.startService,
    actions.stopService,
    actions._startService,
    actions._stopService,
  ],

  map: {},

  getRequest(id, ...args) {
    if (id === '_') {
      return actionsRpc.getServices(...args);
    } else if (id == null) {
      return Promise.resolve();
    } else if (id.substr(0, 2) === '_.') {
      if (id.substr(2, 5) === 'start') {
        const name = id.substr(8);
        console.log('Starting ', name);
        return actionsRpc._startService(name, ...args);
      } else if (id.substr(2, 4) === 'stop') {
        const name = id.substr(7);
        console.log('Stopping ', name);
        return actionsRpc._stopService(name, ...args);
      }

      const err = new Error('Unrecognised action ' + id);
      console.error(err);
      return Promise.reject(err);
    }

    return actionsRpc.getService(id, ...args);
  },

  done(id, data) {
    console.log('done', id, data);
    if (id === '_') {
      const map = {};
      data.forEach((service, index) => {
        map[service.name] = index;
      });
      this.map = map;
    } else if (id != null) {
      if (id.substr(0,2) === '_.') {
        const name = id.split('.').slice(2).join('.');
        console.log('Reloading ', name);
        actions.loadService(name);
        return;
      }

      const {map} = this;
      const index = map[data.name];
      const _ = this.data('_') || [];
      if (index == null) {
        console.log('New service!');
        map[data.name] = _.length;
        _.push(data);
      } else {
        _[index] = data;
      }

      this.data('_', _);
      this.emit('_.data');
    }
  },

  fail(id, ...args) {
    console.log('failed', id, ...args);
    if (id && id.substr(0,2) === '_.') {
      const name = id.split('.').slice(2).join('.');
      console.log('Reloading ', name);
      actions.loadService(name);
      return;
    }
  },

  getServices() {},

  loadServices() {
    this.triggerLoad('_');
  },

  getService() {},

  loadService(id) {
    this.triggerLoad(id);
  },

  startService(id) { this.triggerLoad('_.start.' + id); },
  stopService(id, signal) { this.triggerLoad('_.stop.' + id, signal); },
  _startService() {},
  _stopService() {},
});

export default ServiceStore;
