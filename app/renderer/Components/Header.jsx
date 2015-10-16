import React from 'react';

const Header = React.createClass({
  propTypes: {
    title: React.PropTypes.string,
  },

  render() {
    return (
      <header className="toolbar toolbar-header">
        <h1 className="title">{this.props.title}</h1>
      </header>
    );
  },
});

export default Header;
