var _ = require('underscore');

var React = require('react');
React.addons = require('react/addons');
var ReactCSSTransitionGroup = React.addons.CSSTransitionGroup;

var Radium = require('radium');

var ReactBootstrap = require('react-bootstrap');
var Panel = ReactBootstrap.Panel;
var Input = ReactBootstrap.Input;
var Button = ReactBootstrap.Button;
var Label = ReactBootstrap.Label;
var Nav = ReactBootstrap.Nav;
var NavItem = ReactBootstrap.NavItem;

var Reactable = require('reactable');
// and use reactable's Table
var Table = Reactable.Table;
var Tr = Reactable.Tr;

// ace editor
var AceEditor  = require('react-ace');
require('brace/mode/html');
require('brace/theme/github');

MAX_EVENTS = 100;
MAX_IFRAMES = 10;

function getParameterByName(name) {
  name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
  var regex = new RegExp('[\\?&]' + name + '=([^&#]*)'),
  results = regex.exec(location.search);
  return results === null ? '' :
    decodeURIComponent(results[1].replace(/\+/g, ' '));
}

var EditableA = React.createClass({
  getInitialState: function() {
    return {
      inEditing: false,
      value: this.props.defaultValue
    };
  },

  startEdit: function() {
    return this.setState({ inEditing: true });
  },

  endEdit: function() {
    var v = $(this.getDOMNode()).find('#editor').val();
    var oldv = this.state.value;
    this.setState({ value: v, inEditing: false });
    if (this.props.onChange) {
      this.props.onChange(v, oldv);
    }
  },

  render: function() {
    if (this.state.inEditing) {
      return (
        <span>
          <input type='text' id='editor' defaultValue={this.state.value} />
          <button onClick={this.endEdit}>
            <span className='glyphicon glyphicon-ok'></span>
          </button>
        </span>
      );
    } else {
      return (
        <span>
          {this.props.label} :
          <a href="#" onClick={this.startEdit}><u>{this.state.value}</u></a>
        </span>
      );
    }
  }
});

var PixelEditor = React.createClass({
  aceEditorName: 'pixelAceEditor',

  defaultPixelCodes: {
    'cp': ["<script> ",
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
"window._fbq.push(['track', '1234567890', {'value':'0.00','currency':'USD'}]); ",
"</script> ",
"<noscript><img height='1' width='1' alt='' style='display:none' src='https://www.facebook.com/tr?ev=1234567890&amp;cd[value]=0.00&amp;cd[currency]=USD&amp;noscript=1' /></noscript>"
    ].join('\n'),
    'wcap': ["<script> ",
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
"  _fbq.push(['addPixelId', '1023456789']);",
"})(); ",
"window._fbq = window._fbq || []; ",
"window._fbq.push(['track', 'PixelInitialized', {}]);",
"</script> ",
"<noscript><img height='1' width='1' alt='' style='display:none' src='https://www.facebook.com/tr?id=1023456789&ev=PixelInitialized&amp;noscript=1' /></noscript>"
    ].join('\n')
  },

  getInitialState: function() {
    return {
      pixelType: 'cp',
      pixelCode: {
        'cp': this.defaultPixelCodes['cp'],
        'wcap': this.defaultPixelCodes['wcap']
      }
    };
  },

  loadDefaultPixelCode: function(editor) {
    var editor = ace.edit(this.aceEditorName);
    if (editor) {
      var s = editor.getSession();
      s.setOption("useWorker", false);
      s.setUseWrapMode(true);
      s.setValue(this.state.pixelCode[this.state.pixelType]);
    }
  },

  onceLoaded: function(iframe, callback) {
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
  },

  genIframe: function(onLoaded) {
    if (!this._iframes) {
      this._iframes = [];
    }
    var name = 'fbpixel' + Math.random().toString().replace('.', '');
    var isLegacy = !!(window.attachEvent && !window.addEventListener);
    var el = isLegacy ? '<iframe name="' + name + '">' : 'iframe';
    var iframe = document.createElement(el);
    iframe.id = name;
    iframe.name = name;
    iframe.style.display = 'none';
    if (this._iframes.length + 1 > MAX_IFRAMES) {
      $(this._iframes.shift()).remove();
    }
    this._iframes.push(iframe);
    this.onceLoaded(iframe, _.partial(onLoaded, iframe));
    document.body.appendChild(iframe);
  },

  firePixel: function() {
    var editor = ace.edit(this.aceEditorName);
    if (editor) {
      var code = editor.getSession().getValue();
      // hijacking!
      code = code.replace('//connect.facebook.net/en_US/fbds.js', '/fbds.js');
      this.genIframe(function(iframe) {
        console.info('iframe', iframe.name, 'loaded, now injecting pixel code');
        var body = $(iframe).contents().find('body');
        body.append('<html><head></head><body>' + code + '</body></html>');
        console.info('iframe', iframe.name, 'injection done.');
      });
    }
  },

  handleSelectPixelType: function(key) {
    this.setState({
      pixelType: key
    });
  },

  render: function() {
    var header = (<b>Pixel Editor</b>);
    return (
      <Panel header={header}>
        <Nav bsStyle='tabs' activeKey={this.state.pixelType}
             onSelect={this.handleSelectPixelType}>
          <NavItem eventKey={'cp'}>Conversion Pixel</NavItem>
          <NavItem eventKey={'wcap'}>WCA Pixel</NavItem>
        </Nav>
        <form className='voffset'>
          <AceEditor name={this.aceEditorName}
                     mode='html' theme='github'
                     height='350px' width='100%'
                     onLoad={this.loadDefaultPixelCode} />
          <Button bsSize='large' bsStyle='danger' block
                  className='voffset'
                  onClick={this.firePixel}>
            Fire!
          </Button>
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
    if (evts.length + 1 > MAX_EVENTS) {
      evts.shift();
    }
    evts.push(data.event);
    this.setState({events: evts});
  },

  restartWSocketStream: function() {
    var self = this;
    if (this.socket) {
      this.socket.close();
    }
    socket = this.socket = new WebSocket('ws://' + location.host);
    socket.onopen = function() {
      socket.send(JSON.stringify({ pixelId: self.props.pixelId }));
    };
    socket.onmessage = function(event) {
      console.info('received event:', event);
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

  componentDidMount: function() {
    this.restartWSocketStream();
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

  changePixelId: function(newPixelId, oldPixelId) {
    console.info('pixel id changed:', oldPixelId, '->', newPixelId);
    if (this.props.onChangePixelId) {
      this.props.onChangePixelId(newPixelId);
      this.restartWSocketStream();
    }
  },

  render: function() {
    var header = (
      <span>
        <b>Events Inspector</b>
        <span className='pull-right'>
          <EditableA label='PixelID' defaultValue='null'
                     onChange={this.changePixelId} />
        </span>
      </span>
    );
    return (
      <Panel header={header}>
        {this.genEventsTable()}
      </Panel>
    );
  }
});

var MyApp = React.createClass({
  getInitialState: function() {
    return {
      pixelId: 'null'
    };
  },

  changePixelId: function(newid) {
    this.setState({ pixelId: newid });
  },

  render: function() {
    return (
      <div>
        <br />
        <div className="container">
          <div className="row">
            <PixelEditor {...this.state} />
            <EventInspector {...this.state}
              onChangePixelId={this.changePixelId} />
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
