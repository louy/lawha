import {exec} from 'child_process';

import flux from 'flux-react';

import actions from '../actions';
import actionsRemote from '../actions-remote';
import actionsRpc from '../actions-rpc';

const CommandsStore = flux.createStore({
  actions: [
    actionsRpc.runExec,
  ],

  runExec(resolve, reject, command) {
    try {
      exec(command);

      resolve();
    } catch(e) {
      reject(e);
    }
  },
});

export default CommandsStore;
