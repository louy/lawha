import Promise from 'bluebird';

import debug from 'debug';
const log = debug('app:mixins:loadable-store');

/*
  To use this store, listen to some action and call `#triggerLoad()` when ready.
  It won't fire if a request already exists so use `#cancel()` if you want to cancel it.

  You can also call `#reset()` to remove error state and message. If a request is running however,
    it won't do anything. Use `#cancel()` and then `#reset()` to make sure it's reset.
 */
export default {
  /*
    You should override this method. It should return a Promise.
  */

  // getRequest() {},

  /*
    You can override these methods.
  */

  // done(data) {},
  // fail(err) {},
  // always() {},

  /*
    The rest is private.
   */

  isLoading: false,
  isError: false,
  errorMessage: null,
  // data: null,

  triggerLoad(...args) {
    if (this.isLoading) return false;

    if (!this.getRequest) throw new Error('`getRequest` is not implemented.');

    this.isLoading = true;
    this.isError = false;
    this.errorMessage = null;
    this.emit('meta');

    this.request = Promise.resolve(this.getRequest(...args)).bind(this).then(function success(data) {
      log('success', data);

      this.data = data;
      if (this.done) this.done.apply(this, arguments);
      this.emit('data');
    }, function fail(err) {
      log('fail', err);

      this.isError = true;

      if (err && err.message) {
        this.errorMessage = err.message;
      } else {
        this.errorMessage = 'Unknown error';
      }

      if (this.fail) this.fail.apply(this, arguments);
    }).then(function always() {
      this.isLoading = false;
      if (this.always) this.always.apply(this, arguments);
      this.emit('meta');
    });

    return true;
  },

  cancel() {
    if (this.request) {
      this.request.cancel();
    }
  },

  reset() {
    if (this.isLoading) {
      return;
    }

    this.isError = false;
    this.errorMessage = null;
    this.emitChange();
  },

  exports: {
    getData() {
      return this.data;
    },

    isLoading() {
      return this.isLoading;
    },

    isError() {
      return this.isError;
    },

    errorMessage() {
      return this.errorMessage;
    },
  },
};
