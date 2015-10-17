import React from 'react';

import actions from '../actions';

const signals = [
  'SIGINT',
  'SIGINT',
  'SIGTERM',
  'SIGKILL',
];

const ServiceActions = React.createClass({
  propTypes: {
    service: React.PropTypes.string.isRequired,
    actions: React.PropTypes.arrayOf(React.PropTypes.shape({
      name: React.PropTypes.string.isRequired,
      stdin: React.PropTypes.string.isRequired,
      theme: React.PropTypes.string,
    })),
    status: React.PropTypes.any,
  },

  getDefaultProps() {
    return {
      actions: [],
    };
  },

  getInitialState() {
    return {
      lastSignal: null,
    };
  },

  getNextSignal() {
    let lastSignal = this.state.lastSignal == null ? -1 : this.state.lastSignal;
    ++ lastSignal;

    this.setState({
      lastSignal,
    });

    return signals[Math.min(lastSignal, signals.length - 1)];
  },

  startService() {
    this.setState({ lastSignal: null });
    actions.startService(this.props.service);
  },

  stopService() {
    const signal = this.getNextSignal();
    actions.stopService(this.props.service, signal);
  },

  onClick(action) {
    if (action.stdin) {
      actions.sendCommand(this.props.service, action.stdin);
    }
  },

  render() {
    let {actions} = this.props;
    if (!actions) {
      actions = [];
    }
    return (
      <div>
        {actions.map(this.renderAction)}
        {this.props.status === true ? (
          <button className="btn btn-large btn-negative" onClick={this.stopService}>Stop</button>
        ) : (
          <button className="btn btn-large btn-primary" onClick={this.startService}>Start</button>
        )}
      </div>
    );
  },

  renderAction(action) {
    if (this.props.status !== true) return null;

    const className = 'btn btn-large btn-' + (action.theme || 'default');

    return <button className={className} key={action.name} onClick={() => {
      this.onClick(action);
    }}>{action.name}</button>;
  },
});

export default ServiceActions;
