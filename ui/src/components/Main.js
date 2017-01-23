import React from 'react';

import { Redirect, Match } from 'react-router';
import { Container } from 'semantic-ui-react';

import TopNav from './layout/TopNav';

import WelcomeView from './WelcomeView';
import ServiceListView from './services/ServiceListView';
import CreateServiceView from './services/CreateServiceView';
import ServiceInspectView from './services/ServiceInspectView';
import ContainerListView from './containers/ContainerListView';
import ContainerInspectView from './containers/ContainerInspectView';
import NodeListView from './nodes/NodeListView';
import NodeInspectView from './nodes/NodeInspectView';
import ImageListView from './images/ImageListView';
import NetworkInspectView from './networks/NetworkInspectView';
import NetworkListView from './networks/NetworkListView';
import VolumeListView from './volumes/VolumeListView';
import VolumeInspectView from './volumes/VolumeInspectView';
import CreateVolumeView from './volumes/CreateVolumeView';
import AccountListView from './accounts/AccountListView';
import SettingsView from './settings/SettingsView';

import { getSwarm } from '../api';

import { removeAuthToken } from '../services/auth';

class Main extends React.Component {
  state = {
    redirect: false,
    redirectTo: null,
    loading: true,
  };

  componentDidMount() {
    getSwarm()
      .then((swarm) => {
        this.setState({
          loading: false,
        });
      })
      .catch((error) => {
        // Check if our token is valid
        if(error.response.status === 401) {
          this.signOut();
        }
        // If we get a 406, a cluster isn't initialized
        else if(error.response.status === 503) {
          this.welcome();
        }
      });
  }

  redirect = (to) => {
    this.setState({
      redirect: true,
      redirectTo: to,
    });
  }

  welcome = () => {
    this.setState({
      redirect: true,
      redirectTo: '/welcome',
    });
  };

  signOut = () => {
    removeAuthToken();
    this.setState({
      redirect: true,
      redirectTo: '/login',
    });
  };

  render() {
    const { redirect, redirectTo } = this.state;
    const { location } = this.props;
    return (
      <div>
        <Match pattern="/welcome" component={WelcomeView} />
        {location.pathname !== '/welcome' && (<TopNav signOut={this.signOut} username={'admin'} location={location} />)}
        <Container>
          <Match exactly pattern="/" render={() => <Redirect to="/services" />} />
          <Match exactly pattern="/services" component={ServiceListView} />
          <Match exactly pattern="/services/create" component={CreateServiceView} />
          <Match exactly pattern="/services/inspect/:id" component={ServiceInspectView} />
          <Match exactly pattern="/nodes" component={NodeListView} />
          <Match exactly pattern="/nodes/:id" component={NodeInspectView} />
          <Match exactly pattern="/networks" component={NetworkListView} />
          <Match exactly pattern="/networks/:id" component={NetworkInspectView} />
          <Match exactly pattern="/volumes" component={VolumeListView} />
          <Match exactly pattern="/volumes/:name" component={VolumeInspectView} />
          <Match exactly pattern="/volumes/create" component={CreateVolumeView} />
          <Match exactly pattern="/settings" component={SettingsView} />
          <Match exactly pattern="/containers" component={ContainerListView} />
          <Match exactly pattern="/containers/:id" component={ContainerInspectView} />
          <Match exactly pattern="/accounts" component={AccountListView} />
          <Match exactly pattern="/images" component={ImageListView} />
        </Container>
        {redirect && <Redirect to={redirectTo}/>}
      </div>
    );
  }
}

export default Main;
