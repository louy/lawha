import flux from 'flux-react';

// p: private
const actions = flux.createActions([
  'loadServices',
  'getServices', // p

  'startService',
  'stopService',
  '_startService', // p
  '_stopService', // p

  'loadService',
  'getService', // p
]);

export default actions;
