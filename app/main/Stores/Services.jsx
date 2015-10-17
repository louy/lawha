// http://nodejs.org/api.html#_child_processes
import sys from 'sys';
import {spawn} from 'child_process';

import flux from 'flux-react';

import actions from '../actions';
import actionsRpc from '../actions-rpc';

const services = [{
  cwd: '/Users/louy/Projects/um/api',
  command: 'nodemon',
  args: ['.'],
  name: 'API',
  description: 'Some sample service',
  status: null,
  hasNew: false,
  commands: {
    'Restart': 'rs',
  },
  output: [],
}, {
  cwd: '/Users/louy/Projects/um/manage',
  command: 'nodemon',
  args: ['.'],
  name: 'Manage',
  description: 'Some sample service',
  status: null,
  hasNew: false,
  output: [],
}, {
  cwd: '/Users/louy/Projects/um/rabbit-transforms',
  command: 'nodemon',
  args: ['.'],
  name: 'Rabbit Transforms',
  description: 'Some sample service',
  status: null,
  hasNew: false,
  output: [],
}];

let servicesMap = {};

function generateMap() {
  servicesMap = {};
  services.forEach((service, index) => {
    servicesMap[service.name] = index;
  });
}

generateMap();

const children = [];

const ServicesStore = flux.createStore({
  actions: [
    actions.loadServices,
    actionsRpc.getServices,

    actions.startService,
    actions.stopService,
    actionsRpc._startService,
    actionsRpc._stopService,

    actions.loadService,
    actionsRpc.getService,
  ],

  loadServices() {},

  getServices(resolve, reject) {
    resolve(services);
  },

  startService() {},
  _startService(resolve, reject, serviceName) {
    const index = servicesMap[serviceName];
    if (index == null) {
      const err = new Error('Service ' + serviceName + ' doesn\'t exist');
      console.warn(err);
      return reject(err);
    }

    if (children[index]) {
      const err = new Error('Service ' + serviceName + ' is already running');
      console.warn(err);
      throw reject(err);
    }

    const service = services[index];

    console.log('starting', service, process.env);

    try {
      let child = spawn(service.command, service.args || [], {
        cwd: service.cwd,
        env: process.env,
      });
      children[index] = child;
      service.status = true;

      child.stdout.setEncoding('utf8');
      child.stdout.on('data', function onStdout(data) {
        console.log('stdout: ' + data);
        service.output.push({
          type: 'stdout',
          ts: new Date() / 1000,
          data,
        });
        actions.loadService(serviceName); // Trigger a reload
      });

      child.stderr.setEncoding('utf8');
      child.stderr.on('data', function onStderr(data) {
        console.log('stderr: ' + data);
        service.output.push({
          type: 'stderr',
          ts: new Date() / 1000,
          data,
        });
        actions.loadService(serviceName); // Trigger a reload
      });

      child.on('close', function onClose(code) {
        console.log('child process exited with code ' + code);
        service.status = code;
        children[index] = null;
        child = null;
      });

      resolve();
    } catch(e) {
      if (child) {
        console.error('Child is still running!');
      }

      console.error(require('util').inspect(e));
      reject(e);
    }
  },

  stopService() {},
  _stopService(resolve, reject, serviceName, signal = 'SIGTERM') {
    const index = servicesMap[serviceName];
    if (index == null) {
      return reject({ message: 'Service ' + serviceName + ' doesn\'t exist' });
    }

    if (!children[index]) {
      throw reject({ message: 'Service ' + serviceName + ' is not running' });
    }

    const child = children[index];
    // const service = services[index];

    console.log('Stopping ' + serviceName + ' with signal ', signal);

    child.kill(signal);
    resolve();
  },

  loadService() {},
  getService(resolve, reject, serviceName) {
    const index = servicesMap[serviceName];
    if (index === undefined) {
      return reject({ message: 'Service ' + serviceName + ' doesn\'t exist' });
    }

    const service = services[index];

    resolve(service);
  },
});

export default ServicesStore;
