import React from 'react';
import _ from 'lodash';

import { Checkbox, Field, Segment, Header, Button } from 'react-semantify';

class SettingsView extends React.Component {
  constructor(props) {
    super(props);

    this.update = this.update.bind(this);
  }

  componentDidMount() {
    this.props.fetchSwarm();
  }

  update(e) {
    console.debug('Worker Auto-Accept', this.refs.workerAcceptancePolicy_Role);

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
    if(acceptancePolicy && acceptancePolicy.Policies.length > 0) {
      _.forEach(acceptancePolicy.Policies, function(p) {
        if(p.Role === 'worker') {
          workerAcceptancePolicy = p;
        } else if(p.Role === 'manager') {
          managerAcceptancePolicy = p;
        } else {
          console.debug('Unknown acceptance policy role', p.Role);
        }
      })
    }

    return (
      <Segment className="basic">
        <Header>Acceptance Policy</Header>
        <form className="ui form" onSubmit={this.update}>
          <Field>
            <div className="ui checkbox">
              <input type="checkbox" ref="workerAcceptancePolicy_Role" id="Settings-workerAcceptancePolicy_Role" defaultChecked={workerAcceptancePolicy.Autoaccept} />
              <label htmlFor="Settings-workerAcceptancePolicy_Role">Auto-accept workers</label>
            </div>
          </Field>
          <input type="submit" className="ui blue button" value="Update"/>
        </form>
      </Segment>
    );
  }
}

export default SettingsView;
