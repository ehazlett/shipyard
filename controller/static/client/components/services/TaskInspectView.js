import React from 'react';

import { Container, Grid, Column, Row, Input, Dropdown, Item, Menu, Button, Icon } from 'react-semantify';
import { Table, Tbody, Tr, Td, Thead, Th } from 'reactable';
import ContainerInspect from '../containers/ContainerInspect';
import { Link } from 'react-router';
import _ from 'lodash';

const TaskInspectView = React.createClass({
  componentDidMount() {
    this.props.fetchContainers();
    this.props.fetchServices();
  },

  render() {
    const {id} = this.props.params;
    const task = _.filter(this.props.tasks, (t) => t.ID === id)[0];
    if(!task) { return (<div></div>) };

    const service = _.filter(this.props.services, (s) => s.ID === task.ServiceID)[0];
    if(!service) { return (<div></div>) };

    const container = _.filter(this.props.containers, (c) => c.Id === task.Status.ContainerStatus.ContainerID)[0];


    return (
			<Container>
        <Grid>
          <Row>
            <Column className="sixteen wide basic ui segment">
              <div className="ui breadcrumb">
                <Link to="/services" className="section">Services</Link>
                <div className="divider"> / </div>
                <Link to={"/services/"+service.ID} className="section">{service.Spec.Name}</Link>
                <div className="divider"> / </div>
                <div className="active section">{service.Spec.Name}.{task.Slot}</div>
              </div>
            </Column>
            <Column className="sixteen wide">
              <ContainerInspect container={container} />
            </Column>
          </Row>
        </Grid>
			</Container>
    );
  }
});

export default TaskInspectView;


