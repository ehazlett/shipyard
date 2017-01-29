import React from "react";

import { Input, Button, Message, Grid, Checkbox } from "semantic-ui-react";
import { Table, Tr, Td } from "reactable";
import taskStates from "./TaskStates";
import { Link } from "react-router";
import _ from "lodash";

import { listServices, listTasks, removeService } from "../../api";
import { shortenImageName } from "../../lib";

class ServiceListView extends React.Component {
  state = {
    services: [],
    tasks: [],
    loading: true,
    error: null,
    selected: [],
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

  removeSelected = () => {
    let promises = _.map(this.state.selected, removeService);

    this.setState({
      selected: []
    });

    Promise.all(promises)
      .then(() => {
        // FIXME: trigger a refresh without calling componentDidMount
        this.componentDidMount();
      })
      .catch((err) => {
        this.setState({
          error: err,
        });

        // FIXME: trigger a refresh without calling componentDidMount
        this.componentDidMount();
      });
  }

  updateFilter = (input) => {
    this.refs.table.filterBy(input.target.value);
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

  renderService(service, summary = {}) {
    let selected = this.state.selected.indexOf(service.ID) > -1;
    return (
      <Tr className={selected ? "active" : ""} key={service.ID}>
        <Td column="" className="collapsing">
          <Checkbox checked={selected} onChange={() => { this.selectItem(service.ID) }} />
        </Td>
        <Td column="Tasks" className="collapsing">
          <div>
            {(summary.green ? summary.green : "0")}
            {(service.Spec.Mode.Replicated ? ` / ${service.Spec.Mode.Replicated.Replicas}` : "")}
          </div>
        </Td>
        <Td column="ID" className="collapsing">
          <Link to={`/services/inspect/${service.ID}`}>{service.ID.substring(0, 12)}</Link>
        </Td>
        <Td column="Name">{service.Spec.Name}</Td>
        <Td column="Image">{shortenImageName(service.Spec.TaskTemplate.ContainerSpec.Image)}</Td>
      </Tr>
    );
  }

  render() {
    const { loading, error, services, tasks, selected } = this.state;

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
            {error && (<Message error>{JSON.stringify(error)}</Message>)}
            <Table
              className="ui compact celled sortable unstackable table"
              ref="table"
              sortable
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
