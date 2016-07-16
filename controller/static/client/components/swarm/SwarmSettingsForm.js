import React from 'react';
import _ from 'lodash';

import { Field, Segment, Header } from 'react-semantify';

class SettingsView extends React.Component {
  constructor(props) {
    super(props);

    this.update = this.update.bind(this);
  }

  componentDidMount() {
    this.props.fetchSwarm();
  }

  update(e) {
    const updatedSpec = Object.assign(
      this.props.swarm.info.Spec,
      {
        AcceptancePolicy: {
          Policies: [
            {
              Role: 'worker',
              Autoaccept: this.refs.workerAcceptancePolicy_Role.checked,
              Secret: this.refs.workerAcceptancePolicy_Passphrase.value,
            },
            {
              Role: 'manager',
              Autoaccept: this.refs.managerAcceptancePolicy_Role.checked,
              Secret: this.refs.managerAcceptancePolicy_Passphrase.value,
            },
          ],
        },
      }
    );

    this.props.updateSwarmSettings(updatedSpec, this.props.swarm.info.Version.Index);


    // TODO: Fire event to update swarm state

    e.preventDefault();
  }

  render() {
    // Default acceptance policies, in case they don't exist yet
    let workerAcceptancePolicy = {
      Role: 'worker',
      Autoaccept: false,
      Secret: '',
    };
    let managerAcceptancePolicy = {
      Role: 'manager',
      Autoaccept: false,
      Secret: '',
    };

    const acceptancePolicy = this.props.swarm.info.Spec.AcceptancePolicy;
    if (acceptancePolicy && acceptancePolicy.Policies.length > 0) {
      _.forEach(acceptancePolicy.Policies, function (p) {
        if (p.Role === 'worker') {
          workerAcceptancePolicy = p;
        } else if (p.Role === 'manager') {
          managerAcceptancePolicy = p;
        } else {
          console.debug('Unknown acceptance policy role', p.Role);
        }
      });
    }

    return (
      <form className="ui form" onSubmit={this.update}>

        <Segment className="basic">
          <Header>Worker Acceptance Policy</Header>
          <Field>
            <div className="ui checkbox">
              <input type="checkbox" ref="workerAcceptancePolicy_Role" id="Settings-workerAcceptancePolicy_Role" defaultChecked={workerAcceptancePolicy.Autoaccept} />
              <label htmlFor="Settings-workerAcceptancePolicy_Role">Auto accept workers</label>
            </div>
          </Field>
          <Field>
            <label>Worker Join Passphrase</label>
            <input type="password" ref="workerAcceptancePolicy_Passphrase" id="Settings-workerAcceptancePolicy_Passphrase" defaultValue={workerAcceptancePolicy.Secret} />
          </Field>
        </Segment>

        <Segment className="basic">
          <Header>Manager Acceptance Policy</Header>
          <Field>
            <div className="ui checkbox">
              <input type="checkbox" ref="managerAcceptancePolicy_Role" id="Settings-managerAcceptancePolicy_Role" defaultChecked={managerAcceptancePolicy.Autoaccept} />
              <label htmlFor="Settings-managerAcceptancePolicy_Role">Auto accept managers</label>
            </div>
          </Field>
          <Field>
            <label>Manager Join Passphrase</label>
            <input type="password" ref="managerAcceptancePolicy_Passphrase" id="Settings-managerAcceptancePolicy_Passphrase" defaultValue={managerAcceptancePolicy.Secret} />
          </Field>
        </Segment>

        <Segment className="basic">
          <input type="submit" className="ui blue button" value="Update" />
        </Segment>
      </form>
    );
  }
}

export default SettingsView;
