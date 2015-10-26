import {exec} from 'child_process';

import flux from 'flux-react';

import actionsRpc from '../actions-rpc';

const CommandsStore = flux.createStore({
  actions: [
    actionsRpc.runExec,
  ],

  runExec(resolve, reject, command) {
    try {
      exec(command);

      resolve();
    } catch (err) {
      reject(err);
    }
  },
});

export default CommandsStore;
