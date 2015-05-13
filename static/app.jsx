var React = require('react');
React.addons = require('react/addons');
var ReactCSSTransitionGroup = React.addons.CSSTransitionGroup;

var Radium = require('radium');

var ReactBootstrap = require('react-bootstrap');
var Panel = ReactBootstrap.Panel;
var Input = ReactBootstrap.Input;
var Button = ReactBootstrap.Button;
var Label = ReactBootstrap.Label;

var Reactable = require('reactable');
// and use reactable's Table
var Table = Reactable.Table;
var Tr = Reactable.Tr;

// ace editor
var AceEditor  = require('react-ace');
require('brace/mode/html');
require('brace/theme/github');

EVENTS_MAX = 100;

function getParameterByName(name) {
  name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
  var regex = new RegExp('[\\?&]' + name + '=([^&#]*)'),
  results = regex.exec(location.search);
  return results === null ? '' :
    decodeURIComponent(results[1].replace(/\+/g, ' '));
}

function onceLoaded(iframe, callback) {
  var onload = function() {
    if (iframe.detachEvent) {
      iframe.detachEvent('onload', onload);
    } else {
      iframe.onload = null;
    }
    callback();
  };
  if (iframe.attachEvent) {
    iframe.attachEvent('onload', onload);
  } else {
    iframe.onload = onload;
  }
}

var PixelEditor = React.createClass({
  aceEditorName: 'pixelAceEditor',

  loadDefaultPixelCode: function(editor) {
    var editor = ace.edit(this.aceEditorName);
    if (editor) {
      var s = editor.getSession();
      s.setOption("useWorker", false);
      s.setUseWrapMode(true);
      s.setValue([
"<script> ",
"(function() { ",
"  var _fbq = window._fbq || (window._fbq = []); ",
"  if (!_fbq.loaded) { ",
"    var fbds = document.createElement('script'); ",
"    fbds.async = true; ",
"    fbds.src = '//connect.facebook.net/en_US/fbds.js'; ",
"    var s = document.getElementsByTagName('script')[0]; ",
"    s.parentNode.insertBefore(fbds, s); ",
"    _fbq.loaded = true; ",
"  } ",
"})(); ",
"window._fbq = window._fbq || []; ",
"window._fbq.push(['track', '6014777872661', {'value':'0.00','currency':'USD'}]); ",
"</script> ",
"<noscript> ",
"  <img height='1' width='1' alt='' style='display:none' src='https://www.facebook.com/tr?ev=6014777872661&amp;cd[value]=0.00&amp;cd[currency]=USD&amp;noscript=1' /> ",
"</noscript>"
      ].join('\n'));
    }
  },

  firePixel: function() {
    var editor = ace.edit(this.aceEditorName);
    if (editor) {
      var code = editor.getSession().getValue();
      // hijacking!
      code = code.replace('//connect.facebook.net/en_US/fbds.js', '/fbds.js');
      var name = 'fbpixel' + Math.random().toString().replace('.', '');
      var isLegacy = !!(window.attachEvent && !window.addEventListener);
      var el = isLegacy ? '<iframe name="' + name + '">' : 'iframe';
      var iframe = document.createElement(el);
      iframe.id = name;
      iframe.name = name;
      iframe.style.display = 'none';
      onceLoaded(iframe, function() {
        console.log('iframe loaded, now injecting pixel code');
        var body = $(iframe).contents().find('body');
        body.append('<html><head></head><body>' + code + '</body></html>');
      });
      document.body.appendChild(iframe);
    }
  },

  render: function() {
    return (
      <Panel header={<h3>Pixel Editor</h3>}>
        <form>
          <AceEditor name={this.aceEditorName}
                     mode='html' theme='github'
                     height='350px' width='100%'
                     onLoad={this.loadDefaultPixelCode} />
          <Button bsSize='large' bsStyle='danger' onClick={this.firePixel} block>Fire!</Button>
        </form>
      </Panel>
    );
  }
});

var EventInspector = React.createClass({
  getInitialState: function() {
    return {
      events: []
    }
  },

  appendEvent: function(data) {
    var evts = this.state.events;
    if (evts.length + 1 > EVENTS_MAX) {
      evts.shift();
    }
    evts.push(data.event);
    this.setState({events: evts});
  },

  componentDidMount: function() {
    var self = this;
    var socket = window.socket = new WebSocket('ws://' + location.host);
    socket.onopen = function() {
      socket.send(JSON.stringify({ pixelId: self.props.pixelId }));
    };
    socket.onmessage = function(event) {
      console.log('got evet:', event);
      var data = JSON.parse(event.data);
      switch(data['type']) {
        case 'ok':
          break;
        case 'event':
          self.appendEvent(data);
          break;
      }
    };
    socket.onclose = function() {
    };
  },

  componentDidUpdate: function(prevProps, prevState) {
    var domroot = this.getDOMNode();
    var trs = $(domroot).find('.table tbody tr');
    if (trs) {
      var tr = $(trs[0]);
      tr.removeClass().addClass('effect-blink-enter');
      setTimeout(function() { tr.addClass('effect-blink-leave'); }, 1000);
    }
  },

  genEventsTable: function() {
    if (this.state.events.length > 0) {
      var e = [];
      this.state.events.forEach(function(event) {
        var content = '<p>headers:</p> ' +
          '<pre style="max-width: 960px;">' +
          JSON.stringify(event['headers'], null, 2) + '</pre>' +
          (('params' in event) ? '<p>params</p>' : '<p>body</p>') +
          '<pre style="max-width: 960px;">' +
          JSON.stringify(event['params'] || event['body'], null, 2) + '</pre>';

        e.push({
          time: (new Date(event['time'])).toString(),
          method: event['method'],
          content: Reactable.unsafe(content)
        });
      });
      e.reverse();
      return (
        <Table className="table table-stripped" data={e}></Table>
      );
    } else {
      return (<p>Nothing yet!</p>);
    }
  },

  render: function() {
    return (
      <Panel header={<h3>Events Inspector</h3>}>
        {this.genEventsTable()}
      </Panel>
    );
  }
});

var MyApp = React.createClass({
  getInitialState: function() {
    return {
      pixelId: 123
    };
  },

  render: function() {
    return (
      <div>
        <br />
        <div className="container">
          <div className="row">
            <PixelEditor {...this.state} />
            <EventInspector {...this.state} />
          </div>
        </div>
      </div>
    );
  }
});

var myApp = React.render(
  <MyApp />,
  document.getElementById('top-container')
);

