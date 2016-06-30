import React from 'react';

import { Container, Grid, Column, Row, Input, Dropdown, Item, Menu, Button, Icon } from 'react-semantify';
import { Table, Tbody, Tr, Td, Thead, Th } from 'reactable';
import TaskStates from './TaskStates';
import { Link } from 'react-router';
import _ from 'lodash';

const ServiceListView = React.createClass({
  componentDidMount() {
    this.props.fetchServices();
  },

  updateFilter(input) {
    this.refs.table.filterBy(input.target.value);
  },

	                    renderService(service, summary = {}) {
		                    return (
			<Tr key={service.ID}>
        <Td column="" className="collapsing">
          <div>
            {(summary.green ? summary.green : '0')}
            {(service.Spec.Mode.Replicated ? ' / ' + service.Spec.Mode.Replicated.Replicas : '')}
          </div>
        </Td>
        <Td column="ID" className="collapsing"><Link to={'/services/' + service.ID}>{service.ID.substring(0, 12)}</Link></Td>
				<Td column="Name">{service.Spec.Name}</Td>
				<Td column="Image">{service.Spec.TaskTemplate.ContainerSpec.Image}</Td>
        <Td column="Tasks" className="collapsing">
          <div className="ui circular labels">
            {Object.keys(summary).map((k) => (<span className={'ui label ' + k} key={k}>{summary[k]}</span>))}
          </div>
        </Td>
        <Td column="Command"><pre>{service.Spec.TaskTemplate.ContainerSpec.Args ? service.Spec.TaskTemplate.ContainerSpec.Args.join(' ') : ''}</pre></Td>
			</Tr>
		);
	},

  render() {
    const tasksByService = {};
    _.forEach(this.props.tasks, function (task) {
      if (!tasksByService[task.ServiceID]) {
        tasksByService[task.ServiceID] = [];
      }
      tasksByService[task.ServiceID].push(task);
    });

    const taskSummaryByService = {};
    _.forEach(tasksByService, function (v, k) {
      taskSummaryByService[k] = _.countBy(v, function (task) {
        return TaskStates(task.Status.State);
      });
    });

    return (
			<Container>
        <Grid>
          <Row>
            <Column className="six wide">
              <div className="ui fluid icon input">
                <Icon className="search" />
                <input placeholder="Search..." onChange={this.updateFilter}></input>
              </div>
            </Column>
            <Column className="right aligned ten wide">
              <Button className="green" onClick={this.props.showCreateServiceModal}>
                <Icon className="add" />
                Create
              </Button>
            </Column>
          </Row>
          <Row>
            <Column className="sixteen wide">
              <Table
                className="ui compact celled sortable table"
                ref="table"
                sortable
                filterable={['ID', 'Name', 'Image', 'Command']}
                hideFilterInput
                noDataText="Couldn't find any services"
              >
                {this.props.services ? this.props.services.map(s => this.renderService(s, taskSummaryByService[s.ID])) : []}
              </Table>
            </Column>
          </Row>
        </Grid>
			</Container>
    );
  },
});

export default ServiceListView;
