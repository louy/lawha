import flux from 'flux-react';

import actions from '../actions';

import MultiLoadableStore from '../../Mixins/MultiLoadableStore';

const ServicesStore = flux.createStore({
  mixins: [MultiLoadableStore],
  services: [],
  servicesMap: {},

  actions: [
    actions.setServices,
  ],

  setServices(services) {
    this.services = services;

    const servicesMap = {};
    services.forEach((service, index) => {
      servicesMap[service.id] = index;
    });
    this.servicesMap = servicesMap;

    this.emit('services');
  },

  exports: {
    getServices() {
      return this.services;
    },
  },
});

export default ServicesStore;
