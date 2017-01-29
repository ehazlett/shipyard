import React from "react";

import { Redirect, Match } from "react-router";
import { Loader, Dimmer } from "semantic-ui-react";

import Navigation from "./layout/Navigation";

import WelcomeView from "./WelcomeView";
import ServiceListView from "./services/ServiceListView";
import CreateServiceView from "./services/CreateServiceView";
import ServiceInspectView from "./services/ServiceInspectView";
import ServiceInspectTaskView from "./services/ServiceInspectTaskView";
import ContainerListView from "./containers/ContainerListView";
import ContainerInspectView from "./containers/ContainerInspectView";
import NodeListView from "./nodes/NodeListView";
import NodeInspectView from "./nodes/NodeInspectView";
import ImageListView from "./images/ImageListView";
import ImageInspectView from "./images/ImageInspectView";
import NetworkInspectView from "./networks/NetworkInspectView";
import NetworkListView from "./networks/NetworkListView";
import VolumeListView from "./volumes/VolumeListView";
import VolumeInspectView from "./volumes/VolumeInspectView";
import CreateVolumeView from "./volumes/CreateVolumeView";
import AccountListView from "./accounts/AccountListView";
import AccountInspectView from "./accounts/AccountInspectView";
import SettingsView from "./settings/SettingsView";
import AddRegistryView from "./registries/AddRegistryView";
import RegistryListView from "./registries/RegistryListView";
import RegistryInspectView from "./registries/RegistryInspectView";
import SecretListView from "./secrets/SecretListView";
import SecretInspectView from "./secrets/SecretInspectView";
import AboutView from "./about/AboutView";

import { getSwarm } from "../api";
import { removeAuthToken } from "../services/auth";
import './Main.css';

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
      redirectTo: "/welcome",
    });
  };

  signOut = () => {
    removeAuthToken();
    this.setState({
      redirect: true,
      redirectTo: "/login",
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
      <div id="Main">
        <Match pattern="/welcome" component={WelcomeView} />

        {location.pathname !== "/welcome" && (<Navigation signOut={this.signOut} username={"admin"} location={location} />)}

        <div className="ContentPane">
          {/* Default route for authorized user is the service list view */}
          <Match exactly pattern="/" render={() => <Redirect to="/services" />} />


          <Match exactly pattern="/accounts" component={AccountListView} />
          <Match exactly pattern="/accounts/inspect/:id" component={AccountInspectView} />
          <Match exactly pattern="/images" component={ImageListView} />
          <Match exactly pattern="/images/inspect/:id" component={ImageInspectView} />
          <Match exactly pattern="/containers" component={ContainerListView} />
          <Match exactly pattern="/containers/inspect/:id" component={ContainerInspectView} />
          <Match exactly pattern="/networks" component={NetworkListView} />
          <Match exactly pattern="/networks/inspect/:id" component={NetworkInspectView} />
          <Match exactly pattern="/nodes" component={NodeListView} />
          <Match exactly pattern="/nodes/inspect/:id" component={NodeInspectView} />
          <Match exactly pattern="/registries" component={RegistryListView} />
          <Match exactly pattern="/registries/inspect/:id" component={RegistryInspectView} />
          <Match exactly pattern="/registries/add" component={AddRegistryView} />
          <Match exactly pattern="/secrets" component={SecretListView} />
          <Match exactly pattern="/secrets/inspect/:id" component={SecretInspectView} />
          <Match exactly pattern="/services" component={ServiceListView} />
          <Match exactly pattern="/services/create" component={CreateServiceView} />
          <Match exactly pattern="/services/inspect/:id" component={ServiceInspectView} />
          <Match exactly pattern="/services/inspect/:serviceId/container/:id" component={ServiceInspectTaskView} />
          <Match exactly pattern="/settings" component={SettingsView} />
          <Match exactly pattern="/volumes" component={VolumeListView} />
          <Match exactly pattern="/volumes/inspect/:name" component={VolumeInspectView} />
          <Match exactly pattern="/volumes/create" component={CreateVolumeView} />
          <Match exactly pattern="/about" component={AboutView} />
        </div>
        {redirect && <Redirect to={redirectTo}/>}
      </div>
    );
  }
}

export default Main;
