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
      iconBackground: React.PropTypes.string,
      indicator: React.PropTypes.number,
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
    if (!item.title) {
      console.log('item without title');
      return false;
    }
    if (search.length === 0 && search[0] === '') {
      return true;
    }

    return search.every(word => (item.title.toLowerCase().indexOf(word) > -1) || (item.subtitle.toLowerCase().indexOf(word) > -1));
  },

  onMouseEnter(e) {
    let {target} = e;
    while (target.className.indexOf('list-group-item') === -1) {
      target = target.parentElement;
      if (!target) return;
    }
    target.className += ' hover';
  },
  onMouseLeave(e) {
    let {target} = e;
    while (target.className.indexOf('list-group-item') === -1) {
      target = target.parentElement;
      if (!target) return;
    }
    target.className = target.className.replace(/\shover/g, '');
  },

  render() {
    const search = this.state.search.toLowerCase().split(' ');
    return (
      <div className="pane pane-one-fourth sidebar">
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
    const iconStyle = {
      width: 32, height: 32, textAlign: 'center', fontSize: 16, borderRadius: '50%', lineHeight: '32px', fontWeight: '600',
      background: item.iconBackground || '#ccc',
    };

    const indicatorStyle = {
      width: 20, height: 20, textAlign: 'center', fontSize: 10, borderRadius: '50%', lineHeight: '20px',
      margin: '8px 0 0',
      background: item.indicator ? '#ccc' : 'transparent',
    };

    let className = 'list-group-item';
    if (this.props.selectedId === item.id) {
      className += ' selected';
    }

    return (
      <li className={className} key={item.id}
          onClick={() => this.props.onChange(item)}
          onMouseEnter={this.onMouseEnter}
          onMouseLeave={this.onMouseLeave}>
        <span className="img-circle media-object pull-left" style={iconStyle}>{item.icon}</span>
        <span className="img-circle media-object pull-right" style={indicatorStyle}>{item.indicator}</span>
        <div className="media-body">
          <strong>{item.title}</strong>
          <p>{item.subtitle}</p>
        </div>
      </li>
    );
  },
});

export default Sidebar;
