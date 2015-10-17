import flux from 'flux-react';

const actions = flux.createActions([
  'loadServices',
  'getServices',

  'loadServiceDetails',
  'setServiceDetails',
]);

export default actions;
