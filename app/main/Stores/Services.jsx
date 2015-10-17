// http://nodejs.org/api.html#_child_processes
import {spawn} from 'child_process';

import flux from 'flux-react';

import actions from '../actions';
import actionsRpc from '../actions-rpc';

let services = [];

let servicesMap = {};

function generateMap() {
  servicesMap = {};
  services.forEach((service, index) => {
    servicesMap[service.name] = index;
  });
}

generateMap();

const children = [];

let isSet = false;
export function setServices(_services) {
  if (isSet) throw new Error('You can only set services once');
  isSet = true;
  services = Object.keys(_services).map((key) => {
    const service = _services[key];
    service.id = key;
    service.output = [];
    service.status = null;
    service.hasNew = false;
    return service;
  });

  generateMap();
}

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

    actions.sendCommand,
    actionsRpc._sendCommand,
  ],

  loadServices() {},

  getServices(resolve) {
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

    service.output.push({
      type: 'command',
      ts: +new Date(),
      data: service.command + ' ' + (service.args || []).join(' '),
    });

    try {
      let child = spawn(service.command, service.args || [], {
        cwd: service.cwd,
        env: process.env,
      });
      children[index] = child;
      service.status = true;

      child.stdout.setEncoding('utf8');
      child.stdout.on('data', function onStdout(data) {
        const lastChunk = service.output[service.output.length - 1];
        if (lastChunk && lastChunk.type === 'stdout') {
          lastChunk.data += data;
          lastChunk.ts = +new Date();
        } else {
          service.output.push({
            type: 'stdout',
            ts: +new Date(),
            data,
          });
        }

        actions.loadService(serviceName); // Trigger a reload
      });

      child.stderr.setEncoding('utf8');
      child.stderr.on('data', function onStderr(data) {
        const lastChunk = service.output[service.output.length - 1];
        if (lastChunk && lastChunk.type === 'stderr') {
          lastChunk.data += data;
          lastChunk.ts = +new Date();
        } else {
          service.output.push({
            type: 'stderr',
            ts: +new Date(),
            data,
          });
        }

        actions.loadService(serviceName); // Trigger a reload
      });

      child.stdin.setEncoding('utf-8');

      child.on('close', function onClose(code) {
        service.output.push({
          type: 'system',
          ts: +new Date(),
          data: 'child process exited with code ' + JSON.stringify(code),
        });
        service.status = code;
        children[index] = null;
        child = null;
      });

      resolve();
    } catch (e) {
      if (child) {
        console.error('Child ' + serviceName + ' is still running!');
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
    const service = services[index];
    service.output.push({
      type: 'signal',
      ts: +new Date(),
      data: signal,
    });

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

  sendCommand() {},

  _sendCommand(resolve, reject, serviceName, command) {
    const index = servicesMap[serviceName];
    if (index == null) {
      return reject({ message: 'Service ' + serviceName + ' doesn\'t exist' });
    }

    if (!children[index]) {
      throw reject({ message: 'Service ' + serviceName + ' is not running' });
    }

    const child = children[index];
    const service = services[index];

    child.stdin.write(command);
    service.output.push({
      type: 'stdin',
      ts: +new Date(),
      data: command,
    });

    resolve();
  },
});

export default ServicesStore;
