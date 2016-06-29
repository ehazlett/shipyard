import React from 'react';
import TopNav from './TopNav';
import Modals from './Modals';
import SwarmInitView from '../swarm/SwarmInitView';
import LoginView from '../login/LoginView';

// import EventsWebSocket from '../events/EventsWebSocket';


const Main = React.createClass({

  componentDidMount() {
    // Events WebSocket Disabled
    // const eventsWS = new EventsWebSocket(this.props.newEvent);
  },

  renderMainPage() {
    if (!this.props.swarm.initialized) {
      return (
        <SwarmInitView {...this.props} />
      );
    }

    return (
      <div>
        <TopNav />
        <Modals {...this.props} />
        {React.cloneElement(this.props.children, this.props)}
      </div>
    );
  },

  render() {
    return (
      <div id="Main">
        { !this.props.user.auth_token ? <LoginView {...this.props} /> : this.renderMainPage() }
      </div>
    )
  }
});

export default Main;
