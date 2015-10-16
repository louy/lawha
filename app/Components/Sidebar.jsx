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
    return (
      <li className="list-group-item" key={item.id}>
        <span className="img-circle media-object pull-left" style={{width:32, height:32, textAlign: 'center', fontSize: 20, background: '#ccc', borderRadius: '50%', lineHeight: '32px', fontWeight: '600'}}>{item.icon}</span>
        <div className="media-body">
          <strong>{item.title}</strong>
          <p>{item.subtitle}</p>
        </div>
      </li>
    );
  },
});

export default Sidebar;
