import Promise from 'bluebird';

import debug from 'debug';
const log = debug('app:mixins:multi-loadable-store');

/*
  To use this store, listen to some action and call `#triggerLoad(id)` when ready.
  It won't fire if a request already exists so use `#cancel(id)` if you want to cancel it.

  You can also call `#reset(id)` to remove error state and message. If a request is running however,
    it won't do anything. Use `#cancel(id)` and then `#reset(id)` to make sure it's reset.

  All functions require (and receive) and `id` argument as the first argument.
 */
export default {
  /*
    You should override this method. It should return a Promise.
  */

  // getRequest(id) {},

  /*
    You can override these methods.
  */

  // done(id, data) {},
  // fail(id, err) {},
  // always(id) {},

  /*
    The rest is private.
   */

  // Helper functions
  isLoading(id, value) {
    this._isLoading = this._isLoading || {};

    if (value !== undefined) {
      this._isLoading[id] = value;
    }

    return !!this._isLoading[id];
  },

  isError(id, value) {
    this._isError = this._isError || {};

    if (value !== undefined) {
      this._isError[id] = value;
    }

    return !!this._isError[id];
  },

  errorMessage(id, value) {
    this._errorMessage = this._errorMessage || {};

    if (value !== undefined) {
      this._errorMessage[id] = value;
    }

    return this._errorMessage[id] || null;
  },

  data(id, value) {
    this._data = this._data || {};

    if (value !== undefined) {
      this._data[id] = value;
    }

    return this._data[id] || null;
  },

  cancel(id) {
    this.requests = this.requests || {};

    if (this.requests[id]) {
      this.requests[id].cancel();
    }
  },

  reset(id) {
    if (this.isLoading(id)) {
      return;
    }

    this.isError(id, false);
    this.errorMessage(id, null);
    this.emit(id + '.meta');
  },

  triggerLoad(id, ...args) {
    this.requests = this.requests || {};

    if (this.isLoading(id)) return false;

    if (!this.getRequest) throw new Error('`getRequest` is not implemented.');

    // Reset variables
    this.isLoading(id, true);
    this.isError(id, false);
    this.errorMessage(id, null);
    this.emit(id + '.meta');

    this.requests[id] = Promise.resolve(this.getRequest(id, ...args)).bind(this).then(function done(data) {
      log('done', id, 'with response', data);

      this.data(id, data);
      if (this.done) this.done(id, data);
      this.emit(id + '.data');
    }, function fail(err) {
      log('fail', id, 'with response', err);
      this.isError(id, true);

      if (err && err.message) {
        this.errorMessage(id, err.message);
      } else {
        this.errorMessage(id, 'Unknown error');
      }

      if (this.fail) this.fail(id, err);
    }).then(function always() {
      this.isLoading(id, false);
      if (this.always) this.always(id);
      this.emit(id + '.meta');
    });

    return true;
  },

  exports: {
    getData(id) {
      return this.data(id);
    },

    isLoading(id) {
      return this.isLoading(id);
    },

    isError(id) {
      return this.isError(id);
    },

    errorMessage(id) {
      return this.errorMessage(id);
    },
  },
};
