import flux from 'flux-react';

import actions from '../actions';
import actionsRemote from '../actions-remote';
import actionsRpc from '../actions-rpc';

import MultiLoadableStore from '../../Mixins/MultiLoadableStore';

import debug from 'debug';
const log = debug('app:stores:service');

const ServiceStore = flux.createStore({
  mixins: [MultiLoadableStore],

  actions: [
    actionsRemote.loadServices,

    actionsRemote.loadService,

    actions.startService,
    actions.stopService,

    actions.sendCommand,

    actions.setServiceReadLines,

    actions.sendExec,
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
        log('Starting ', name);
        return actionsRpc._startService(name, ...args);
      } else if (parts[1] === 'stop') {
        const name = parts.slice(2).join('.');
        log('Stopping ', name);
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
    log('done', id, data);
    if (id === '_') {
      const map = {};
      data.forEach((service, index) => {
        map[service.id] = index;
      });
      this.map = map;
    } else if (id != null) {
      if (id.substr(0,2) === '_.') {
        const name = id.split('.').slice(2).join('.');
        log('Reloading ', name);
        actions.loadService(name);
        return;
      }

      const {map} = this;
      const index = map[data.id];
      const _ = this.data('_') || [];
      if (index == null) {
        log('New service!');
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
    log('failed', id, ...args);
    if (id && id.substr(0,2) === '_.') {
      const name = id.split('.').slice(2).join('.');
      log('Reloading ', name);
      actions.loadService(name);
      return;
    }
  },

  loadServices() {
    this.triggerLoad('_');
  },

  loadService(id) {
    this.triggerLoad(id);
  },

  startService(id) { this.triggerLoad('_.start.' + id); },
  stopService(id, signal) { this.triggerLoad('_.stop.' + id, signal); },

  sendCommand(service, command) {
    this.triggerLoad('_.command.'+service, command);
  },

  setServiceReadLines(id, lines) {
    if (this.lines[id] === lines) return;
    this.lines[id] = lines;
    this.emit('_.lines');
  },

  sendExec(id, command) {
    actionsRpc.runExec(command);
  },

  exports: {
    getServiceReadLines(id) {
      return this.lines[id] || 0;
    },
  },
});

export default ServiceStore;
