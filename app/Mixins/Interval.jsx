export default function interval(timeout, func) {
  let _interval;
  return {
    componentWillMount() {
      _interval = setInterval(() => {
        if (!this.isMounted()) {
          clearInterval(_interval);
          return;
        }
        func.apply(this);
      }, timeout);
    },

    componentWillUnmount() {
      clearInterval(_interval);
    },
  };
}
