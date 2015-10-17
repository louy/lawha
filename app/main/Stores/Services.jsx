// http://nodejs.org/api.html#_child_processes
import sys from 'sys';
import {spawn} from 'child_process';

import flux from 'flux-react';

import actions from '../actions';
import actionsRpc from '../actions-rpc';

const services = [{
  cwd: '/Users/louy/Projects/um/api',
  command: 'nodemon .',
  name: 'API',
  description: 'Some sample service',
  status: null,
  hasNew: false,
}, {
  cwd: '/Users/louy/Projects/um/manage',
  command: 'nodemon .',
  name: 'Manage',
  description: 'Some sample service',
  status: null,
  hasNew: false,
}, {
  cwd: '/Users/louy/Projects/um/rabbit-transforms',
  command: 'nodemon .',
  name: 'Rabbit Transforms',
  description: 'Some sample service',
  status: null,
  hasNew: false,
},];

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

    actionsRpc.startService,
    actionsRpc.stopService,

    actions.loadService,
    actionsRpc.getService,
  ],

  loadServices() {},

  getServices(resolve, reject) {
    resolve(services);
  },

  startService(resolve, reject, serviceName) {
    const index = servicesMap[serviceName];
    if (!index) {
      return reject(new Error('Service ' + serviceName + ' doesn\'t exist'));
    }

    if (children[index]) {
      throw reject(new Error('Service ' + serviceName + ' is already running'));
    }

    const service = services[index];

    let child = spawn(service.command, service.args, {
      cwd: service.cwd,
      env: process.env,
    });
    children[index] = child;
    service.status = true;

    child.stdout.on('data', function onStdout(data) {
      console.log('stdout: ' + data);
    });

    child.stderr.on('data', function onStderr(data) {
      console.log('stderr: ' + data);
    });

    child.on('close', function onClose(code) {
      console.log('child process exited with code ' + code);
      service.status = code;
      children[index] = null;
      child = null;
    });
  },

  stopService(resolve, reject, serviceName, signal = 1) {
    const index = servicesMap[serviceName];
    if (!index) {
      return reject(new Error('Service ' + serviceName + ' doesn\'t exist'));
    }

    if (!children[index]) {
      throw reject(new Error('Service ' + serviceName + ' is not running'));
    }

    const child = children[index];
    // const service = services[index];

    child.kill(signal);
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
