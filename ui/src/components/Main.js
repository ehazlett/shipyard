import React from "react";

import { Redirect, Route } from "react-router-dom";
import { Loader, Dimmer } from "semantic-ui-react";

import Navigation from "./layout/Navigation";
import WelcomeView from "./WelcomeView";

import ServicesView from "./services/ServicesView";
import ContainersView from "./containers/ContainersView";
import ImagesView from "./images/ImagesView";
import NodesView from "./nodes/NodesView";
import NetworksView from "./networks/NetworksView";
import VolumesView from "./volumes/VolumesView";
import SecretsView from "./secrets/SecretsView";

import AccountsView from "./accounts/AccountsView";
import RegistriesView from "./registries/RegistriesView";
import SettingsView from "./settings/SettingsView";
import AboutView from "./about/AboutView";

import { getSwarm } from "../api";
import { removeAuthToken } from "../services/auth";
import "./Main.css";

class Main extends React.Component {
  state = {
    redirect: false,
    redirectTo: null,
    loading: true
  };

  componentDidMount() {
    getSwarm()
      .then(swarm => {
        this.setState({
          loading: false
        });
      })
      .catch(error => {
        // Check if our token is valid
        if (error.response && error.response.status === 401) {
          this.signOut();
        } else if (error.response && error.response.status === 503) {
          // If we get a 406, a cluster isn't initialized
          this.welcome();
        }

        this.setState({
          loading: false
        });
      });
  }

  redirect = to => {
    this.setState({
      redirect: true,
      redirectTo: to
    });
  };

  welcome = () => {
    this.setState({
      redirect: true,
      redirectTo: "/welcome"
    });
  };

  signOut = () => {
    removeAuthToken();
    this.setState({
      redirect: true,
      redirectTo: "/login"
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
    if (loading) {
      return this.renderLoader();
    }

    return (
      <div id="Main">
        <Route path="/welcome" component={WelcomeView} />

        {location.pathname !== "/welcome" &&
          <Navigation
            signOut={this.signOut}
            username={"admin"}
            location={location}
          />}

        <div className="ContentPane">
          {/* Default route for authorized user is the service list view */}
          <Route exact path="/" render={() => <Redirect to="/services" />} />

          <Route path="/services" component={ServicesView} />
          <Route path="/containers" component={ContainersView} />
          <Route path="/images" component={ImagesView} />
          <Route path="/nodes" component={NodesView} />
          <Route path="/networks" component={NetworksView} />
          <Route path="/volumes" component={VolumesView} />
          <Route path="/secrets" component={SecretsView} />

          <Route path="/accounts" component={AccountsView} />
          <Route path="/registries" component={RegistriesView} />
          <Route
            path="/settings"
            component={SettingsView}
            location={location}
          />
          <Route path="/about" component={AboutView} />
        </div>
        {redirect && <Redirect to={redirectTo} />}
      </div>
    );
  }
}

export default Main;
