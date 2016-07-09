import React from 'react';

import { Router } from 'react-router';
import { Provider } from 'react-redux';

import store, { history } from '../store';
import routes from '../routes';

export default (
  <Provider store={store}>
    <Router history={history} routes={routes} />
  </Provider>
);

