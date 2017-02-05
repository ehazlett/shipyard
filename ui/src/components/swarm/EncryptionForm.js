import React, { PropTypes, Component } from 'react';

import _ from 'lodash';

import { Form as FormsyForm } from 'formsy-react';
import { Checkbox } from 'formsy-semantic-ui-react';
import { Form, Segment } from 'semantic-ui-react';

import { updateSpecFromInput } from '../../lib';

class EncryptionForm extends Component {

  static PropTypes = {
    swarm: PropTypes.object.isRequired,
  };

  // When we detect a change, pass the changes to the parent
  onChangeHandler = (e, input) => {
    if(this.props.onChange) {
      this.props.onChange(e, updateSpecFromInput(input, this.props.swarm.Spec));
    }
  }

  render() {
    const { Spec } = this.props.swarm;

    if(!Spec) {
      return <div></div>;
    }

    return (
      <Segment basic>
        <FormsyForm className="ui form">
          <Form.Field>
            <Checkbox label="Node Certificate Expiration Time (seconds)" name="EncryptionConfig.AutoLockManagers" checked={_.get(Spec, "EncryptionConfig.AutoLockManagers", false)} onChange={this.onChangeHandler} />
          </Form.Field>
        </FormsyForm>
      </Segment>
    );
  }
}

export default EncryptionForm;
