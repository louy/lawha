import React from 'react/addons';

const {LinkedStateMixin} = React.addons;

const Sidebar = React.createClass({
  mixins: [LinkedStateMixin],

  propTypes: {
    items: React.PropTypes.arrayOf(React.PropTypes.shape({
      id: React.PropTypes.oneOfType([
        React.PropTypes.string,
        React.PropTypes.number,
      ]).isRequired,
      title: React.PropTypes.string.isRequired,
      subtitle: React.PropTypes.string.isRequired,
      icon: React.PropTypes.string,
    })).isRequired,
    selectedId: React.PropTypes.oneOfType([
      React.PropTypes.string,
      React.PropTypes.number,
    ]),
    onChange: React.PropTypes.func,
  },

  getDefaultProps() {
    return {
      onChange: () => {},
    };
  },

  getInitialState() {
    return {
      search: '',
    };
  },

  filterItemForSearch(search, item) {
    return search.every(word => item.title.toLowerCase().indexOf(word) > -1);
  },

  render() {
    const search = this.state.search.toLowerCase().split(' ');
    return (
      <div className="pane pane-sm sidebar">
        <ul className="list-group">
          <li className="list-group-header">
            <input className="form-control" type="text" placeholder="Search for someone" valueLink={this.linkState('search')} />
          </li>
          {this.props.items.filter(this.filterItemForSearch.bind(null, search)).map(this.renderItem)}
        </ul>
      </div>
    );
  },

  renderItem(item) {
    const style = {width: 32, height: 32, textAlign: 'center', fontSize: 16, background: '#ccc', borderRadius: '50%', lineHeight: '32px', fontWeight: '600'};

    let className = 'list-group-item';
    if (this.props.selectedId === item.id) {
      className += ' selected';
    }

    return (
      <li className={className} key={item.id} onClick={() => this.props.onChange(item)}>
        <span className="img-circle media-object pull-left" style={style}>{item.icon}</span>
        <div className="media-body">
          <strong>{item.title}</strong>
          <p>{item.subtitle}</p>
        </div>
      </li>
    );
  },
});

export default Sidebar;
