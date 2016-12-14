import React from 'react';
import {Match, Redirect} from 'react-router';

import { getAuthToken } from '../services/auth';

export function MatchWhenAuthorized({ component: Component, user, ...rest }) {
  return (
    <Match {...rest} render={props => (
      getAuthToken() ? (
        <Component {...props}/>
      ) : (
        <Redirect to={{ pathname: '/login', state: { from: props.location } }}/>
      )
    )}/>
  );
}
