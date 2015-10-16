import React from 'react';

import actions from '../actions';

import Header from './Header';
import Sidebar from './Sidebar';
import Body from './Body';

import ListensToStore from '../../Mixins/ListensToStore';
import ServicesStore from '../Stores/Services';

const App = React.createClass({
  mixins: [new ListensToStore('ServicesStore', ServicesStore, 'services,services.*')],

  getStateForServicesStore() {
    return {
      services: ServicesStore.getServices(),
      selectedId: null,
    };
  },

  componentWillMount() {
    actions.loadServices();
  },

  render() {
    const items = this.state.services.map((service) => {
      return {
        id: service.path,
        title: service.name,
        subtitle: service.description,
        icon: service.status,
      };
    });

    const {selectedId} = this.state;

    return (
      <div className="window">
        <Header title="Lawha" />

        <div className="window-content">
          <div className="pane-group">
            <Sidebar items={items} onChange={(item) => {this.setState({ selectedId: item.id });}} selectedId={selectedId} />
            <Body />
          </div>
        </div>
      </div>
    );
  },
});

export default App;
