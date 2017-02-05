import React from 'react';

import { Form as FormsyForm } from 'formsy-react';
import { Menu, Button, Container, Header, Segment, Grid, Icon } from 'semantic-ui-react';
import { Input } from 'formsy-semantic-ui-react';
import ReactTable from 'react-table';
import { Link } from "react-router-dom";
import _ from 'lodash';
import moment from 'moment';

import taskStates from './TaskStates';

import { updateService, inspectService, listTasksForService, listNodes, listNetworks } from '../../api';
import { shortenImageName, showSuccess, showError } from '../../lib';

class ServiceListView extends React.Component {
  state = {
    service: null,
    tasks: [],
    nodes: [],
    networks: [],
    loading: true,
    modified: false,
    activeSegment: "Task Template",
  };

  componentDidMount() {
    this.refresh();
  }

  changeSegment = (segment) => {
    this.setState({
      activeSegment: segment,
    });
  }

  refresh = () => {
    const { id } = this.props.match.params;

    inspectService(id)
      .then((service) => {
        this.setState({
          service: service.body,
          loading: false,
        });
      })
      .catch((err) => {
        showError(err);
        this.setState({
          loading: false,
        });
      });

    listNetworks()
      .then((networks) => {
        this.setState({
          networks: _.keyBy(networks.body, 'Id'),
        });
      })
      .catch((err) => {
        showError(err);
        this.setState({
          networks: null,
        });
      });

    listTasksForService(id)
      .then((tasks) => {
        this.setState({
          tasks: tasks.body,
        });
      })
      .catch((err) => {
        showError(err);
        this.setState({
          tasks: null,
        });
      });

    listNodes()
      .then((nodes) => {
        this.setState({
          nodes: _.keyBy(nodes.body, 'ID'),
        });
      })
      .catch((err) => {
        showError(err);
        this.setState({
          nodes: null,
        });
      });

    // TODO: Collect promises from the above calls and set loading to false
    // based upon all of them returning
  }

  updateFilter = (input) => {
    this.refs.table.filterBy(input.target.value);
  };

  updateService = (values) => {
    const { service } = this.state;
    updateService(service.ID, service.Spec, service.Version.Index)
      .then((success) => {
        showSuccess('Successfully updated service');
        this.refresh();
        this.setState({
          modified: false,
        });
      })
      .catch((err) => {
        showError(err);
      });
  }

  onChangeHandler = (e, input) => {
    const { service } = this.state;
    const updatedService = Object.assign({}, service);

    if(input.type === "number") {
      const num = parseFloat(input.value);
      if(isNaN(num)) {
        _.set(updatedService, input.name, null);
      } else {
        _.set(updatedService, input.name, num);
      }
    } else {
      _.set(updatedService, input.name, input.value);
    }

    this.setState({
      service: updatedService,
      modified: true,
    });
  }

