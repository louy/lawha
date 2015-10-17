import React from 'react';

import actions from '../actions';

import Header from './Header';
import Sidebar from './Sidebar';
import Body from './Body';

import ListensToStore from '../../Mixins/ListensToStore';
import ServiceStore from '../Stores/Services';

const App = React.createClass({
  mixins: [new ListensToStore('ServiceStore', ServiceStore, 'data')],

  getStateForServiceStore() {
    return {
      services: ServiceStore.getData('_') || [],
      selectedId: null,
    };
  },

  componentWillMount() {
    actions.loadServices();
  },

  render() {
    const items = this.state.services.map((service) => {
      let iconBackground;
      switch (service.status) {
      case null:
        iconBackground = 'gray';
        break;
      case true:
        iconBackground = 'green';
        break;
      default:
        iconBackground = 'red';
      }

      return {
        id: service.name,
        title: service.name,
        subtitle: service.description,
        icon: service.status,
        iconBackground,
      };
    });

    const {selectedId} = this.state;

    return (
      <div className="window">
        <Header title="Lawha" />

        <div className="window-content">
          <div className="pane-group">
            <Sidebar items={items} onChange={(item) => {this.setState({ selectedId: item.id });}} selectedId={selectedId} />
            <Body service={selectedId} />
          </div>
        </div>
      </div>
    );
  },
});

export default App;
