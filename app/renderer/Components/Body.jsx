import React from 'react';

import actions from '../actions';

import ListensToStore from '../../Mixins/ListensToStore';
import ServiceStore from '../Stores/Service';
import Console from './Console';
import ServiceActions from './ServiceActions';

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
      if (nextProps.service) {
        actions.loadService(nextProps.service);
      }
    }
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
      <div className="pane aligner aligner--vertical">
        <div className="aligner-item">
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

            <div className="aligner-item aligner-item--grow-5 body-actions">
              <ServiceActions service={data.id} actions={data.actions} status={data.status} />
            </div>
          </div>
          ) : null}
        </div>
        <div className="aligner-item aligner-item--grow-1" style={{position: 'relative'}}>
          {isError ? (
            <div className="large-message">
              <p>An error has occurred.</p>
              <p>{errorMessage}</p>
            </div>
          ) : null}

          <Console chunks={data ? data.output : null} isRunning={data ? data.status === true : false}
                    onCommand={this.sendCommand} service={service} numberOfLines={data ? data.numberOfLines : 0} />
        </div>
      </div>
    );
  },
});

export default Body;