  render() {
    const { activeSegment, loading, service, tasks, networks, modified } = this.state;

    if(loading) {
      return <div></div>;
    }

    const columns = [{
      render: row => {
        return <i className={`ui circle icon ${taskStates(row.row.Status.State)}`}></i>
      },
      sortable: false
    }, {
      header: 'ID',
      accessor: 'ID',
      render: row => {
        return <span>{row.row.ID.substring(0, 12)}</span>
      },
      sortable: true
    }, {
      header: 'Container ID',
      accessor: 'Status.ContainerStatus.ContainerID',
      render: row => {
        return <span>{row.row.Status.ContainerStatus.ContainerID ?
                  <Link to={`/services/inspect/${this.props.match.params.id}/container/${row.row.Status.ContainerStatus.ContainerID}`}>{row.row.Status.ContainerStatus.ContainerID.substring(0, 12)}</Link> :
                  <span>null</span>}
                </span>;
      },
      sortable: true
    }, {
      header: 'Name',
      id: 'Name',
      accessor: d => d.Spec.Name+"."+d.Slot,
      sortable: true,
      sort: 'asc'
    }, {
      header: 'Image',
      accessor: 'Spec.ContainerSpec.Image',
      render: row => {
        return <span>{shortenImageName(row.row.Spec.ContainerSpec.Image)}</span>;
      },
      sortable: true
    }, {
      header: 'Last Status Update',
      accessor: 'Status.Timestamp',
      render: row => {
        return <span>{new Date(row.row.Status.Timestamp).toLocaleString()}</span>
      },
      sortable: true
    }, {
      header: 'Node',
      accessor: 'this.state.nodes[t.NodeID]',
      render: row => {
        return <span>{this.state.nodes[row.row.NodeID] ? this.state.nodes[row.row.NodeID].Description.Hostname : null}</span>
      },
      sortable: true
    }];

    return (
      <Container>
        <Grid>
          <Grid.Row>
            <Grid.Column width={16}>
              <Segment basic>
                <div className="ui breadcrumb">
                  <Link to="/services" className="section">Services</Link>
                  <div className="divider"> / </div>
                  <div className="active section">{service.Spec.Name}</div>
                </div>
              </Segment>
              <FormsyForm onValidSubmit={this.updateService}>
                { modified && <Button color="green">Save changes to Service</Button> }
                <Grid divided padded>
                  <Grid.Row>
                    <Grid.Column mobile={16} tablet={16} computer={8} largeScreen={8}>
                      <Header size="small">Service Details</Header>
                      <table className="ui very basic celled table">
                        <tbody>
                          <tr><td className="four wide column">ID</td><td>{service.ID.substring(0, 12)}</td></tr>
                          <tr><td>Name</td><td>{service.Spec.Name}</td></tr>
                          <tr><td>Created</td><td>{moment(service.CreatedAt).toString()}</td></tr>
                          <tr><td>Last Updated</td><td>{moment(service.UpdatedAt).toString()}</td></tr>
                        </tbody>
                      </table>
                    </Grid.Column>
                    <Grid.Column mobile={16} tablet={16} computer={8} largeScreen={8}>
                      <Header size="small">Update Status</Header>
                      { service.UpdateStatus.State ?
                          <table className="ui very basic celled table">
                            <tbody>
                              <tr>
                                <td className="four wide column">State</td>
                                <td>{service.UpdateStatus ? service.UpdateStatus.State : null}</td>
                              </tr>
                              <tr>
                                <td>Started</td>
                                <td>{service.UpdateStatus ? moment(service.UpdateStatus.StartedAt).toString() : null}</td>
                              </tr>
                              <tr>
                                <td>Completed</td>
                                <td>{service.UpdateStatus ? moment(service.UpdateStatus.CompletedAt).toString() : null}</td>
                              </tr>
                              <tr>
                                <td>Message</td>
                                <td>{service.UpdateStatus ? service.UpdateStatus.Message : null}</td>
                              </tr>
                            </tbody>
                          </table> :
                          <span>This service has never been updated.</span>
                      }
                    </Grid.Column>
                    </Grid.Row>
                  </Grid>

                  <Menu pointing secondary>
                    <Menu.Item name="Task Template" active={activeSegment === "Task Template"} onClick={() => { this.changeSegment("Task Template"); }} />
                    <Menu.Item name="Scheduling" active={activeSegment === "Scheduling"} onClick={() => { this.changeSegment("Scheduling"); }} />
                    <Menu.Item name="Labels and Variables" active={activeSegment === "Labels & Variables"} onClick={() => { this.changeSegment("Labels & Variables"); }} />
                    <Menu.Item name="Networking" active={activeSegment === "Networking"} onClick={() => { this.changeSegment("Networking"); }} />
                    <Menu.Item name="Volumes" active={activeSegment === "Volumes"} onClick={() => { this.changeSegment("Volumes"); }} />
                    <Menu.Item name="Secrets" active={activeSegment === "Secrets"} onClick={() => { this.changeSegment("Secrets"); }} />
                    <Menu.Item name="Tasks" active={activeSegment === "Tasks"} onClick={() => { this.changeSegment("Tasks"); }} />
                  </Menu>

                  { activeSegment === "Task Template" &&
                    <Segment basic>
                      <table className="ui very basic celled table">
                        <tbody>
                          <tr><td className="four wide column">Image</td><td>{shortenImageName(service.Spec.TaskTemplate.ContainerSpec.Image)}</td></tr>
                          <tr><td>Command</td><td>{service.Spec.TaskTemplate.ContainerSpec.Command}</td></tr>
                          <tr><td>Args</td><td>{service.Spec.TaskTemplate.ContainerSpec.Args ? service.Spec.TaskTemplate.ContainerSpec.Args.join(' ') : null}</td></tr>
                          <tr><td>Working Directory</td><td>{service.Spec.TaskTemplate.ContainerSpec.Dir}</td></tr>
                          <tr><td>User</td><td>{service.Spec.TaskTemplate.ContainerSpec.User}</td></tr>
                          <tr><td>Groups</td><td>{service.Spec.TaskTemplate.ContainerSpec.Groups ? service.Spec.TaskTemplate.ContainerSpec.Groups.join(' ') : null}</td></tr>
                          <tr><td>Hostname</td><td>{service.Spec.TaskTemplate.ContainerSpec.Hostname}</td></tr>
                          <tr><td>TTY</td><td>{service.Spec.TaskTemplate.ContainerSpec.TTY ? 'Yes' : 'No'}</td></tr>
                          <tr><td>Open Stdin</td><td>{service.Spec.TaskTemplate.ContainerSpec.OpenStdin ? 'Yes' : 'No'}</td></tr>
                          <tr><td>Stop Grace Period</td><td>{service.Spec.TaskTemplate.ContainerSpec.StopGracePeriod}</td></tr>
                        </tbody>
                      </table>
                      <Header size="small">Healthcheck</Header>
                      <table className="ui very basic celled table">
                        <tbody>
                          <tr>
                            <td className="four wide column">Test</td>
                            <td>
                              {service.Spec.TaskTemplate.ContainerSpec.Healthcheck
                              && service.Spec.TaskTemplate.ContainerSpec.Healthcheck.Test ?
                                  service.Spec.TaskTemplate.ContainerSpec.Healthcheck.Test.join(' ') : 'None'}
                                </td>
                          </tr>
                          <tr>
                            <td>Interval</td>
                            <td>
                              {service.Spec.TaskTemplate.ContainerSpec.Healthcheck
                              && service.Spec.TaskTemplate.ContainerSpec.Healthcheck.Interval ?
                                  service.Spec.TaskTemplate.ContainerSpec.Healthcheck.Interval : null}
                                </td>
                          </tr>
                          <tr>
                            <td>Timeout</td>
                            <td>
                              {service.Spec.TaskTemplate.ContainerSpec.Healthcheck
                              && service.Spec.TaskTemplate.ContainerSpec.Healthcheck.Timeout ?
                                  service.Spec.TaskTemplate.ContainerSpec.Healthcheck.Timeout : null}
                                </td>
                          </tr>
                          <tr>
                            <td>Retries</td>
                            <td>
                              {service.Spec.TaskTemplate.ContainerSpec.Healthcheck
                              && service.Spec.TaskTemplate.ContainerSpec.Healthcheck.Retries ?
                                  service.Spec.TaskTemplate.ContainerSpec.Healthcheck.Retries : null}
                                </td>
                          </tr>
                        </tbody>
                      </table>
                    </Segment>
                  }

                  { activeSegment === "Scheduling" &&
                    <Segment basic>
                      <Header size="small">Scheduling Configuration</Header>
                      <table className="ui very basic celled table">
                        <tbody>
                          <tr><td>Mode</td><td>
                              {service.Spec.Mode.Replicated && 'Replicated'}
                              {service.Spec.Mode.Global && 'Global'}
                          </td></tr>
                          { service.Spec.Mode.Replicated &&
                                (
                              <tr>
                                <td>Replicas</td>
                                <td>
                                  <Input
                                    name="Spec.Mode.Replicated.Replicas"
                                    size="tiny"
                                    type="number"
                                    value={service.Spec.Mode.Replicated.Replicas || ""}
                                    onChange={this.onChangeHandler}
                                    validations="isUnsignedInt"
                                    required />
                                </td>
                              </tr>
                            )
                          }
                        </tbody>
                      </table>
                      <Header size="small">Update Config</Header>
                      <table className="ui very basic celled table">
                        <tbody>
                          <tr>
                            <td className="four wide column">Parallelism</td>
                            <td>
                              <Input
                                name="Spec.UpdateConfig.Parallelism"
                                size="tiny"
                                type="number"
                                value={service.Spec.UpdateConfig ? (service.Spec.UpdateConfig.Parallelism || "")  : ""}
                                onChange={this.onChangeHandler}
                                validations="isUnsignedInt"
                              />
   </td>
                          </tr>
                          <tr>
                            <td>Delay</td>
                            <td>{service.Spec.UpdateConfig ? service.Spec.UpdateConfig.Delay : null}</td>
                          </tr>
                          <tr>
                            <td>Monitor</td>
                            <td>{service.Spec.UpdateConfig ? service.Spec.UpdateConfig.Monitor : null}</td>
                          </tr>
                          <tr>
                            <td>Failure Action</td>
                            <td>{service.Spec.UpdateConfig ? service.Spec.UpdateConfig.FailureAction : null}</td>
                          </tr>
                          <tr>
                            <td>Max Failure Ratio</td>
                            <td>{service.Spec.UpdateConfig ? service.Spec.UpdateConfig.MaxFailureRatio : null}</td>
                          </tr>
                        </tbody>
                      </table>
                    </Segment>
                  }
                  { activeSegment === "Networking" &&
                    <Segment basic>
                      <Header size="small">Ports</Header>
                      <table className="ui very basic celled table">
                        {
                          service.Endpoint.Ports ?
                            <thead><tr><th>Protocol</th><th>Target</th><th>Published Port</th></tr></thead>
                            : null
                        }
                        <tbody>
                          {
                          service.Endpoint.Ports ?
                            service.Endpoint.Ports.map((p) => (
                              <tr key={p.TargetPort}>
                                <td className="four wide column">{p.Protocol}</td>
                                <td>{p.TargetPort}</td>
                                <td>
                                  <a href={`${window.location.protocol}//${window.location.hostname}:${p.PublishedPort}`} target="_blank">{p.PublishedPort}</a>
                                </td>
                              </tr>
                            )) :
                            <tr><td>No ports published</td></tr>
                        }
                      </tbody>
                      </table>
                      <Header size="small">Networks</Header>
                      <table className="ui very basic celled table">
                        {
                          service.Spec.Networks ?
                            <thead><tr><th>Target</th><th>Name</th><th>Aliases</th></tr></thead>
                            : null
                        }
                        <tbody>
                          {
                          service.Spec.Networks ?
                            service.Spec.Networks.map((n) => (
                              <tr key={n.Target}>
                                <td className="four wide column">{n.Target}</td>
                                <td>{networks[n.Target] ? networks[n.Target].Name : null}</td>
                                <td>{n.Aliases ? n.Aliases.join(' ') : null}</td>
                              </tr>
                            )) :
                            <tr><td>No networks attached</td></tr>
                          }
                        </tbody>
                      </table>
                      <Header size="small">DNS &amp; Hosts</Header>
                      <table className="ui very basic celled table">
                        <tbody>
                          <tr>
                            <td className="four wide column">Hosts</td>
                            <td>{service.Spec.TaskTemplate.ContainerSpec.Hosts ? service.Spec.TaskTemplate.ContainerSpec.Hosts.join(' ') : null}</td>
                          </tr>
                          <tr>
                            <td>Nameservers</td>
                            <td>
                              {service.Spec.TaskTemplate.ContainerSpec.DNSConfig
                              && service.Spec.TaskTemplate.ContainerSpec.DNSConfig.Nameservers ?
                                  service.Spec.TaskTemplate.ContainerSpec.DNSConfig.Nameservers.join(' ') : 'Default'}
                                </td>
                          </tr>
                          <tr>
                            <td>DNS Options</td>
                            <td>
                              {service.Spec.TaskTemplate.ContainerSpec.DNSConfig
                              && service.Spec.TaskTemplate.ContainerSpec.DNSConfig.Options ?
                                  service.Spec.TaskTemplate.ContainerSpec.DNSConfig.Options.join(' ') : 'Default'}
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </Segment>
                  }

                  { activeSegment === "Labels & Variables" &&
                    <Segment basic>
                      <Header size="small">Environment Variables</Header>
                      <table className="ui very basic celled table">
                        <tbody>
                          {
                          service.Spec.TaskTemplate.ContainerSpec.Env ?
                            service.Spec.TaskTemplate.ContainerSpec.Env.map((e) => (
                              <tr key={e}>
                                <td className="four wide column">{e.split('=')[0]}</td>
                                <td>{e.split('=')[1]}</td>
                              </tr>
                            )) :
                            <tr><td>No environment variables</td></tr>
                          }
                        </tbody>
                      </table>

                      <Header size="small">Container Labels</Header>
                      <table className="ui very basic celled table">
                        <tbody>
                          {
                          service.Spec.TaskTemplate.ContainerSpec.Labels ?
                            Object.keys(service.Spec.TaskTemplate.ContainerSpec.Labels).map((k) => (
                              <tr key={k}>
                                <td className="four wide column">{k}</td>
                                <td>{service.Spec.TaskTemplate.ContainerSpec.Labels[k]}</td>
                              </tr>
                            )) :
                            <tr><td>No container labels</td></tr>
                          }
                        </tbody>
                      </table>
                    </Segment>
                  }

                  { activeSegment === "Volumes" &&
                  <Segment basic>
                    <Header size="small">Mounts</Header>
                    <table className="ui very basic celled table">
                      {
                        service.Spec.TaskTemplate.ContainerSpec.Mounts ?
                          <thead><tr><th>Type</th><th>Source</th><th>Destination</th><th>Read-Only</th></tr></thead>
                          : null
                      }
                      <tbody>
                        {
                        service.Spec.TaskTemplate.ContainerSpec.Mounts ?
                          service.Spec.TaskTemplate.ContainerSpec.Mounts.map((m) => (
                            <tr key={m.Source}>
                              <td className="four wide column">{m.Type}</td>
                              <td>{m.Source}</td>
                              <td>{m.Target}</td>
                              <td>{m.ReadOnly ? 'Read-Only' : 'Read/Write'}</td>
                            </tr>
                          )) :
                          <tr><td>No mounts configured</td></tr>
                      }
                    </tbody>
                    </table>
                  </Segment>
                  }

                  { activeSegment === "Secrets" &&
                  <Segment basic>
                    <Header size="small">Secrets</Header>
                    <table className="ui very basic celled table">
                      {
                        service.Spec.TaskTemplate.ContainerSpec.Secrets ?
                          <thead><tr><th>ID</th><th>Name</th><th>Target File</th><th>Mode</th></tr></thead>
                          : null
                      }
                      <tbody>
                        {
                        service.Spec.TaskTemplate.ContainerSpec.Secrets ?
                          service.Spec.TaskTemplate.ContainerSpec.Secrets.map((s) => (
                            <tr key={s.SecretID}>
                              <td className="four wide column">{s.SecretID}</td>
                              <td>{s.SecretName}</td>
                              <td>{s.Target ? s.Target.Name : null}</td>
                              <td>{s.Target ? s.Target.Mode : null}</td>
                            </tr>
                          )) :
                          <tr><td>No secrets attached</td></tr>
                      }
                    </tbody>
                    </table>
                    </Segment>
                  }

                  { activeSegment === "Tasks" &&
                    <Segment basic>
                      <Header size="small">Tasks</Header>
                      <div className="ui fluid icon input">
                        <Icon className="search" />
                        <input placeholder="Search..." onChange={this.updateFilter}></input>
                      </div>
                      <ReactTable
                        data={tasks}
                        columns={columns}
                        defaultPageSize={10}
                        pageSize={10}
                        minRows={0}
                      />
                     </Segment>
                  }
              </FormsyForm>
            </Grid.Column>
          </Grid.Row>
        </Grid>
      </Container>
    );
  }
}

export default ServiceListView;
