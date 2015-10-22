import React from 'react';

import actions from '../actions';

import Header from './Header';
import Sidebar from './Sidebar';
import Body from './Body';

import Interval from '../../Mixins/Interval';
import ListensToStore from '../../Mixins/ListensToStore';
import ServiceStore from '../Stores/Service';

const App = React.createClass({
  mixins: [
    new ListensToStore('ServiceStore', ServiceStore, '_.*'),
    new Interval(5000, function reloadServices() {
      actions.loadServices();
    }),
  ],

  getStateForServiceStore() {
    return {
      services: ServiceStore.getData('_') || [],
    };
  },

  getInitialState() {
    return {
      selectedId: null,
    };
  },

  componentWillMount() {
    actions.loadServices();
  },

  render() {
    const services = this.state.services.sort(function compareServices(service1, service2) {
      const v1 = service1.lastChanged || 0;
      const v2 = service2.lastChanged || 0;
      if (v1 < v2) {
        return 1;
      } else if (v1 > v2) {
        return -1;
      }
      return 0;
    });

    const items = services.map((service) => {
      let iconBackground;
      switch (service.status) {
      case null:
        iconBackground = '#ccc';
        break;
      case true:
        iconBackground = 'green';
        break;
      default:
        iconBackground = service.status > 0 ? 'red' : '#bada55';
      }

      return {
        id: service.id,
        title: service.name,
        subtitle: service.description,
        icon: service.status == null || service.status === true ? '' : (service.status + ''),
        iconBackground,
        indicator: (service.numberOfLines - ServiceStore.getServiceReadLines(service.id)) || null,
      };
    });

    const {selectedId} = this.state;

    return (
      <div className="window">
        <Header title="Lawha" />

        <div className="window-content">
          <div className="pane-group">
            <Sidebar items={items} onChange={(item) => {
              let {id} = item;
              if (this.state.selectedId === id) id = null;
              this.setState({ selectedId: id });
            }} onItemSelect={(item) => {
              let {id} = item;
              if (this.state.selectedId === id) id = null;
              this.setState({ selectedId: id });
              actions.startService(id);
            }} selectedId={selectedId} />
            <Body service={selectedId} />
          </div>
        </div>
      </div>
    );
  },
});

export default App;
