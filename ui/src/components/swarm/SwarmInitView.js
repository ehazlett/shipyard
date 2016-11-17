import React, { PropTypes } from 'react';

import { Container, Button } from 'semantic-ui-react';

class SwarmInitView extends React.Component {

  constructor(props) {
    super(props);
    this.swarmInit = this.swarmInit.bind(this);
  }

  swarmInit(e) {
    this.props.swarmInit({
      ListenAddr: '0.0.0.0:2377',
      AdvertiseAddr: this.refs.advertiseAddress.value || null,
      ForceNewCluster: false,
      Spec: {
        Orchestration: {},
        Raft: {},
        Dispatcher: {},
        CAConfig: {}
      }
    });
    e.preventDefault();
  }

  renderMessage(message) {
    return (
			<div className={`ui ${message.level} message`}>
				<i className="close icon" onClick={this.props.resetMessage}></i>
				{message.message}
			</div>
    );
  }

  render() {
    return (
      <Container className="center middle aligned">
        <div className="ui centered grid">
          <div className="ui row">
            <div className="ui eight wide center aligned column">
              <h2 className="ui header" style={{ marginTop: '5em', marginBottom: '1.5em' }}>
                <div className="content">
                  Get Started
                  <div className="sub header">
                    To start using Docker Swarm you will need to initialize your swarm cluster, press the
                    button below to get started now
                  </div>
                </div>
              </h2>
              {this.props.message && this.props.message.message ? this.renderMessage(this.props.message) : null}
            </div>
          </div>
          <div className="ui row">
            <form className="ui eight wide column form">
              <div className="ui field">
                <label>Advertise Address</label>
                <input ref="advertiseAddress" placeholder="Auto-detect" />
              </div>
              <Button className="big fluid green" onClick={this.swarmInit}>Initialize</Button>
            </form>
          </div>
        </div>
      </Container>
    );
  }
}

SwarmInitView.propTypes = {
  swarmInit: PropTypes.func.isRequired,
};

export default SwarmInitView;
