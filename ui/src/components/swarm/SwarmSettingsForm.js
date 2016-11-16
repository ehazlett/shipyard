import React from 'react';

import { Field, Segment, Header } from 'react-semantify';

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
      <form className="ui form">
        <Segment className="basic">
          <Header>Join Tokens</Header>
          <Field>
            <label>Worker</label>
            <input value={this.props.swarm.info.JoinTokens.Worker} readOnly />
          </Field>
          <Field>
            <label>Manager</label>
            <input value={this.props.swarm.info.JoinTokens.Manager} readOnly />
          </Field>
          <button className="ui blue button" onClick={this.refreshJoinTokens}>Refresh Join Tokens</button>
        </Segment>
      </form>
    );
  }
}

export default SettingsView;
