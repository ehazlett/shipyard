import React, { PropTypes, Component } from "react";

import _ from "lodash";

import { Form as FormsyForm } from "formsy-react";
import { Input } from "formsy-semantic-ui-react";
import { Form, Segment } from "semantic-ui-react";

import { updateSpecFromInput } from "../../lib";

class RaftForm extends Component {
  static PropTypes = {
    swarm: PropTypes.object.isRequired
  };

  // When we detect a change, pass the changes to the parent
  onChangeHandler = (e, input) => {
    if (this.props.onChange) {
      this.props.onChange(e, updateSpecFromInput(input, this.props.swarm.Spec));
    }
  };

  render() {
    const { Spec } = this.props.swarm;

    if (!Spec) {
      return <div />;
    }

    return (
      <Segment basic>
        <FormsyForm className="ui form">
          <Form.Field>
            <label>Election Tick</label>
            <Input
              name="Raft.ElectionTick"
              value={_.get(Spec, "Raft.ElectionTick", "")}
              onChange={this.onChangeHandler}
              type="number"
            />
          </Form.Field>
          <Form.Field>
            <label>Heartbeat Tick</label>
            <Input
              name="Raft.HeartbeatTick"
              value={_.get(Spec, "Raft.HeartbeatTick", "")}
              onChange={this.onChangeHandler}
              type="number"
            />
          </Form.Field>
          <Form.Field>
            <label>Snapshot Interval</label>
            <Input
              name="Raft.SnapshotInterval"
              value={_.get(Spec, "Raft.SnapshotInterval", "")}
              onChange={this.onChangeHandler}
              type="number"
            />
          </Form.Field>
          <Form.Field>
            <label>Number of Old Snapshots to Keep</label>
            <Input
              name="Raft.KeepOldSnapshots"
              value={_.get(Spec, "Raft.KeepOldSnapshots", "")}
              onChange={this.onChangeHandler}
              type="number"
            />
          </Form.Field>
          <Form.Field>
            <label>Log Entries for Slow Followers</label>
            <Input
              name="Raft.LogEntriesForSlowFollowers"
              value={_.get(Spec, "Raft.LogEntriesForSlowFollowers", "")}
              onChange={this.onChangeHandler}
              type="number"
            />
          </Form.Field>
        </FormsyForm>
      </Segment>
    );
  }
}

export default RaftForm;
