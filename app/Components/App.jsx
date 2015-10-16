import React from 'react';

import Header from './Header';
import Sidebar from './Sidebar';
import Body from './Body';

const App = React.createClass({
  render() {
    return (
      <div className="window">
        <Header title="Lawha" />

        <div className="window-content">
          <div className="pane-group">
            <Sidebar items={[
              {
                id: '1',
                title: 'List item title',
                subtitle: 'Lorem ipsum dolor sit amet.',
                icon: 'A',
              },
              {
                id: '2',
                title: 'Cheetah!',
                subtitle: 'Lorem ipsum dolor sit amet.',
                icon: 'B',
              },
              {
                id: '3',
                title: 'Test item number 3',
                subtitle: 'Lorem ipsum dolor sit amet.',
                icon: 'C',
              },
            ]}/>
            <Body />
          </div>
        </div>
      </div>
    );
  },
});

export default App;
