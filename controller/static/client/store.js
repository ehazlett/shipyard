import 'babel-polyfill';
import createSagaMiddleware from 'redux-saga';

import { createStore, compose, applyMiddleware } from 'redux';
import { routerMiddleware, syncHistoryWithStore } from 'react-router-redux';
import { hashHistory } from 'react-router';

import registerWatchers from './sagas';
import rootReducer from './reducers';

const sagaMiddleware = createSagaMiddleware()

const store = createStore(
  rootReducer,
  compose(
    applyMiddleware(sagaMiddleware),
		applyMiddleware(routerMiddleware(hashHistory)),
    window.devToolsExtension ? window.devToolsExtension() : f => f
  )
);

registerWatchers(sagaMiddleware);

if(module.hot) {
  module.hot.accept('./reducers', () => {
    const nextRootReducer = require('./reducers').default;
    store.replaceReducer(nextRootReducer);
  })
}

export const history = syncHistoryWithStore(hashHistory, store);
export default store;
