var _ = require('underscore');

var React = require('react');
React.addons = require('react/addons');

var ReactBootstrap = require('react-bootstrap');
var Panel = ReactBootstrap.Panel;
var Button = ReactBootstrap.Button;
var ButtonToolbar = ReactBootstrap.ButtonToolbar;

var AlertAutoDismissable = React.createClass({
  getInitialState: function() {
    return {
      alertVisible: false
    };
  },

  render() {
    if (this.props.alertVisible) {
      return (
        <Alert bsStyle='danger' onDismiss={this.handleAlertDismiss}
               dismissAfter={2000}>
          {this.props.alertMessage}
        </Alert>
      );
    }

    return (<div className="hidden"></div>);
  },

  handleAlertDismiss() {
    this.setState({alertVisible: false});
  },

  handleAlertShow() {
    this.setState({alertVisible: true});
  }
});

var MyApp = React.createClass({
  getInitialState: function() {
    return {
      alertMessage: null
    };
  },

  alert: function(msg) {
    this.setState({ alertMessage: msg });
  },

  fire: function(event) {
    var name = event.currentTarget.name;
    console.log('fire', name);
    var fbq = window._fbq || [];
    switch(name) {
    case 'conversion':
      fbq.push(['track', '4342024424', {'value':'123.00','currency':'USD'}]);
      break;
    case 'wca':
      fbq.push(['track', 'PixelInitialized', {}]);
      break;
    case 'dpa_vc':
      fbq.push(['track', 'ViewContent', {
        'content_ids': [ 'VC123', 'HH456' ],
        'content_type': 'product',
        'product_catalog_id': '6023456789'
      }]);
      break;
    case 'dpa_atc':
      fbq.push(['track', 'AddToCart', {
        'content_ids': [ 'VC123', 'HH456' ],
        'content_type': 'product',
        'product_catalog_id': '6023456789'
      }]);
      break;
    case 'dpa_p':
      fbq.push(['track', 'Purchase', {
        'content_ids': [ 'VC123', 'HH456' ],
        'content_type': 'product',
        'product_catalog_id': '6023456789'
      }]);
      break
    }
    this.alert('Fired: ' + name);
  },

  render: function() {
    return (
      <div>
        <br />
        <div className="container">
          <div className="row">
            <Panel header="Pixel Tester">
              <h1>Click buttons to fire pixels.</h1>
              <AlertAutoDismissable />
              <ButtonToolbar>
                <Button name="conversion" onClick={this.fire}>
                  Fire Conversion
                </Button>
                <Button name="wca" bsStyle='primary' onClick={this.fire}>
                  Fire WCA
                </Button>
                <Button name="dpa_vc" bsStyle='success' onClick={this.fire}>
                  Fire DPA ViewContent
                </Button>
                <Button name="dpa_atc" bsStyle='info' onClick={this.fire}>
                  Fire DPA AddToCart
                </Button>
                <Button name="dap_p" bsStyle='warning' onClick={this.fire}>
                  Fire DPA Purchase
                </Button>
              </ButtonToolbar>
              </Panel>
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
