import React from 'react';

import { Container } from 'react-semantify';

import TopNav from './TopNav';
import SwarmInitView from '../swarm/SwarmInitView';
import LoginView from '../login/LoginView';
import { getAuthToken } from '../../services/auth';

// import EventsWebSocket from '../events/EventsWebSocket';


class Main extends React.Component {
  constructor(props) {
    super(props);
    this.renderLoginPage = this.renderLoginPage.bind(this);
    this.renderWelcomePage = this.renderWelcomePage.bind(this);
  }

  componentDidMount() {
    // Events WebSocket Disabled
    // const eventsWS = new EventsWebSocket(this.props.newEvent);
  }

  renderLoginPage() {
    return (
      <LoginView {...this.props} />
    );
  }

  renderWelcomePage() {
    return (
      <SwarmInitView swarmInit={this.props.swarmInit} message={this.props.message} resetMessage={this.props.resetMessage} />
    );
  }

  renderMessage(message) {
    return (
			<div className={`ui ${message.level} message`}>
				<i className="close icon" onClick={this.props.resetMessage}></i>
				{message.message}
			</div>
    );
  }

  renderMainPage() {
    return (
      <div>
        <TopNav {...this.props} />
        <Container>
          {this.props.message && this.props.message.message ? this.renderMessage(this.props.message) : null}
					{React.cloneElement(this.props.children, {...this.props, key: undefined, ref: undefined})}
        </Container>
      </div>
    );
  }

  render() {
    // If the user is not logged in, show the login page
    const token = getAuthToken();
    if (!token) {
      return this.renderLoginPage();
    }

    // If swarm isn't initialized, show the swarm init page
    const { initialized } = this.props.swarm;
    if (initialized === false) {
      return this.renderWelcomePage();
    }

    // Render the view if swarm is initialized and it's not loading
    if(initialized === true) {
      return this.renderMainPage();
    }

    // Show a blank page while waiting to get the swarm details
    return (
      <div></div>
    );
  }
}

export default Main;
