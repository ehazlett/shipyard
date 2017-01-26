import React from 'react';

import { Message, Segment, Grid, Icon } from 'semantic-ui-react';
import { Table, Tr, Td } from 'reactable';
import { Link } from 'react-router';
import _ from 'lodash';
import moment from 'moment';

import taskStates from './TaskStates';

import { inspectService, listTasksForService, listNodes, listNetworks } from '../../api';
import { shortenImageName } from '../../lib';

class ServiceListView extends React.Component {
  state = {
    service: null,
    tasks: [],
    nodes: [],
    networks: [],
    loading: true,
    error: null
  };

  componentDidMount() {
    const { id } = this.props.params;

    inspectService(id)
      .then((service) => {
        this.setState({
          error: null,
          service: service.body,
          loading: false,
        });
      })
      .catch((error) => {
        this.setState({
          error,
          loading: false,
        });
      });

    listNetworks()
      .then((networks) => {
        this.setState({
          error: null,
          networks: _.keyBy(networks.body, 'Id'),
        });
      })
      .catch((error) => {
        this.setState({
          error,
        });
      });

    listTasksForService(id)
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

    listNodes()
      .then((nodes) => {
        this.setState({
          error: null,
          nodes: _.keyBy(nodes.body, 'ID'),
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
  };

  renderTask = (s, t) => {
    return (
      <Tr key={t.ID}>
        <Td column="" className="collapsing">
          <i className={`ui circle icon ${taskStates(t.Status.State)}`}></i>
        </Td>
        <Td column="ID" className="collapsing">
          {t.ID.substring(0, 12)}
        </Td>
        <Td column="Container ID" className="collapsing">
          {
            t.Status.ContainerStatus.ContainerID ?
            <Link to={`/services/inspect/${s.ID}/container/${t.Status.ContainerStatus.ContainerID}`}>{t.Status.ContainerStatus.ContainerID.substring(0, 12)}</Link> :
            null
          }
        </Td>
        <Td column="Name">
          {`${s.Spec.Name}.${t.Slot}`}
        </Td>
        <Td column="Image">
          {shortenImageName(t.Spec.ContainerSpec.Image)}
        </Td>
        <Td column="Last Status Update" className="collapsing">
          {new Date(t.Status.Timestamp).toLocaleString()}
        </Td>
        <Td column="Node">
          {this.state.nodes[t.NodeID] ? this.state.nodes[t.NodeID].Description.Hostname : null}
        </Td>
      </Tr>
    );
  }

  render() {
    const { loading, service, tasks, networks, error } = this.state;

    if(loading) {
      return <div></div>;
    }

    return (
      <Segment basic>
        <Grid>
          <Grid.Row>
            <Grid.Column width={16}>
              <div className="ui breadcrumb">
                <Link to="/services" className="section">Services</Link>
                <div className="divider"> / </div>
                <div className="active section">{service.Spec ? service.Spec.Name : null}</div>
              </div>
            </Grid.Column>
            <Grid.Column className="ui sixteen wide basic segment">
              {error && (<Message error>{error}</Message>)}
              <div className="ui header">Details</div>
              <table className="ui very basic celled table">
                <tbody>
                  <tr><td className="four wide column">ID</td><td>{service.ID.substring(0, 12)}</td></tr>
                  <tr><td>Name</td><td>{service.Spec.Name}</td></tr>
                  <tr><td>Mode</td><td>
                    {service.Spec.Mode.Replicated ? 'Replicated' : null}
                    {service.Spec.Mode.Global ? 'Global' : null}
                  </td></tr>
                  { service.Spec.Mode.Replicated ?
                    (
                      <tr><td>Replicas</td><td>{service.Spec.Mode.Replicated.Replicas}</td></tr>
                    ) : null
                  }
                  <tr><td>Created</td><td>{moment(service.CreatedAt).toString()}</td></tr>
                  <tr><td>Last Updated</td><td>{moment(service.UpdatedAt).toString()}</td></tr>
                </tbody>
              </table>

              <div className="ui header">Update Status</div>
              <table className="ui very basic celled table">
                <tbody>
                  <tr>
                    <td className="four wide column">Message</td>
                    <td>{service.UpdateStatus ? service.UpdateStatus.Message : null}</td>
                  </tr>
                  <tr>
                    <td>State</td>
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
                </tbody>
              </table>
            </Grid.Column>
            <Grid.Column className="ui sixteen wide basic segment">
              <div className="ui header">Ports</div>
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

              <div className="ui header">Task Template</div>
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

              <div className="ui header">Update Config</div>
              <table className="ui very basic celled table">
                <tbody>
                  <tr>
                    <td className="four wide column">Parallelism</td>
                    <td>{service.Spec.UpdateConfig ? service.Spec.UpdateConfig.Parallelism : null}</td>
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

              <div className="ui header">Environment Variables</div>
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

              <div className="ui header">Container Labels</div>
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

              <div className="ui header">Mounts</div>
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

              <div className="ui header">Networks</div>
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

              <div className="ui header">Secrets</div>
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

              <div className="ui header">Healthcheck</div>
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

              <div className="ui header">DNS &amp; Hosts</div>
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
            </Grid.Column>
            <Grid.Column className="ui sixteen wide basic segment">
              <h3 className="ui header">Tasks</h3>
              <div className="ui fluid icon input">
                <Icon className="search" />
                <input placeholder="Search..." onChange={this.updateFilter}></input>
              </div>
              <Table
                className="ui compact celled sortable unstackable table"
                ref="table"
                sortable
                filterable={['ID', 'Name', 'Image', 'Command']}
                hideFilterInput
                noDataText="Couldn't find any tasks"
              >
                {tasks ? tasks.map((t) => this.renderTask(service, t)) : []}
              </Table>
            </Grid.Column>
          </Grid.Row>
        </Grid>
      </Segment>
    );
  }
}

export default ServiceListView;
