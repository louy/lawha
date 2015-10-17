import React from 'react';

import Convert from 'ansi-to-html';
let convert;

const entityMap = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
  '/': '&#x2F;',
};

function escapeHtml(string) {
  return String(string).replace(/[&<>"'\/]/g, chr => {
    return entityMap[chr];
  });
}

const Console = React.createClass({
  propTypes: {
    chunks: React.PropTypes.arrayOf(React.PropTypes.shape({
      type: React.PropTypes.oneOf('stdout', 'stderr'),
      ts: React.PropTypes.number.isRequired,
      data: React.PropTypes.string.isRequired,
    })),
    isRunning: React.PropTypes.bool.isRequired,
  },

  componentWillUpdate() {
    const pre = React.findDOMNode(this.refs.pre);
    const {scrollTop, scrollHeight, clientHeight} = pre;
    this.isAtEnd = scrollTop + clientHeight >= scrollHeight;
  },

  componentDidUpdate(prevProps, prevState) {
    if (this.isAtEnd) {
      const pre = React.findDOMNode(this.refs.pre);
      pre.scrollTop = pre.scrollHeight;
    }
  },

  render() {
    const {chunks} = this.props;

    convert = new Convert({
      stream: true,
    });

    return (
      <pre className="console" ref="pre">
        {chunks ? chunks.map(this.renderChunk) : []}
      </pre>
    );
  },

  renderChunk(chunk) {
    const {type, ts, data} = chunk;

    let __html;
    if (type === 'stderr' || type === 'stdout') {
      __html = convert.toHtml(escapeHtml(data));
    } else {
      __html = escapeHtml(data);
    }
    return (
      <div className={type} key={type + '-' + ts} dangerouslySetInnerHTML={{__html}} />
    );
  },
});

export default Console;
