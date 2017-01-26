import React from 'react';

import { Container, Grid, Message  } from 'semantic-ui-react';
import { Link } from 'react-router';
import _ from 'lodash';
import moment from 'moment';

import { inspectContainer } from '../../api';
import { shortenImageName } from '../../lib';

class ContainerInspectView extends React.Component {
  state = {
    container: null,
    loading: true,
    error: null
  };

  componentDidMount() {
    const { id } = this.props.params;
    inspectContainer(id)
      .then((container) => {
        this.setState({
          error: null,
          container: container.body,
          loading: false,
        });
      })
      .catch((error) => {
        this.setState({
          error,
          loading: false,
        });
      });
  }

  render() {
    const { loading, container, error } = this.state;

    if(loading) {
      return <div></div>;
    }

    return (
      <Container>
        <Grid>
          <Grid.Row>
            <Grid.Column width={16}>
              <div className="ui breadcrumb">
                <Link to="/containers" className="section">Containers</Link>
                <div className="divider"> / </div>
                <div className="active section">{container.Name.substring(1)}</div>
              </div>
            </Grid.Column>
            <Grid.Column className="ui sixteen wide basic segment">
              {error && (<Message error>{error}</Message>)}
              <div className="ui header">Details</div>
              <table className="ui very basic celled table">
                <tbody>
                  <tr><td className="four wide column">ID</td><td>{container.Id.substring(0, 12)}</td></tr>
                  <tr><td>Name</td><td>{container.Name}</td></tr>
                  <tr><td>Created</td><td>{moment(container.CreatedAt).toString()}</td></tr>
                  <tr><td>Last Updated</td><td>{moment(container.UpdatedAt).toString()}</td></tr>
                </tbody>
              </table>
            </Grid.Column>

            <Grid.Column className="ui sixteen wide basic segment">
              <div className="ui header">Ports</div>
              <table className="ui very basic celled table">
                {
                  !_.isEmpty(container.HostConfig.PortBindings) ?
                    <thead><tr><th>Protocol</th><th>Target</th><th>Published Port</th></tr></thead>
                    : null
                }
                <tbody>
                {
                  !_.isEmpty(container.HostConfig.PortBindings) ?
                    Object.keys(container.HostConfig.PortBindings).map((p) => (
                      <tr key={container.HostConfig.PortBindings[p].TargetPort}>
                        <td className="four wide column">{container.HostConfig.PortBindings[p].Protocol}</td>
                        <td>{container.HostConfig.PortBindings[p].TargetPort}</td>
                        <td>
                          <a href={`${window.location.protocol}//${window.location.hostname}:${container.HostConfig.PortBindings[p].PublishedPort}`}
                            target="_blank">
                            {container.HostConfig.PortBindings[p].PublishedPort}
                          </a>
                        </td>
                      </tr>
                    )) :
                    <tr><td>No ports published</td></tr>
                }
                </tbody>
              </table>

              <div className="ui header">Details</div>
              <table className="ui very basic celled table">
                <tbody>
                  <tr><td className="four wide column">Image</td><td>{shortenImageName(container.Config.Image)}</td></tr>
                  <tr><td>Command</td><td>{container.Config.Command}</td></tr>
                  <tr><td>Args</td><td>{container.Config.Args ? container.Config.Args.join(' ') : null}</td></tr>
                  <tr><td>Working Directory</td><td>{container.Config.Dir}</td></tr>
                  <tr><td>User</td><td>{container.Config.User}</td></tr>
                  <tr><td>Groups</td><td>{container.Config.Groups ? container.Config.Groups.join(' ') : null}</td></tr>
                  <tr><td>Hostname</td><td>{container.Config.Hostname}</td></tr>
                  <tr><td>TTY</td><td>{container.Config.TTY ? 'Yes' : 'No'}</td></tr>
                  <tr><td>Open Stdin</td><td>{container.Config.OpenStdin ? 'Yes' : 'No'}</td></tr>
                  <tr><td>Stop Grace Period</td><td>{container.Config.StopGracePeriod}</td></tr>
                </tbody>
              </table>

              <div className="ui header">Environment Variables</div>
              <table className="ui very basic celled table">
                <tbody>
                {
                  container.Config.Env ?
                    container.Config.Env.map((e) => (
                      <tr key={e}>
                        <td className="four wide column">{e.split('=')[0]}</td>
                        <td>{e.split('=')[1]}</td>
                      </tr>
                    )) :
                    <tr><td>No environment variables</td></tr>
                }
                </tbody>
              </table>

              <div className="ui header">Labels</div>
              <table className="ui very basic celled table">
                <tbody>
                {
                  container.Config.Labels ?
                    Object.keys(container.Config.Labels).map((k) => (
                      <tr key={k}>
                        <td className="four wide column">{k}</td>
                        <td>{container.Config.Labels[k]}</td>
                      </tr>
                    )) :
                    <tr><td>No container labels</td></tr>
                }
                </tbody>
              </table>

              <div className="ui header">Mounts</div>
              <table className="ui very basic celled table">
                {
                  container.Mounts ?
                    <thead><tr><th>Type</th><th>Source</th><th>Destination</th><th>Read-Only</th></tr></thead>
                    : null
                }
                <tbody>
                {
                  container.Mounts ?
                    container.Mounts.map((m) => (
                      <tr key={m.Source}>
                        <td className="four wide column">{m.Type}</td>
                        <td>{m.Source}</td>
                        <td>{m.Destination}</td>
                        <td>{m.RW ? 'Read/Write' : 'Read-Only'}</td>
                      </tr>
                    )) :
                    <tr><td>No mounts configured</td></tr>
                }
                </tbody>
              </table>

              <div className="ui header">Networks</div>
              <table className="ui very basic celled table">
                {
                  container.NetworkSettings.Networks ?
                    <thead><tr><th>Target</th><th>Name</th></tr></thead>
                    : null
                }
                <tbody>
                {
                  container.NetworkSettings.Networks ?
                    Object.keys(container.NetworkSettings.Networks).map((n) => (
                      <tr key={n}>
                        <td className="four wide column">{n}</td>
                        <td>{container.NetworkSettings.Networks[n].IPAddress}</td>
                      </tr>
                    )) :
                    <tr><td>No networks attached</td></tr>
                }
                </tbody>
              </table>

              <div className="ui header">Healthcheck</div>
              <table className="ui very basic celled table">
                <tbody>
                  <tr>
                    <td className="four wide column">Test</td>
                    <td>
                      {container.Config.Healthcheck
                      && container.Config.Healthcheck.Test ?
                          container.Config.Healthcheck.Test.join(' ') : 'None'}
                    </td>
                  </tr>
                  <tr>
                    <td>Interval</td>
                    <td>
                      {container.Config.Healthcheck
                      && container.Config.Healthcheck.Interval ?
                          container.Config.Healthcheck.Interval : null}
                    </td>
                  </tr>
                  <tr>
                    <td>Timeout</td>
                    <td>
                      {container.Config.Healthcheck
                      && container.Config.Healthcheck.Timeout ?
                          container.Config.Healthcheck.Timeout : null}
                    </td>
                  </tr>
                  <tr>
                    <td>Retries</td>
                    <td>
                      {container.Config.Healthcheck
                      && container.Config.Healthcheck.Retries ?
                          container.Config.Healthcheck.Retries : null}
                    </td>
                  </tr>
                </tbody>
              </table>

              <div className="ui header">DNS &amp; Hosts</div>
              <table className="ui very basic celled table">
                <tbody>
                  <tr>
                    <td className="four wide column">Hosts</td>
                    <td>{container.Config.Hosts ? container.Config.Hosts.join(' ') : null}</td>
                  </tr>
                  <tr>
                    <td>Nameservers</td>
                    <td>
                      {container.Config.DNSConfig
                      && container.Config.DNSConfig.Nameservers ?
                          container.Config.DNSConfig.Nameservers.join(' ') : 'Default'}
                    </td>
                  </tr>
                  <tr>
                    <td>DNS Options</td>
                    <td>
                      {container.Config.DNSConfig
                      && container.Config.DNSConfig.Options ?
                          container.Config.DNSConfig.Options.join(' ') : 'Default'}
                    </td>
                  </tr>
                </tbody>
              </table>
            </Grid.Column>
          </Grid.Row>
        </Grid>
      </Container>
    );
  }
}

export default ContainerInspectView;
