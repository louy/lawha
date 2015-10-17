import React from 'react';

import actions from '../actions';

import Header from './Header';
import Sidebar from './Sidebar';
import Body from './Body';

import ListensToStore from '../../Mixins/ListensToStore';
import ServiceStore from '../Stores/Service';

const App = React.createClass({
  mixins: [new ListensToStore('ServiceStore', ServiceStore, '_.*')],

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
    const items = this.state.services.map((service) => {
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
            <Sidebar items={items} onChange={(item) => {
              let {id} = item;
              if (this.state.selectedId === id) id = null;
              this.setState({ selectedId: id });
            }} selectedId={selectedId} />
            <Body service={selectedId} />
          </div>
        </div>
      </div>
    );
  },
});

export default App;
