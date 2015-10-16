import flux from 'flux-react';

const actions = flux.createActions([
  'setServices',
  'loadServices',

  'loadServiceDetails',
  'setServiceDetails',
]);

export default actions;
