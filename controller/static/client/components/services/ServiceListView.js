import React, { PropTypes } from 'react';

import { Segment, Grid, Column, Row, Icon } from 'react-semantify';
import { Table, Tr, Td } from 'reactable';
import taskStates from './TaskStates';
import { Link } from 'react-router';
import _ from 'lodash';

class ServiceListView extends React.Component {
  constructor(props) {
    super(props);
    this.updateFilter = this.updateFilter.bind(this);
  }

  componentDidMount() {
    this.props.fetchServices();
  }

  updateFilter(input) {
    this.refs.table.filterBy(input.target.value);
  }

  renderService(service, summary = {}) {
    return (
      <Tr key={service.ID}>
        <Td column="" className="collapsing">
          <div>
            {(summary.green ? summary.green : '0')}
            {(service.Spec.Mode.Replicated ? ` / ${service.Spec.Mode.Replicated.Replicas}` : '')}
          </div>
        </Td>
        <Td column="ID" className="collapsing">
          <Link to={`/services/${service.ID}`}>{service.ID.substring(0, 12)}</Link>
        </Td>
        <Td column="Name">{service.Spec.Name}</Td>
        <Td column="Image">{service.Spec.TaskTemplate.ContainerSpec.Image}</Td>
        <Td column="Tasks" className="collapsing">
          <div className="ui circular labels">
            {Object.keys(summary).map((k) => (
              <span className={`ui label ${k}`} key={k}>{summary[k]}</span>
              ))}
          </div>
        </Td>
        <Td column="Command"><pre>{service.Spec.TaskTemplate.ContainerSpec.Command ? service.Spec.TaskTemplate.ContainerSpec.Command.join(' ') : ''} {service.Spec.TaskTemplate.ContainerSpec.Args ? service.Spec.TaskTemplate.ContainerSpec.Args.join(' ') : ''}</pre></Td>
      </Tr>
    );
  }

  render() {
    const tasksByService = {};
    _.forEach(this.props.tasks.data, function (task) {
      if (!tasksByService[task.ServiceID]) {
        tasksByService[task.ServiceID] = [];
      }
      tasksByService[task.ServiceID].push(task);
    });

    const taskSummaryByService = {};
    _.forEach(tasksByService, function (v, k) {
      taskSummaryByService[k] = _.countBy(v, function (task) {
        return taskStates(task.Status.State);
      });
    });

    return (
      <Segment className={`basic ${this.props.services.loading ? 'loading' : ''}`}>
        <Grid>
          <Row>
            <Column className="six wide">
              <div className="ui fluid icon input">
                <Icon className="search" />
                <input placeholder="Search..." onChange={this.updateFilter}></input>
              </div>
            </Column>
            <Column className="right aligned ten wide">
              <Link to="/services/create" className="ui green button">
                <Icon className="add" />
                Create
              </Link>
            </Column>
          </Row>
          <Row>
            <Column className="sixteen wide">
              <Table
                className="ui compact celled sortable unstackable table"
                ref="table"
                sortable
                filterable={['ID', 'Name', 'Image', 'Command']}
                hideFilterInput
                noDataText="Couldn't find any services">
                { this.props.services.data.map(s => this.renderService(s, taskSummaryByService[s.ID])) }
              </Table>
            </Column>
          </Row>
        </Grid>
      </Segment>
    );
  }
}

// ServiceListView.propTypes = {
//   fetchServices: PropTypes.func.isRequired,
//   services: PropTypes.array.isRequired,
//   tasks: PropTypes.array.isRequired,
// };

export default ServiceListView;
