import React from 'react';
import TopNav from './TopNav';
import Modals from './Modals';
import SwarmInitView from '../swarm/SwarmInitView';
import LoginView from '../login/LoginView';
import { getAuthToken } from '../../services/auth';

// import EventsWebSocket from '../events/EventsWebSocket';


const Main = React.createClass({

  componentDidMount() {
    // Events WebSocket Disabled
    // const eventsWS = new EventsWebSocket(this.props.newEvent);
  },

  renderLoginPage() {
    return (
      <LoginView {...this.props} />
    );
  },

  renderWelcomePage() {
    return (
      <SwarmInitView {...this.props} />
    );
  },

  renderMainPage() {
    return (
      <div>
        <TopNav {...this.props} />
        <Modals {...this.props} />
        {React.cloneElement(this.props.children, this.props)}
      </div>
    );
  },

  render() {
    const token = getAuthToken();
    if (!token) {
      return this.renderLoginPage();
    }

    const { initialized } = this.props.swarm;
    if (!initialized) {
      return this.renderWelcomePage();
    }

    return this.renderMainPage();
  },
});

export default Main;
