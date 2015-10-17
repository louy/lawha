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
  ],

  map: {},

  getRequest(id) {
    if (id === '_') {
      return actionsRpc.getServices();
    } else if (id == null) {
      return Promise.resolve();
    }

    return actionsRpc.getService(id);
  },

  done(id, data) {
    if (id === '_') {
      const map = {};
      data.forEach((service, index) => {
        map[service.name] = index;
      });
      this.map = map;
    } else if (id != null) {
      const {map} = this;
      const index = map[data.name];
      const _ = this.data('_') || [];
      if (!index) {
        map[data.name] = _.length;
        _.push(data);
      } else {
        _[index] = data;
      }
      this.data('_', _);
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
});

export default ServiceStore;
