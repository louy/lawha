// http://nodejs.org/api.html#_child_processes
import {spawn} from 'child_process';
import util from 'util';

import flux from 'flux-react';

import actions from '../actions';
import actionsRemote from '../actions-remote';
import actionsRpc from '../actions-rpc';

import {bounce, cancelBounce} from '../dock';

import debug from 'debug';
const log = debug('app:stores:services');

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

function addOutputToService(service, output) {
  let newLines = output.data.split('\n').length;

  const {length} = service.output;
  if (service.output.length && output.type === service.output[length - 1].type) {
    service.output[length - 1].data += output.data;
    service.output[length - 1].ts = output.ts;
    -- newLines;
  } else {
    if (length > 100) {
      const newOutput = (new Array(length - 100)).concat(service.output.slice(length - 100));
      service.output = newOutput.concat([output]);
    } else {
      service.output.push(output);
    }
  }

  service.numberOfLines += newLines;

  actionsRemote.loadService(service.id); // Trigger a reload
}

function stopService(index, signal = 'SIGTERM') {
  const child = children[index];
  const service = services[index];
  addOutputToService(service, {
    type: 'signal',
    ts: +new Date(),
    data: signal,
  });

  // use a negative value to kill process group
  child.kill(-signal);
}

// Be sure to kill all child processes
process.on('exit', function() {
  children.forEach((child, index) => {
    if (child) {
      stopService(index, 'SIGKILL');
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
    children.forEach((child, index) => {
      if (child) {
        stopService(index, 'SIGKILL');
      }
    });

    if (children.some(child => !!child)) {
      shouldExit = true;
      log('not exiting');
    } else {
      log('No one is running');
      process.exit(0);
    }
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
      console.log('arguments', arguments);
      const err = new Error('Service ' + serviceId + ' doesn\'t exist');
      console.warn(err);
      return reject(err);
    }

    const service = services[index];

    if (children[index]) {
      if (service.status === null) {
        log('hmmm');
        stopService(index);
      }
    }

    if (children[index]) {
      const err = new Error('Service ' + serviceId + ' is already running');
      console.warn(err);
      return reject(err);
    }

    addOutputToService(service, {
      type: 'command',
      ts: +new Date(),
      data: service.command + ' ' + (service.args || []).join(' '),
    });

    if (service.bounceId) {
      cancelBounce(service.bounceId);
    }

    let child;
    try {
      child = spawn(service.command, service.args || [], {
        cwd: service.cwd,
        env: process.env,
      }).on('error', (err) => {
        addOutputToService(service, {
          type: 'system',
          ts: +new Date(),
          data: 'child process ' + (child ? child.pid : '') + ' error ' + JSON.stringify(err) + '\n',
        });
      });
      children[index] = child;
      service.status = true;
      service.lastChanged = +new Date();

      child.stdout.setEncoding('utf8');
      child.stdout.on('data', function onStdout(data) {
        addOutputToService(service, {
          type: 'stdout',
          ts: +new Date(),
          data,
        });
      });

      child.stderr.setEncoding('utf8');
      child.stderr.on('data', function onStderr(data) {
        service.lastChanged = +new Date();

        addOutputToService(service, {
          type: 'stderr',
          ts: +new Date(),
          data,
        });
      });

      child.stdin.setEncoding('utf-8');

      child.on('exit', function onExit(code) {
        log(service.id + ' has exited', code);
      });

      child.on('close', function onClosed(code) {
        log(service.id + ' has been closed', code);

        service.status = code;
        service.lastChanged = +new Date();

        addOutputToService(service, {
          type: 'system',
          ts: +new Date(),
          data: 'child process closed with code ' + JSON.stringify(code) + '\n',
        });

        children[index] = null;
        child = null;

        if (shouldExit && !children.filter(i => !!i).length) {
          log('last child has exited');
          process.exit(code || 0);
        }

        service.bounceId = bounce(code > 0);
      });

      resolve();
    } catch (err) {
      if (child) {
        console.error('Child ' + serviceId + ' (pid: %s) is still running!', child.pid);
      }

      console.error(util.inspect(err));
      reject(err);
    }
  },

  _stopService(resolve, reject, serviceId, signal = 'SIGTERM') {
    const index = servicesMap[serviceId];
    if (index == null) {
      return reject({ message: 'Service ' + serviceId + ' doesn\'t exist' });
    }

    if (!children[index]) {
      return reject({ message: 'Service ' + serviceId + ' is not running' });
    }

    stopService(index, signal);
    resolve();
  },

  getService(resolve, reject, serviceId) {
    const index = servicesMap[serviceId];
    if (index === undefined) {
      return reject({ message: 'Service ' + serviceId + ' doesn\'t exist' });
    }

    const service = services[index];
    log('getService', 'resolved with', service);
    resolve(service);
  },

  _sendCommand(resolve, reject, serviceId, command) {
    const index = servicesMap[serviceId];
    if (index == null) {
      return reject({ message: 'Service ' + serviceId + ' doesn\'t exist' });
    }

    if (!children[index]) {
      return reject({ message: 'Service ' + serviceId + ' is not running' });
    }

    const child = children[index];
    const service = services[index];

    child.stdin.write(command);
    addOutputToService(service, {
      type: 'stdin',
      ts: +new Date(),
      data: command + '\n',
    });

    resolve();
  },
});

export default ServicesStore;

export function beforeQuit() {
  log('before quit');
  children.forEach((child, index) => {
    if (child) {
      stopService(index, 'SIGTERM');
    }
  });
}

export function willQuit(event) {
  log('will quit');
  children.forEach((child, index) => {
    if (child) {
      stopService(index, 'SIGKILL');
    }
  });

  if (children.some(child => !!child)) {
    event.preventDefault();
  } else {
    log('No one is running');
  }
}
