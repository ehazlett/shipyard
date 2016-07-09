import React from 'react';

import { Router } from 'react-router';
import { render } from 'react-dom';
import { Provider } from 'react-redux';

import semanticCss from '../node_modules/semantic-ui-css/semantic.css';
import semanticJs from '../node_modules/semantic-ui-css/semantic.js';

import routes from './routes';
import store, { history } from './store';

const entrypoint = (
  <Provider store={store}>
    <Router history={history} routes={routes} />
  </Provider>
);

render(entrypoint, document.getElementById('root'));
