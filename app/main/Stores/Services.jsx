import flux from 'flux-react';

import actions from '../actions';
import actionsRpc from '../actions-rpc';

const ServicesStore = flux.createStore({
  actions: [
    actions.loadServices,
    actionsRpc.getServices,
  ],

  loadServices() {},
  getServices(resolve, reject) {
    resolve([{
      path: 'test-1',
      name: 'Test 1',
      description: 'Some sample service',
      status: 'OK',
      hasNew: false,
    }, {
      path: 'test-2',
      name: 'Test 2',
      description: 'Some sample service',
      status: 'OK',
      hasNew: false,
    }, {
      path: 'test-3',
      name: 'Test 3',
      description: 'Some sample service',
      status: 'ERR',
      hasNew: false,
    }]);
  },
});

export default ServicesStore;
