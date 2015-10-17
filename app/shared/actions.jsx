import flux from 'flux-react';

const actions = flux.createActions([
  'loadServices',
  'getServices',

  'loadServiceDetails',
  'setServiceDetails',

  'startService',
  'stopService',

  'loadService',
  'getService',
]);

export default actions;
