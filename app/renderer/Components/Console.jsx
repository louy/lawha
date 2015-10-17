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
      type: React.PropTypes.oneOf('stdin', 'stdout', 'stderr', 'system', 'command', 'signal'),
      ts: React.PropTypes.number.isRequired,
      data: React.PropTypes.string.isRequired,
    })),
    isRunning: React.PropTypes.bool.isRequired,
    onCommand: React.PropTypes.func.isRequired,
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

  onKeyDown(e) {
    if (e.keyCode === 13) {
      // if (event.shiftKey) {
      //   return;
      // }
      const input = React.findDOMNode(this.refs.input);
      const {value} = input;
      let shouldSend = false;
      if (value[value.length-1] === '\\') {
        if (window.getSelection && window.getSelection() && window.getSelection().toString()) {
          shouldSend = true;
        }
      } else {
        shouldSend = true;
      }

      if (shouldSend) {
        e.preventDefault();
        this.sendInput();
      }
    }
  },

  sendInput() {
    const input = React.findDOMNode(this.refs.input);
    this.props.onCommand(input.value);
    input.value = '';
  },

  render() {
    const {chunks} = this.props;

    convert = new Convert({
      stream: true,
    });

    return (
      <pre className="console" ref="pre">
        {chunks ? chunks.map(this.renderChunk) : []}
        {this.renderInput()}
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
      <div className={'chunk ' + type} key={type + '-' + ts} dangerouslySetInnerHTML={{__html}} />
    );
  },

  renderInput() {
    if (this.props.isRunning) {
      return (
        <label>
          <textarea ref="input" onKeyDown={this.onKeyDown} onKeyUp={this.onKeyUp} />
        </label>
      );
    }
    return null;
  },
});

export default Console;
