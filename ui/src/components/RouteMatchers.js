import React from 'react';
import { Route, Redirect } from "react-router-dom";
import { Breadcrumb, Segment } from 'semantic-ui-react'

import { getAuthToken } from '../services/auth';

export const RouteWhenAuthorized = ({ component: Component, user, ...rest }) => {
  return (
    <Route {...rest} render={props => (
      getAuthToken() ? (
        <Component {...props}/>
      ) : (
        <Redirect to={{ pathname: '/login', state: { from: props.location } }}/>
      )
    )}/>
  );
};

// The sections prop passed to the Breadcrumb component should be formatted like so:
//
// const sections = [
//   { key: 'home', content: 'Home', link: true },
//   { key: 'registration', content: 'Registration', link: true, href: '/registration' },
//   { key: 'info', content: 'Personal Information', active: true },
// ];
//
export const RouteWithBreadcrumbs = ({ component: Component, breadcrumbs, ...rest }) => {
  return (
    <Route {...rest} render={props => {
        return (
          <Segment basic>
            <Breadcrumb divider='/' sections={breadcrumbs} />
            <Component {...props} />
          </Segment>
        );
      }}
    />
  );
}
