import './vendor.js';
import '../node_modules/semantic-ui-css/semantic.css';
import '../node_modules/semantic-ui-css/semantic.js';

import React from 'react';
import { render } from 'react-dom';
import { HashRouter, Match } from 'react-router';

import { MatchWhenAuthorized } from './components/RouteMatchers';

import Main from './components/Main';
import LoginView from './components/login/LoginView';

const Root = () => {
  return (
    <HashRouter>
      <div>
        <Match pattern="/login" component={LoginView} />
        <MatchWhenAuthorized pattern="/" component={Main} />
      </div>
    </HashRouter>
  )
};

render(<Root />, document.getElementById('root'));
