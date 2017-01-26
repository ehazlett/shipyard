import React from 'react';

import { Redirect, Match } from 'react-router';
import { Container, Loader, Dimmer } from 'semantic-ui-react';

import Navigation from './layout/Navigation';

import WelcomeView from './WelcomeView';
import ServiceListView from './services/ServiceListView';
import CreateServiceView from './services/CreateServiceView';
import ServiceInspectView from './services/ServiceInspectView';
import ContainerListView from './containers/ContainerListView';
import ContainerInspectView from './containers/ContainerInspectView';
import NodeListView from './nodes/NodeListView';
import NodeInspectView from './nodes/NodeInspectView';
import ImageListView from './images/ImageListView';
import ImageInspectView from './images/ImageInspectView';
import NetworkInspectView from './networks/NetworkInspectView';
import NetworkListView from './networks/NetworkListView';
import VolumeListView from './volumes/VolumeListView';
import VolumeInspectView from './volumes/VolumeInspectView';
import CreateVolumeView from './volumes/CreateVolumeView';
import AccountListView from './accounts/AccountListView';
import AccountInspectView from './accounts/AccountInspectView';
import SettingsView from './settings/SettingsView';
import AddRegistryView from './registries/AddRegistryView';
import RegistryListView from './registries/RegistryListView';
import RegistryInspectView from './registries/RegistryInspectView';
import SecretListView from './secrets/SecretListView';
import SecretInspectView from './secrets/SecretInspectView';

import { getSwarm } from '../api';
import { removeAuthToken } from '../services/auth';
import { MatchWhenAuthorized } from './RouteMatchers';

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
        if(error.response && error.response.status === 401) {
          this.signOut();
        }
        // If we get a 406, a cluster isn't initialized
        else if(error.response && error.response.status === 503) {
          this.welcome();
        }

        this.setState({
          loading: false,
        });
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

  renderLoader = () => {
    return (
      <Dimmer inverted active>
        <Loader />
      </Dimmer>
    );
  };

  render() {
    const { redirect, redirectTo, loading } = this.state;
    const { location } = this.props;

    // Until we have a response from swarm, show a loading screen
    if(loading) {
      return this.renderLoader();
    }

    return (
      <div>
        <MatchWhenAuthorized pattern="/welcome" component={WelcomeView} />
        {location.pathname !== '/welcome' && (<Navigation signOut={this.signOut} username={'admin'} location={location} />)}
        <div style={{marginLeft: "230px", minWidth: "570px", maxWidth: "1150px",}}>
          <Container>
            {/* Default route for authorized user is the service list view */}
            <Match exactly pattern="/" render={() => <Redirect to="/services" />} />

            <MatchWhenAuthorized exactly pattern="/accounts" component={AccountListView} />
            <MatchWhenAuthorized exactly pattern="/accounts/inspect/:id" component={AccountInspectView} />
            <MatchWhenAuthorized exactly pattern="/containers" component={ContainerListView} />
            <MatchWhenAuthorized exactly pattern="/containers/inspect/:id" component={ContainerInspectView} />
            <MatchWhenAuthorized exactly pattern="/images" component={ImageListView} />
            <MatchWhenAuthorized exactly pattern="/images/inspect/:id" component={ImageInspectView} />
            <MatchWhenAuthorized exactly pattern="/networks" component={NetworkListView} />
            <MatchWhenAuthorized exactly pattern="/networks/inspect/:id" component={NetworkInspectView} />
            <MatchWhenAuthorized exactly pattern="/nodes" component={NodeListView} />
            <MatchWhenAuthorized exactly pattern="/nodes/inspect/:id" component={NodeInspectView} />
            <MatchWhenAuthorized exactly pattern="/registries" component={RegistryListView} />
            <MatchWhenAuthorized exactly pattern="/registries/inspect/:id" component={RegistryInspectView} />
            <MatchWhenAuthorized exactly pattern="/registries/add" component={AddRegistryView} />
            <MatchWhenAuthorized exactly pattern="/secrets" component={SecretListView} />
            <MatchWhenAuthorized exactly pattern="/secrets/inspect/:id" component={SecretInspectView} />
            <MatchWhenAuthorized exactly pattern="/services" component={ServiceListView} />
            <MatchWhenAuthorized exactly pattern="/services/create" component={CreateServiceView} />
            <MatchWhenAuthorized exactly pattern="/services/inspect/:id" component={ServiceInspectView} />
            <MatchWhenAuthorized exactly pattern="/services/inspect/:serviceId/container/:id" component={ContainerInspectView} />
            <MatchWhenAuthorized exactly pattern="/settings" component={SettingsView} />
            <MatchWhenAuthorized exactly pattern="/volumes" component={VolumeListView} />
            <MatchWhenAuthorized exactly pattern="/volumes/inspect/:name" component={VolumeInspectView} />
            <MatchWhenAuthorized exactly pattern="/volumes/create" component={CreateVolumeView} />
          </Container>
        </div>
        {redirect && <Redirect to={redirectTo}/>}
      </div>
    );
  }
}

export default Main;
