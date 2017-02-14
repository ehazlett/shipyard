import React from "react";

import { /*Input,*/ Button, Grid, Checkbox } from "semantic-ui-react";
import ReactTable from 'react-table';
import taskStates from "./TaskStates";
import { Link } from "react-router-dom";
import _ from "lodash";

import Loader from "../common/Loader";
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
    Promise.all(
      this.getServices(),
      this.getTasks()
    ).then(() => {
      this.setState({
        loading: false,
      });
    }).catch(() => {
      this.setState({
        loading: false,
      });
    });
  }

  getServices = () => {
    return listServices()
      .then((services) => {
        this.setState({
          services: services.body,
        });
      })
      .catch((err) => {
        /* TODO: If something went wrong here, should probably redirect to an error page. */
        showError(err);
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
      return <Loader />;
    }

    const columns = [{
          render: row => {
            let selected = this.state.selected.indexOf(row.row.ID) > -1;
            return <Checkbox checked={selected} onChange={() => { this.selectItem(row.row.ID) }}
                      className={selected ? "active" : ""} key={row.row.ID}/>
          },
          sortable: false,
          width: 30
        }, {
          header: 'ID',
          accessor: 'ID',
          render: row => {
            return <Link to={`/services/inspect/${row.row.ID}`}>{row.row.ID.substring(0, 12)}</Link>
          },
          sortable: true
        }, {
          header: 'Name',
          accessor: 'Spec.Name',
          sortable: true,
          sort: 'asc'
        }, {
          header: 'Image',
          accessor: 'Spec.TaskTemplate.ContainerSpec.Image',
          render: row => {
            return <span>{shortenImageName(row.row.Spec.TaskTemplate.ContainerSpec.Image)}</span>
          },
          sortable: true
        }];

    return (
      <Grid padded>
        <Grid.Row>
          <Grid.Column width={6}>
            { /*<Input fluid icon="search" placeholder="Search..." onChange={this.updateFilter} />*/ }
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
            <ReactTable
                  data={services}
                  columns={columns}
                  defaultPageSize={10}
                  pageSize={10}
                  minRows={0}
              />
          </Grid.Column>
        </Grid.Row>
      </Grid>
    );
  }
}

export default ServiceListView;
