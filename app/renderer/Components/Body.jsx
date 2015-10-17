import React from 'react';

import actions from '../actions';

import ListensToStore from '../../Mixins/ListensToStore';
import ServiceStore from '../Stores/Service';
import Console from './Console';

const signals = [
  'SIGINT',
  'SIGINT',
  'SIGTERM',
  'SIGKILL',
];

const Body = React.createClass({
  mixins: [new ListensToStore('ServiceStore', ServiceStore)],

  getStateForServiceStore() {
    let {service} = this.props;
    return {
      data: ServiceStore.getData(service),
      isLoading: ServiceStore.isLoading(service),
      isError: ServiceStore.isError(service),
      errorMessage: ServiceStore.errorMessage(service),
    };
  },

  propTypes: {
    service: React.PropTypes.string,
  },

  getInitialState() {
    return {
      service: this.props.service,
      lastSignal: null,
    };
  },

  componentWillMount() {
    actions.loadService(this.props.service);
  },

  componentWillReceiveProps(nextProps) {
    if (this.props.service !== nextProps.service) {
      this.setState({
        service: this.props.service,
      });
      actions.loadService(nextProps.service);
    }
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
    console.log('sending signal', signal);
    actions.stopService(this.props.service, signal);
  },

  sendCommand(command) {
    actions.sendCommand(this.props.service, command);
  },

  render() {
    const {service} = this.props;
    const {data, isLoading, isError, errorMessage} = this.state;

    if (!service) {
      return (
        <div className="pane">
          <div className="large-message">
            <p>Please select a service from the left.</p>
          </div>
        </div>
      );
    }

    return (
      <div className="pane pane--scroll">
        <div className="pane-title">
          {data ? (
          <div className="aligner aligner--horizontal aligner--center body-title">
            <div className="aligner-item aligner-item--grow-3">
              <h2>{data.name}</h2>
            </div>

            <div className="aligner-item aligner-item--grow-2">
            {isLoading ? (
              <div>
                <p>Loading...</p>
              </div>
            ) : null}
            </div>

            <div className="aligner-item aligner-item--grow-1 body-actions">
            {data.status === true ? (
              <button className="btn btn-large btn-negative" onClick={this.stopService}>Stop</button>
            ) : (
              <button className="btn btn-large btn-primary" onClick={this.startService}>Start</button>
            )}
            </div>
          </div>
          ) : null}
        </div>
        <div className="pane-content">
          {isError ? (
            <div className="large-message">
              <p>An error has occurred.</p>
              <p>{errorMessage}</p>
            </div>
          ) : null}

          <Console chunks={data ? data.output : null} isRunning={data ? data.status === true : false} onCommand={this.sendCommand} />
        </div>
      </div>
    );
  },
});

export default Body;
