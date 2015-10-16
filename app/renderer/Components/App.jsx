import React from 'react';

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
    };
  },

  render() {
    const items = this.state.services.map((service) => {
      return {
        id: service.name,
        title: service.name,
        subtitle: service.description,
        icon: service.status,
      };
    });

    return (
      <div className="window">
        <Header title="Lawha" />

        <div className="window-content">
          <div className="pane-group">
            <Sidebar items={items}/>
            <Body />
          </div>
        </div>
      </div>
    );
  },
});

export default App;
