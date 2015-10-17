import flux from 'flux-react';

import actions from '../actions';
import actionsRpc from '../actions-rpc';

import LoadableStore from '../../Mixins/LoadableStore';

const ServicesStore = flux.createStore({
  mixins: [LoadableStore],

  data: [],
  servicesMap: {},

  actions: [
    actions.getServices,
    actions.loadServices,
  ],

  getServices() {},

  loadServices() {
    this.triggerLoad();
  },

  getRequest() {
    return actionsRpc.getServices();
  },

  done(services) {
    const servicesMap = {};
    services.forEach((service, index) => {
      servicesMap[service.path] = index;
    });
    this.servicesMap = servicesMap;
  },
});

export default ServicesStore;
