import React from 'react';
import { Match, Redirect } from 'react-router';
import { Breadcrumb, Segment } from 'semantic-ui-react'

import { getAuthToken } from '../services/auth';

export const MatchWhenAuthorized = ({ component: Component, user, ...rest }) => {
  return (
    <Match {...rest} render={props => (
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
export const MatchWithBreadcrumbs = ({ component: Component, breadcrumbs, ...rest }) => {
  return (
    <Match {...rest} render={props => {
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
