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

    actions.sendCommand,
    actions._sendCommand,

    actions.setServiceReadLines,
  ],

  map: {},
  lines: {},

  getRequest(id, ...args) {
    if (id === '_') {
      return actionsRpc.getServices(...args);
    } else if (id == null) {
      return Promise.resolve();
    } else if (id.substr(0, 2) === '_.') {
      const parts = id.split('.');
      if (parts[1] === 'start') {
        const name = parts.slice(2).join('.');
        console.log('Starting ', name);
        return actionsRpc._startService(name, ...args);
      } else if (parts[1] === 'stop') {
        const name = parts.slice(2).join('.');
        console.log('Stopping ', name);
        return actionsRpc._stopService(name, ...args);
      } else if (parts[1] === 'command') {
        const name = parts.slice(2).join('.');
        return actionsRpc._sendCommand(name, ...args);
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
        map[service.id] = index;
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
      const index = map[data.id];
      const _ = this.data('_') || [];
      if (index == null) {
        console.log('New service!');
        map[data.id] = _.length;
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

  sendCommand(service, command) {
    this.triggerLoad('_.command.'+service, command);
  },
  _sendCommand() {},

  setServiceReadLines(id, lines) {
    this.lines[id] = lines;
  },

  exports: {
    getServiceReadLines(id) {
      return this.lines[id];
    },
  },
});

export default ServiceStore;
