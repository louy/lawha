// http://nodejs.org/api.html#_child_processes
import {spawn} from 'child_process';

import flux from 'flux-react';

import actions from '../actions';
import actionsRemote from '../actions-remote';
import actionsRpc from '../actions-rpc';

let services = [];

let servicesMap = {};

function generateMap() {
  servicesMap = {};
  services.forEach((service, index) => {
    servicesMap[service.id] = index;
  });
}

generateMap();

const children = [];

let isSet = false;
export function setServices(_services) {
  const autoStart = [];

  if (isSet) throw new Error('You can only set services once');
  isSet = true;
  services = Object.keys(_services).map((key) => {
    const service = _services[key];

    if (service.autoStart) {
      autoStart.push(key);
    }

    service.id = key;
    service.output = [];
    service.status = null;
    service.numberOfLines = 0;
    return service;
  });

  generateMap();

  autoStart.forEach((key) => new Promise(function autostartService(resolve, reject) { actions._startService(resolve, reject, key); }));
}

// Be sure to kill all child processes
process.on('exit', function() {
  children.forEach((child) => {
    if (child) {
      child.kill('SIGKILL');
    }
  });
});

let shouldExit = false;
[
  'SIGTERM',
  'SIGINT',
  // 'SIGKILL', // Uncatchable :(
].forEach((signal) => {
  process.on(signal, function () {
    console.log(signal);
    children.forEach((child) => {
      if (child) {
        child.kill(signal);
      }
    });

    if (!children.filter(i => !!i).length) {
      console.log('No one is running');
      process.exit(0);
    }

    shouldExit = true;
    console.log('not exiting');
  });
});

const ServicesStore = flux.createStore({
  actions: [
    actionsRpc.getServices,

    actionsRpc._startService,
    actionsRpc._stopService,

    actionsRpc.getService,

    actionsRpc._sendCommand,
  ],

  getServices(resolve) {
    resolve(services);
  },

  _startService(resolve, reject, serviceId) {
    const index = servicesMap[serviceId];
    if (index == null) {
      const err = new Error('Service ' + serviceId + ' doesn\'t exist');
      console.warn(err);
      return reject(err);
    }

    if (children[index]) {
      const err = new Error('Service ' + serviceId + ' is already running');
      console.warn(err);
      throw reject(err);
    }

    const service = services[index];

    service.output.push({
      type: 'command',
      ts: +new Date(),
      data: service.command + ' ' + (service.args || []).join(' '),
    });
    ++ service.numberOfLines;

    try {
      let child = spawn(service.command, service.args || [], {
        cwd: service.cwd,
        env: process.env,
      }).on('error', (err) => {
        service.output.push({
          type: 'system',
          ts: +new Date(),
          data: 'child process error ' + JSON.stringify(err) + '\n',
        });
        ++ service.numberOfLines;
      });
      children[index] = child;
      service.status = true;
      service.lastChanged = +new Date();

      child.stdout.setEncoding('utf8');
      child.stdout.on('data', function onStdout(data) {
        const lines = data.split('\n').length - 1;
        service.numberOfLines += lines;

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

        actionsRemote.loadService(serviceId); // Trigger a reload
      });

      child.stderr.setEncoding('utf8');
      child.stderr.on('data', function onStderr(data) {
        const lines = data.split('\n').length - 1;
        service.numberOfLines += lines;

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

        service.lastChanged = +new Date();
        actionsRemote.loadService(serviceId); // Trigger a reload
      });

      child.stdin.setEncoding('utf-8');

      child.on('close', function onClose(code) {
        service.output.push({
          type: 'system',
          ts: +new Date(),
          data: 'child process exited with code ' + JSON.stringify(code) + '\n',
        });
        service.status = code;
        service.lastChanged = +new Date();
        children[index] = null;
        child = null;
        ++ service.numberOfLines;

        actionsRemote.loadService(serviceId); // Trigger a reload

        if (shouldExit && !children.filter(i => !!i).length) {
          console.log('last child has exited');
          process.exit(code || 0);
        }
      });

      resolve();
    } catch (e) {
      if (child) {
        console.error('Child ' + serviceId + ' is still running!');
      }

      console.error(require('util').inspect(e));
      reject(e);
    }
  },

  _stopService(resolve, reject, serviceId, signal = 'SIGTERM') {
    const index = servicesMap[serviceId];
    if (index == null) {
      return reject({ message: 'Service ' + serviceId + ' doesn\'t exist' });
    }

    if (!children[index]) {
      throw reject({ message: 'Service ' + serviceId + ' is not running' });
    }

    const child = children[index];
    const service = services[index];
    service.output.push({
      type: 'signal',
      ts: +new Date(),
      data: signal,
    });
    ++ service.numberOfLines;

    child.kill(signal);
    resolve();
  },

  getService(resolve, reject, serviceId) {
    const index = servicesMap[serviceId];
    if (index === undefined) {
      return reject({ message: 'Service ' + serviceId + ' doesn\'t exist' });
    }

    const service = services[index];

    resolve(service);
  },

  _sendCommand(resolve, reject, serviceId, command) {
    const index = servicesMap[serviceId];
    if (index == null) {
      return reject({ message: 'Service ' + serviceId + ' doesn\'t exist' });
    }

    if (!children[index]) {
      throw reject({ message: 'Service ' + serviceId + ' is not running' });
    }

    const child = children[index];
    const service = services[index];

    child.stdin.write(command);
    service.output.push({
      type: 'stdin',
      ts: +new Date(),
      data: command + '\n',
    });
    ++ service.numberOfLines;

    resolve();
  },
});

export default ServicesStore;
