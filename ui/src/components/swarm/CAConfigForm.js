import React, { PropTypes, Component } from "react";

import _ from "lodash";

import { Form as FormsyForm } from "formsy-react";
import { Input } from "formsy-semantic-ui-react";
import { Form, Segment } from "semantic-ui-react";

import { updateSpecFromInput } from "../../lib";

export default class CAConfigForm extends Component {
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
            <label>Node Certificate Expiration Time (seconds)</label>
            <Input
              name="CAConfig.NodeCertExpiry"
              value={_.get(Spec, "CAConfig.NodeCertExpiry", "")}
              onChange={this.onChangeHandler}
              type="number"
            />
          </Form.Field>
          {/* TODO: ExternalCAs configuration */}
        </FormsyForm>
      </Segment>
    );
  }
}
