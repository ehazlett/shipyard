import React from 'react';

import { Segment, Grid, Column, Row } from 'react-semantify';
import ContainerInspect from '../containers/ContainerInspect';
import { Link } from 'react-router';
import _ from 'lodash';

class TaskInspectView extends React.Component {
  componentDidMount() {
    this.props.fetchContainers();
    this.props.fetchServices();
  }

  render() {
    const { id } = this.props.params;

    const task = this.props.tasks.data[id];

    // FIXME: Hack for broken refential integrity
    if (!task) { return (<div></div>); }

    const service = this.props.services.data[task.ServiceID];

    // FIXME: Hack for broken refential integrity
    if (!service) { return (<div></div>); }

    const container = this.props.containers.data[task.Status.ContainerStatus.ContainerID];

    return (
      <Segment className={`basic ${this.props.containers.loading || this.props.tasks.loading || this.props.services.loading || this.props.nodes.loading ? 'loading' : ''}`}>
        <Grid>
          <Row>
            <Column className="sixteen wide basic ui segment">
              <div className="ui breadcrumb">
                <Link to="/services" className="section">Services</Link>
                <div className="divider"> / </div>
                <Link to={`/services/${service.ID}`} className="section">{service.Spec.Name}</Link>
                <div className="divider"> / </div>
                <div className="active section">{service.Spec.Name}.{task.Slot}</div>
              </div>
            </Column>
            <Column className="sixteen wide">
              <ContainerInspect container={container} />
            </Column>
          </Row>
        </Grid>
      </Segment>
    );
  }
}

export default TaskInspectView;

