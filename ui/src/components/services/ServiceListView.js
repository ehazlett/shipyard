import React from 'react';

import { Message, Segment, Grid, Icon } from 'semantic-ui-react';
import { Table, Tr, Td } from 'reactable';
import taskStates from './TaskStates';
import { Link } from 'react-router';
import _ from 'lodash';

import { listServices, listTasks } from '../../api';

class ServiceListView extends React.Component {
  state = {
    services: [],
    tasks: [],
    loading: true,
    error: null
  };

  componentDidMount() {
    listServices()
      .then((services) => {
        this.setState({
          error: null,
          services: services.body,
          loading: false,
        });
      })
      .catch((error) => {
        this.setState({
          error,
          loading: false,
        });
      });

    listTasks()
      .then((tasks) => {
        this.setState({
          error: null,
          tasks: tasks.body,
        });
      })
      .catch((error) => {
        this.setState({
          error,
        });
      });
  }

  updateFilter = (input) => {
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
					<Link to={`/services/inspect/${service.ID}`}>{service.ID.substring(0, 12)}</Link>
        </Td>
        <Td column="Name">{service.Spec.Name}</Td>
        <Td column="Image">{service.Spec.TaskTemplate.ContainerSpec.Image}</Td>
      </Tr>
    );
  }

  render() {
    const { loading, error, services, tasks } = this.state;

    const tasksByService = {};
    _.forEach(tasks, function (task) {
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

    if(loading) {
      return <div></div>;
    }

    return (
      <Segment basic>
        <Grid>
          <Grid.Row>
            <Grid.Column width={6}>
              <div className="ui fluid icon input">
                <Icon className="search" />
                <input placeholder="Search..." onChange={this.updateFilter}></input>
              </div>
            </Grid.Column>
            <Grid.Column width={10} textAlign="right">
              <Link to="/services/create" className="ui green button">
                <Icon className="add" />
                Create
              </Link>
            </Grid.Column>
          </Grid.Row>
          <Grid.Row>
            <Grid.Column className="sixteen wide">
              {error && (<Message error>{error}</Message>)}
              <Table
                className="ui compact celled sortable unstackable table"
                ref="table"
                sortable
                filterable={['ID', 'Name', 'Image']}
                hideFilterInput
                noDataText="Couldn't find any services">
                {Object.values(services).map(s => this.renderService(s, taskSummaryByService[s.ID]))}
              </Table>
            </Grid.Column>
          </Grid.Row>
        </Grid>
      </Segment>
    );
  }
}

export default ServiceListView;
