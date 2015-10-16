import flux from 'flux-react';

import actions from '../actions';

const ServicesStore = flux.createStore({
  services: [],
  servicesMap: {},

  actions: [
    actions.loadServices,
    actions.setServices,
  ],

  loadServices() {},

  setServices(services) {
    this.services = services;

    const servicesMap = {};
    services.forEach((service, index) => {
      servicesMap[service.path] = index;
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
