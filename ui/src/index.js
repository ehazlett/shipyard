import './vendor.js';
import '../node_modules/semantic-ui-css/semantic.css';
import '../node_modules/semantic-ui-css/semantic.js';
import '../node_modules/react-table/react-table.css';

import React from 'react';
import { render } from 'react-dom';
import { HashRouter, Route } from "react-router-dom";
import NotificationSystem from 'react-notification-system';
import Formsy from 'formsy-react';

import { RouteWhenAuthorized } from './components/RouteMatchers';

import Main from './components/Main';
import LoginView from './components/login/LoginView';

import './css/fonts.css';

class Root extends React.Component {

  constructor(props) {
    super(props);
    this.notificationStyle = {
      NotificationItem: {
        DefaultStyle: {
          height: 'auto',
        }
      },
      MessageWrapper: {
        DefaultStyle: {
          wordWrap: 'break-word',
        }
      }
    };


    // TODO: Move custom formsy validations into their own module
    Formsy.addValidationRule('isUnsignedInt', function (values, value) {
      // Empty values are valid
      if(value === "") {
        return true;
      }

      const num = parseInt(value, 10);
      if(isNaN(num)) {
        return false;
      }
      if(num < 0) {
        return false
      }

      return true;
    });
  }

  componentDidMount() {
    global.notification = this.refs.notificationSystem;
  }

  render() {
    return (
      <HashRouter>
        <div>
          <Route path="/login" component={LoginView} />
          <RouteWhenAuthorized path="/" component={Main} />
          <NotificationSystem ref="notificationSystem" style={this.notificationStyle}/>
        </div>
      </HashRouter>
    )
  }
};

render(<Root />, document.getElementById('root'));
