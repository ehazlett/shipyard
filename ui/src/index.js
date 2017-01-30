import './vendor.js';
import '../node_modules/semantic-ui-css/semantic.css';
import '../node_modules/semantic-ui-css/semantic.js';

import React from 'react';
import { render } from 'react-dom';
import { HashRouter, Match } from 'react-router';
import NotificationSystem from 'react-notification-system';

import { MatchWhenAuthorized } from './components/RouteMatchers';

import Main from './components/Main';
import LoginView from './components/login/LoginView';

import './css/fonts.css';
import './css/reactable.css';

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
  }

  componentDidMount() {
    global.notification = this.refs.notificationSystem;
  }

  render() {
    return (
      <HashRouter>
        <div>
          <Match pattern="/login" component={LoginView} />
          <MatchWhenAuthorized pattern="/" component={Main} />
          <NotificationSystem ref="notificationSystem" style={this.notificationStyle}/>
        </div>
      </HashRouter>
    )
  }
};

render(<Root />, document.getElementById('root'));
