var React = require('react');

var ReactBootstrap = require('react-bootstrap');
var Panel = ReactBootstrap.Panel;
var Input = ReactBootstrap.Input;
var Button = ReactBootstrap.Button;

var Reactable = require('reactable');
// and use reactable's Table
var Table = Reactable.Table;

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
  getDefaultPixelCode: function() {
    return "<p>Working...</p> \
<script> \
(function() { \
  var _fbq = window._fbq || (window._fbq = []); \
  if (!_fbq.loaded) { \
    var fbds = document.createElement('script'); \
    fbds.async = true; \
    fbds.src = '/fbds.js'; \
    var s = document.getElementsByTagName('script')[0]; \
    s.parentNode.insertBefore(fbds, s); \
    _fbq.loaded = true; \
  } \
})(); \
window._fbq = window._fbq || []; \
window._fbq.push(['track', '6014777872661', {'value':'0.00','currency':'USD'}]); \
</script> \
<noscript> \
  <img height='1' width='1' alt='' style='display:none' src='https://www.facebook.com/tr?ev=6014777872661&amp;cd[value]=0.00&amp;cd[currency]=USD&amp;noscript=1' /> \
</noscript>";
  },

  firePixel: function() {
    var code = $('#pixelCodeTA').val();
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
  },

  render: function() {
    return (
      <Panel header="Pixel Editor">
        <form>
          <Input id='pixelCodeTA' type='textarea' defaultValue={this.getDefaultPixelCode()} />
          <Button bsStyle='danger' onClick={this.firePixel}>Fire!</Button>
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
      return <Table className="table table-stripped" data={e} />
    } else {
      return (<p>Nothing yet!</p>);
    }
  },

  render: function() {
    return (
      <Panel header="Event Inspector">
        {this.genEventsTable()}
      </Panel>
    );
  }
});

var EIEventsTab = React.createClass({
  render: function() {
    var rows = [];
    if (this.props.events) {
      this.props.events.forEach(function(item) {
        console.log('item is', item);
        rows.push(
          <tr>
            <td>{item['time']}</td>
            <td>{item['method']}</td>
            <td><pre>{item['headers']}</pre></td>
            <td><pre>{item['params'] || item['body']}</pre></td>
          </tr>
        );
      });
    }
    var tab = (
      <Table responsive striped bordered condensed hover>
        <thead><tr>
            <th>Time</th>
            <th>Method</th>
            <th>Header</th>
            <th>Params/Body</th>
        </tr></thead>
        <tbody>
          {rows}
        </tbody>
      </Table>);
    return tab;
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

