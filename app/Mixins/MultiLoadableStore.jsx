/*
  To use this store, listen to some action and call `#triggerLoad(id)` when ready.
  It won't fire if a request already exists so use `#abort(id)` if you want to cancel it.

  You can also call `#reset(id)` to remove error state and message. If a request is running however,
    it won't do anything. Use `#abort(id)` and then `#reset(id)` to make sure it's reset.

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

  // Don't modify these manually. Use helper functions below instead.
  _isLoading: {},
  _isError: {},
  _errorMessage: {},
  _data: {},
  requests: {},

  // Helper functions
  isLoading(id, value) {
    if (value !== undefined) {
      this._isLoading[id] = value;
    }

    return !!this._isLoading[id];
  },

  isError(id, value) {
    if (value !== undefined) {
      this._isError[id] = value;
    }

    return !!this._isError[id];
  },

  errorMessage(id, value) {
    if (value !== undefined) {
      this._errorMessage[id] = value;
    }

    return this._errorMessage[id] || null;
  },

  data(id, value) {
    if (value !== undefined) {
      this._data[id] = value;
    }

    return this._data[id] || null;
  },

  abort(id) {
    if (this.requests[id]) {
      this.requests[id].abort();
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

  triggerLoad(id) {
    if (this.isLoading(id)) return false;

    if (!this.getRequest) throw new Error('`getRequest` is not implemented.');

    // Reset variables
    this.isLoading(id, true);
    this.isError(id, false);
    this.errorMessage(id, null);
    this.emit(id + '.meta');

    const _this = this;

    this.requests[id] = this.getRequest(id).then(function done(data) {
      _this.data(id, data);
      _this.done && _this.done.apply(_this, [id].concat(arguments));
      _this.emit(id + '.data');
    }, function fail(err) {
      _this.isError(id, true);

      if (err && err.message) {
        _this.errorMessage(id, err.message);
      } else {
        _this.errorMessage(id, 'Unknown error');
      }

      _this.fail && _this.fail.apply(_this, [id].concat(arguments));
    }).then(function always() {
      _this.isLoading(id, false);
      _this.always && _this.always.apply(_this, [id].concat(arguments));
      _this.emit(id + '.meta');
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
