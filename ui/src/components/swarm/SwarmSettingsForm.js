import React from 'react';

import { Form, Segment, Header } from 'semantic-ui-react';

class SettingsView extends React.Component {
  constructor(props) {
    super(props);
    this.refreshJoinTokens = this.refreshJoinTokens.bind(this);
  }

  componentDidMount() {
    this.props.fetchSwarm();
  }

  refreshJoinTokens(e) {
    const rotateManagerToken = true;
    const rotateWorkerToken = true;
    this.props.updateSwarmSettings(this.props.swarm.info.Spec, this.props.swarm.info.Version.Index, rotateManagerToken, rotateWorkerToken);
    e.preventDefault();
  }

  render() {
    return (
      <Form>
        <Segment className="basic">
          <Header>Join Tokens</Header>
          <Form.Field>
            <label>Worker</label>
            <input value={this.props.swarm.info.JoinTokens.Worker} readOnly />
          </Form.Field>
          <Form.Field>
            <label>Manager</label>
            <input value={this.props.swarm.info.JoinTokens.Manager} readOnly />
          </Form.Field>
          <button className="ui blue button" onClick={this.refreshJoinTokens}>Refresh Join Tokens</button>
        </Segment>
      </Form>
    );
  }
}

export default SettingsView;
