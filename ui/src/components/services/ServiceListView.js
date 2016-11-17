import React from 'react';

import { Segment, Grid, Icon } from 'semantic-ui-react';
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
    this.props.fetchNetworks();
  }

  updateFilter(input) {
    this.refs.table.filterBy(input.target.value);
  }

  renderService(service, summary = {}) {
    return (
      <Tr key={service.ID}>
        <Td column="Tasks" className="collapsing">
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
        <Td column="&nbsp;" className="collapsing">
          <div className="ui simple dropdown">
            <i className="dropdown icon"></i>
            <div className="menu">
              <div className="item" onClick={() => this.props.removeService(service.ID)}>
                <Icon className="red remove" />
                Remove
              </div>
            </div>
          </div>
        </Td>
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
          <Grid.Row>
            <Grid.Column className="six wide">
              <div className="ui fluid icon input">
                <Icon className="search" />
                <input placeholder="Search..." onChange={this.updateFilter}></input>
              </div>
            </Grid.Column>
            <Grid.Column className="right aligned ten wide">
              <Link to="/services/create" className="ui green button">
                <Icon className="add" />
                Create
              </Link>
            </Grid.Column>
          </Grid.Row>
          <Grid.Row>
            <Grid.Column className="sixteen wide">
              <Table
                className="ui compact celled sortable unstackable table"
                ref="table"
                sortable
                filterable={['ID', 'Name', 'Image']}
                hideFilterInput
                noDataText="Couldn't find any services">
                {Object.values(this.props.services.data).map(s => this.renderService(s, taskSummaryByService[s.ID]))}
              </Table>
            </Grid.Column>
          </Grid.Row>
        </Grid>
      </Segment>
    );
  }
}

export default ServiceListView;
