import React, { PropTypes } from 'react';

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
      <SwarmInitView swarmInit={this.props.swarmInit} />
    );
  }

  renderError(error) {
    return (
      <div className="ui error message">{error}</div>
    );
  }

  renderMainPage() {
    return (
      <div>
        <TopNav {...this.props} />
        <Container>
          {this.props.error ? this.renderError(this.props.error) : null}
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

// Main.propTypes = {
//   swarmInit: PropTypes.func.isRequired,
//   signOut: PropTypes.func.isRequired,
//   error: PropTypes.string,
//   swarm: {
//     initialized: PropTypes.bool.isRequired,
//   },
//   children: PropTypes.object.isRequired,
// };

export default Main;
