import React from "react";

import { Input, Button, Grid, Checkbox } from "semantic-ui-react";
import { Table, Tr, Td } from "reactable";
import taskStates from "./TaskStates";
import { Link } from "react-router-dom";
import _ from "lodash";

import { listServices, listTasks, removeService } from "../../api";
import { shortenImageName, showError } from "../../lib";

class ServiceListView extends React.Component {
  state = {
    services: [],
    tasks: [],
    loading: true,
    selected: [],
  };

  componentDidMount() {
    this.getServices();
    this.getTasks();
  }

  getServices = () => {
    return listServices()
      .then((services) => {
        this.setState({
          services: services.body,
          loading: false,
        });
      })
      .catch((err) => {
        /* TODO: If something went wrong here, should probably redirect to an error page. */
        showError(err);
        this.setState({
          loading: false,
        });
      });
  }

  getTasks = () => {
    return listTasks()
      .then((tasks) => {
        this.setState({
          tasks: tasks.body,
        });
      })
      .catch((err) => {
        /* TODO: If something went wrong here, should probably redirect to an error page. */
        showError(err);
      });
  }

  removeSelected = () => {
    let promises = _.map(this.state.selected, removeService);

    this.setState({
      selected: []
    });

    Promise.all(promises)
      .then(() => {
        this.getServices();
        this.getTasks();
      })
      .catch((err) => {
        showError(err);
        this.getServices();
        this.getTasks();
      });
  }

  selectItem = (id) => {
    let i = this.state.selected.indexOf(id);
    if (i > -1) {
      this.setState({
        selected: this.state.selected.slice(i+1, 1)
      });
    } else {
      this.setState({
        selected: [...this.state.selected, id]
      });
    }
  }

  updateFilter = (input) => {
    this.refs.table.filterBy(input.target.value);
  }

  renderService(service, summary = {}) {
    let selected = this.state.selected.indexOf(service.ID) > -1;
    return (
      <Tr className={selected ? "active" : ""} key={service.ID}>
        <Td column="" className="collapsing">
          <Checkbox checked={selected} onChange={() => { this.selectItem(service.ID) }} />
        </Td>
        <Td column="Tasks" className="collapsing" value={summary.green ? summary.green : "0"}>
          <div>
            {(summary.green ? summary.green : "0")}
            {(service.Spec.Mode.Replicated ? ` / ${service.Spec.Mode.Replicated.Replicas}` : "")}
          </div>
        </Td>
        <Td column="ID" className="collapsing" value={service.ID}>
          <Link to={`/services/inspect/${service.ID}`}>{service.ID.substring(0, 12)}</Link>
        </Td>
        <Td column="Name">{service.Spec.Name}</Td>
        <Td column="Image">{shortenImageName(service.Spec.TaskTemplate.ContainerSpec.Image)}</Td>
      </Tr>
    );
  }

  render() {
    const { loading, services, tasks, selected } = this.state;

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
      <Grid padded>
        <Grid.Row>
          <Grid.Column width={6}>
            <Input fluid icon="search" placeholder="Search..." onChange={this.updateFilter} />
          </Grid.Column>
          <Grid.Column width={10} textAlign="right">
            { _.isEmpty(selected) ?
              <Button as={Link} to="/services/create" color="green" icon="add" content="Create" /> :
              <span>
                <b>{selected.length} Services Selected: </b>
                <Button color="red" onClick={this.removeSelected} content="Remove" />
              </span>
            }
          </Grid.Column>
        </Grid.Row>
        <Grid.Row>
          <Grid.Column width={16}>
            <Table
              className="ui compact celled unstackable table"
              ref="table"
              sortable={["Tasks", "ID", "Name", "Image"]}
              defaultSort={{column: 'Name', direction: 'asc'}}
              filterable={["ID", "Name", "Image"]}
              hideFilterInput
              noDataText="Couldn't find any services">
              {Object.keys(services).map(key => this.renderService(services[key], taskSummaryByService[services[key].ID]))}
            </Table>
          </Grid.Column>
        </Grid.Row>
      </Grid>
    );
  }
}

export default ServiceListView;
