import flux from 'flux-react';

import actions from '../actions';

import MultiLoadableStore from '../../Mixins/MultiLoadableStore';

const ServicesStore = flux.createStore({
  mixins: [MultiLoadableStore],

  actions: [
    actions.test,
  ],

  test() {
    console.log('Got test!', arguments);
  },
});

export default ServicesStore;
