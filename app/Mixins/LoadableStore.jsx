/*
  To use this store, listen to some action and call `#triggerLoad()` when ready.
  It won't fire if a request already exists so use `#abort()` if you want to cancel it.

  You can also call `#reset()` to remove error state and message. If a request is running however,
    it won't do anything. Use `#abort()` and then `#reset()` to make sure it's reset.
 */
export default {
  /*
    You should override this method. It should return a jquery ajax request object (jqxhr).
  */

  // getRequest() {},

  /*
    You can override these methods.
  */

  // done(data) {},
  // fail(jqxhr) {},
  // always() {},

  /*
    The rest is private.
   */

  isLoading: false,
  isError: false,
  errorMessage: null,
  data: null,

  triggerLoad() {
    if (this.isLoading) return false;

    if (!this.getRequest) throw new Error('`getRequest` is not implemented.');

    this.isLoading = true;
    this.isError = false;
    this.errorMessage = null;
    this.emit('meta');

    const _this = this;

    this.request = this.getRequest().done(function done(data) {
      _this.data = data;
      _this.done && _this.done.apply(_this, arguments);
      _this.emit('data');
    }).fail(function fail(jqxhr) {
      _this.isError = true;

      if (jqxhr.responseJSON) {
        _this.errorMessage = jqxhr.responseJSON.message;
      } else if (!jqxhr.status) {
        _this.errorMessage = 'Error connecting to the server.';
      } else {
        _this.errorMessage = jqxhr.statusText + ' (' + jqxhr.status + ')';
      }

      _this.fail && _this.fail.apply(_this, arguments);
    }).always(function always() {
      _this.isLoading = false;
      _this.always && _this.always.apply(_this, arguments);
      _this.emit('meta');
    });

    return true;
  },

  abort() {
    if (this.request) {
      this.request.abort();
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
