export default function ListensToStore(name, store, event = null) {
  const events = event ? event.split(',') : [];
  return {
    componentWillMount() {
      if (events.length) {
        events.forEach((_event) => store.on(_event, this['changeStateFor' + name]));
      } else {
        store.onAny(this['changeStateFor' + name]);
      }
    },

    componentWillUnmount() {
      if (events.length) {
        events.forEach((_event) => store.off(_event, this['changeStateFor' + name]));
      } else {
        store.offAny(this['changeStateFor' + name]);
      }
    },

    getInitialState() {
      return this['getStateFor' + name](true);
    },

    ['changeStateFor' + name]() {
      this.setState(this['getStateFor' + name]());
    },
  };
}
