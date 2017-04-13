import React from "react";

import { Message, Container, Grid, Icon } from "semantic-ui-react";
import ReactTable from "react-table";
import TaskStates from "../services/TaskStates";
import { Link } from "react-router-dom";
import _ from "lodash";
import moment from "moment";

import { inspectNode, listTasksForNode, listServices } from "../../api";
import { shortenImageName } from "../../lib";

class NodeListView extends React.Component {
  state = {
    services: {},
    tasks: [],
    node: [],
    loading: true,
    error: null
  };

  componentDidMount() {
    const { id } = this.props.match.params;

    inspectNode(id)
      .then(node => {
        this.setState({
          error: null,
          node: node.body,
          loading: false
        });
      })
      .catch(error => {
        this.setState({
          error,
          loading: false
        });
      });

    listTasksForNode(id)
      .then(tasks => {
        this.setState({
          error: null,
          tasks: tasks.body
        });
      })
      .catch(error => {
        this.setState({
          error
        });
      });

    listServices()
      .then(services => {
        this.setState({
          error: null,
          services: _.keyBy(services.body, "ID")
        });
      })
      .catch(error => {
        this.setState({
          error
        });
      });
  }

  updateFilter = input => {
    this.refs.table.filterBy(input.target.value);
  };

  render() {
    const { node, services, tasks, error, loading } = this.state;

    if (loading) {
      return <div />;
    }

    const columns = [
      {
        header: "",
        accessor: "Status.State",
        render: row => {
          return (
            <i
              className={`ui circle icon ${TaskStates(row.row.Status.State)}`}
            />
          );
        },
        sortable: false,
        width: 30
      },
      {
        header: "Service",
        accessor: "ServiceID",
        render: row => {
          return (
            <Link to={`/services/${row.row.ServiceID}`}>
              {services[row.row.ServiceID]
                ? services[row.row.ServiceID].Spec.Name
                : ""}
              ;
            </Link>
          );
        },
        sortable: true
      },
      {
        header: "ID",
        accessor: "ID",
        render: row => {
          return <span>{row.row.ID.substring(0, 12)}</span>;
        },
        sortable: true
      },
      {
        header: "Container ID",
        id: "Roles",
        accessor: d =>
          d.Status.ContainerStatus.ContainerID
            ? d.Status.ContainerStatus.ContainerID
            : "N/A",
        render: row => {
          return (
            <span>
              {row.row.Status.ContainerStatus.ContainerID
                ? <Link
                    to={
                      `/containers/${row.row.Status.ContainerStatus.ContainerID}`
                    }
                  >
                    {row.row.Status.ContainerStatus.ContainerID.substring(
                      0,
                      12
                    )}
                  </Link>
                : <span className="weak">N/A</span>}
            </span>
          );
        },
        sortable: true
      },
      {
        header: "Name",
        id: "Name",
        accessor: d =>
          services[d.ServiceID] ? services[d.ServiceID].Spec.Name.$d.Slot : "",
        sortable: true,
        sort: "asc"
      },
      {
        header: "Image",
        accessor: "Spec.ContainerSpec.Image",
        render: row => {
          return (
            <span>{shortenImageName(row.row.Spec.ContainerSpec.Image)}</span>
          );
        },
        sortable: true
      },
      {
        header: "Last Status Update",
        accessor: "Status.Timestamp",
        render: row => {
          return (
            <span>{new Date(row.row.Status.Timestamp).toLocaleString()}</span>
          );
        }
      }
    ];

    return (
      <Container>
        <Grid>
          <Grid.Row>
            <Grid.Column width={16}>
              <div className="ui breadcrumb">
                <Link to="/nodes" className="section">Nodes</Link>
                <div className="divider"> / </div>
                <div className="active section">
                  {node.Description.Hostname}
                </div>
              </div>
            </Grid.Column>
            <Grid.Column className="sixteen wide basic ui segment">
              {error && <Message error>{error}</Message>}
              <div className="ui header">Details</div>
              <table className="ui very basic celled table">
                <tbody>
                  <tr>
                    <td className="four wide column">ID</td>
                    <td>{node.ID.substring(0, 12)}</td>
                  </tr>
                  <tr><td>Role</td><td>{node.Spec.Role}</td></tr>
                  <tr><td>Hostname</td><td>{node.Description.Hostname}</td></tr>
                  <tr><td>OS</td><td>{node.Description.Platform.OS}</td></tr>
                  <tr>
                    <td>Architecture</td>
                    <td>{node.Description.Platform.Architecture}</td>
                  </tr>
                  <tr>
                    <td>Engine</td>
                    <td>
                      {node.Description.Engine
                        ? node.Description.Engine.EngineVersion
                        : "Unknown"}
                    </td>
                  </tr>
                  <tr>
                    <td>Created</td><td>{moment(node.CreatedAt).toString()}</td>
                  </tr>
                  <tr>
                    <td>Last Updated</td>
                    <td>{moment(node.UpdatedAt).toString()}</td>
                  </tr>
                </tbody>
              </table>
              <div className="ui header">Status</div>
              <table className="ui very basic celled table">
                {node.ManagerStatus
                  ? <tbody>
                      <tr>
                        <td className="four wide column">State</td>
                        <td>{node.Status.State}</td>
                      </tr>
                      <tr>
                        <td>Availability</td><td>{node.Spec.Availability}</td>
                      </tr>
                      <tr><td>Message</td><td>{node.Status.Message}</td></tr>
                      <tr>
                        <td>Address</td><td>{node.ManagerStatus.Addr}</td>
                      </tr>
                      <tr>
                        <td>Reachability</td>
                        <td>{node.ManagerStatus.Reachability}</td>
                      </tr>
                      <tr>
                        <td>Leader</td>
                        <td>{node.ManagerStatus.Leader ? "Yes" : "No"}</td>
                      </tr>
                    </tbody>
                  : <tbody>
                      <tr>
                        <td className="four wide column">State</td>
                        <td>{node.Status.State}</td>
                      </tr>
                      <tr>
                        <td>Availability</td><td>{node.Spec.Availability}</td>
                      </tr>
                      <tr><td>Message</td><td>{node.Status.Message}</td></tr>
                    </tbody>}
              </table>
              <div className="ui header">Resources</div>
              <table className="ui very basic celled table">
                <tbody>
                  <tr>
                    <td className="four wide column">CPU (Nanos)</td>
                    <td>
                      {node.Description.Resources
                        ? `${node.Description.Resources.NanoCPUs}`
                        : "Unknown"}
                    </td>
                  </tr>
                  <tr>
                    <td>Memory (Bytes)</td>
                    <td>
                      {node.Description.Resources
                        ? `${node.Description.Resources.MemoryBytes}`
                        : "Unknown"}
                    </td>
                  </tr>
                </tbody>
              </table>
              <div className="ui header">Plugins</div>
              <table className="ui very basic celled table">
                <tbody>
                  {node.Description.Engine && node.Description.Engine.Plugins
                    ? node.Description.Engine.Plugins.map(p => (
                        <tr key={p.Name}>
                          <td className="four wide column">{p.Name}</td>
                          <td>{p.Type}</td>
                        </tr>
                      ))
                    : <tr><td>No plugins found</td></tr>}
                </tbody>
              </table>
              <div className="ui header">Node Labels</div>
              <table className="ui very basic celled table">
                <tbody>
                  {node.Description.Engine && node.Description.Engine.Labels
                    ? _.keys(node.Description.Engine.Labels).map(l => (
                        <tr key={l}>
                          <td>{l}</td>
                          <td>{node.Description.Engine.Labels[l]}</td>
                        </tr>
                      ))
                    : <tr><td>No labels found</td></tr>}
                </tbody>
              </table>
            </Grid.Column>
            <Grid.Column className="sixteen wide">
              <div className="ui segment">
                <h3 className="ui header">Tasks</h3>
                <div className="ui fluid icon input">
                  <Icon className="search" />
                  <input placeholder="Search..." onChange={this.updateFilter} />
                </div>
                <ReactTable
                  data={tasks}
                  columns={columns}
                  defaultPageSize={10}
                  minRows={3}
                  loadingText='Loading...'
                  noDataText='No tasks found.'
                />
              </div>
            </Grid.Column>
          </Grid.Row>
        </Grid>
      </Container>
    );
  }
}

export default NodeListView;
