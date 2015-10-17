import React from 'react';

import actions from '../actions';

import ListensToStore from '../../Mixins/ListensToStore';
import ServiceStore from '../Stores/Service';

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
    };
  },

  componentWillMount() {
    console.log('props', this.props);
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

  render() {
    const {service} = this.props;
    const {data, isError, errorMessage} = this.state;

    if (!service) {
      return (
        <div className="pane">
          <p>Please select a service from the left.</p>
        </div>
      );
    }

    return (
      <div className="pane">
        {data ? (
        <div className="aligner aligner--horizontal">
          <div className="aligner-item aligner-item--grow-3">
            <h2>{data.name}</h2>
          </div>
          <div className="aligner-item aligner-item--grow-1">
          {data.status === true ? (
            <button className="btn btn-large btn-negative">Stop</button>
          ) : (
            <button className="btn btn-large btn-primary">Start</button>
          )}
          </div>
        </div>
        ) : null}

        {isError ? (
          <div>
            <p>An error has occurred.</p>
            <p>{errorMessage}</p>
          </div>
        ) : null}

        <table className="table-striped">
          <thead>
            <tr>
              <th>Name</th>
              <th>Kind</th>
              <th>Date Modified</th>
              <th>Author</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>bars.scss</td>
              <td>Document</td>
              <td>Oct 13, 2015</td>
              <td>connors</td>
            </tr>
            <tr>
              <td>base.scss</td>
              <td>Document</td>
              <td>Oct 13, 2015</td>
              <td>connors</td>
            </tr>
            <tr>
              <td>button-groups.scss</td>
              <td>Document</td>
              <td>Oct 13, 2015</td>
              <td>connors</td>
            </tr>
            <tr>
              <td>buttons.scss</td>
              <td>Document</td>
              <td>Oct 13, 2015</td>
              <td>connors</td>
            </tr>
            <tr>
              <td>docs.scss</td>
              <td>Document</td>
              <td>Oct 13, 2015</td>
              <td>connors</td>
            </tr>
            <tr>
              <td>forms.scss</td>
              <td>Document</td>
              <td>Oct 13, 2015</td>
              <td>connors</td>
            </tr>
            <tr>
              <td>grid.scss</td>
              <td>Document</td>
              <td>Oct 13, 2015</td>
              <td>connors</td>
            </tr>
            <tr>
              <td>icons.scss</td>
              <td>Document</td>
              <td>Oct 13, 2015</td>
              <td>connors</td>
            </tr>
            <tr>
              <td>images.scss</td>
              <td>Document</td>
              <td>Oct 13, 2015</td>
              <td>connors</td>
            </tr>
            <tr>
              <td>lists.scss</td>
              <td>Document</td>
              <td>Oct 13, 2015</td>
              <td>connors</td>
            </tr>
            <tr>
              <td>mixins.scss</td>
              <td>Document</td>
              <td>Oct 13, 2015</td>
              <td>connors</td>
            </tr>
            <tr>
              <td>navs.scss</td>
              <td>Document</td>
              <td>Oct 13, 2015</td>
              <td>connors</td>
            </tr>
            <tr>
              <td>normalize.scss</td>
              <td>Document</td>
              <td>Oct 13, 2015</td>
              <td>connors</td>
            </tr>
            <tr>
              <td>photon.scss</td>
              <td>Document</td>
              <td>Oct 13, 2015</td>
              <td>connors</td>
            </tr>
            <tr>
              <td>tables.scss</td>
              <td>Document</td>
              <td>Oct 13, 2015</td>
              <td>connors</td>
            </tr>
            <tr>
              <td>tabs.scss</td>
              <td>Document</td>
              <td>Oct 13, 2015</td>
              <td>connors</td>
            </tr>
            <tr>
              <td>utilities.scss</td>
              <td>Document</td>
              <td>Oct 13, 2015</td>
              <td>connors</td>
            </tr>
            <tr>
              <td>variables.scss</td>
              <td>Document</td>
              <td>Oct 13, 2015</td>
              <td>connors</td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  },
});

export default Body;
