import React from 'react';

import { Header, Segment, Container, Grid, Message, Menu } from 'semantic-ui-react';
import { Link } from 'react-router';
import _ from 'lodash';
import moment from 'moment';

import { inspectContainer, logsContainer } from '../../api';
import { shortenImageName } from '../../lib';

class ContainerInspectView extends React.Component {
  state = {
    container: null,
    loading: true,
    activeSegment: 'config',
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

  changeSegment = (name) => {
    this.setState({
      activeSegment: name,
    });
  };

  renderEnvVars = (container) => {
    return (
      <Segment basic>
        <table className="ui very basic compact celled table">
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
      </Segment>
    );
  };

  renderLabels = (container) => {
    return (
      <Segment basic>
        <table className="ui very basic compact celled table">
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
      </Segment>
    );
  };

  renderMounts = (container) => {
    return (
      <Segment basic>
        <table className="ui very basic compact celled table">
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
      </Segment>
    );
  };

  renderNetworking = (container) => {
    return (
      <Segment basic>
        <Header size="small">Published Ports</Header>
        <table className="ui very basic compact celled table">
          {
            !_.isEmpty(container.HostConfig.PortBindings) ?
              <thead><tr><th>Target Port</th><th>Host Port</th><th>IP</th></tr></thead>
              : null
          }
          <tbody>
            {
            !_.isEmpty(container.HostConfig.PortBindings) ?
              Object.keys(container.HostConfig.PortBindings).map((p) => (
                <tr key={container.HostConfig.PortBindings[p][0].TargetPort}>
                  <td>{p}</td>
                  <td>{container.HostConfig.PortBindings[p][0].HostPort}</td>
                  <td>{container.HostConfig.PortBindings[p][0].HostIp}</td>
                </tr>
              )) :
              <tr><td>No ports published</td></tr>
            }
          </tbody>
        </table>

        <Header size="small">Attached Networks</Header>
        <table className="ui very basic compact celled table">
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

        <Header size="small">DNS</Header>
        <table className="ui very basic compact celled table">
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
      </Segment>
    );
  };

  renderHealthcheck = (container) => {
    return (
      <Segment basic>
        <table className="ui very basic compact celled table">
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
      </Segment>
    );
  };

  renderConfig = (container) => {
    return (
      <Segment basic>
        <table className="ui very basic compact celled table">
          <tbody>
            <tr><td className="four wide column">Command</td><td>{container.Config.Command}</td></tr>
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
      </Segment>
    );
  };

  logs = () => {
    this.setState({
      activeSegment: 'logs',
    });

    const { id } = this.props.params;
    logsContainer(id)
      .then((logs) => {
        this.setState({
          logs: logs.body,
        });
      })
      .catch((error) => {
        this.setState({
          error,
          logs: '',
        });
      });
  };

  renderLogs = () => {
    const { logs } = this.state;
    return (
      <Segment basic>
        <pre>
          <code>{logs}</code>
        </pre>
      </Segment>
    );
  };

  render() {
    const { loading, container, error, activeSegment } = this.state;

    if(loading) {
      return <div></div>;
    }

    return (
      <Container>
        <Grid>
          <Grid.Row>
            <Grid.Column width={16}>
              <Segment basic>
                <div className="ui breadcrumb">
                  <Link to="/containers" className="section">Containers</Link>
                  <div className="divider"> / </div>
                  <div className="active section">{container.Name.substring(1)}</div>
                </div>
              </Segment>
            </Grid.Column>
            <Grid.Column width={16}>
              <Segment basic>
                {error && (<Message error>{error}</Message>)}
                <table className="ui very basic compact celled table">
                  <tbody>
                    <tr><td className="four wide column">ID</td><td>{container.Id.substring(0, 12)}</td></tr>
                    <tr><td>Name</td><td>{container.Name}</td></tr>
                    <tr><td>Image</td><td>{shortenImageName(container.Config.Image)}</td></tr>
                    <tr><td>Created</td><td>{moment(container.CreatedAt).toString()}</td></tr>
                    <tr><td>Last Updated</td><td>{moment(container.UpdatedAt).toString()}</td></tr>
                  </tbody>
                </table>
              </Segment>
            </Grid.Column>
            <Grid.Column width={16}>
              <Menu pointing secondary>
                <Menu.Item name='Config' active={activeSegment === 'config'} onClick={() => { this.changeSegment('config'); }} />
                <Menu.Item name='Networking' active={activeSegment === 'networking'} onClick={() => { this.changeSegment('networking'); }} />
                <Menu.Item name='Env' active={activeSegment === 'env'} onClick={() => { this.changeSegment('env'); }} />
                <Menu.Item name='Labels' active={activeSegment === 'labels'} onClick={() => { this.changeSegment('labels'); }} />
                <Menu.Item name='Mounts' active={activeSegment === 'mounts'} onClick={() => { this.changeSegment('mounts'); }} />
                <Menu.Item name='Healthcheck' active={activeSegment === 'healthcheck'} onClick={() => { this.changeSegment('healthcheck'); }} />
                <Menu.Item name='Logs' active={activeSegment === 'logs'} onClick={() => { this.logs(container); }} />
              </Menu>

              { activeSegment === 'config' ? this.renderConfig(container) : null }
              { activeSegment === 'env' ? this.renderEnvVars(container) : null }
              { activeSegment === 'labels' ? this.renderLabels(container) : null }
              { activeSegment === 'ports' ? this.renderPorts(container) : null }
              { activeSegment === 'mounts' ? this.renderMounts(container) : null }
              { activeSegment === 'networking' ? this.renderNetworking(container) : null }
              { activeSegment === 'healthcheck' ? this.renderHealthcheck(container) : null }
              { activeSegment === 'logs' ? this.renderLogs() : null }

            </Grid.Column>
          </Grid.Row>
        </Grid>
      </Container>
    );
  }
}

export default ContainerInspectView;
