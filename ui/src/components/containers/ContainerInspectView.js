import React from 'react';

import { Header, Segment, Button, Form, Container, Grid, Message, Menu } from 'semantic-ui-react';
import { Link } from 'react-router';
import _ from 'lodash';
import moment from 'moment';

import Terminal from 'xterm';
import '../../../node_modules/xterm/dist/xterm.css';

import DateTime from 'react-datetime';
import '../../../node_modules/react-datetime/css/react-datetime.css';

import { inspectContainer, logsContainer, execContainer } from '../../api';
import { shortenImageName } from '../../lib';

const DATE_FORMAT = "YYYY-MM-DD";
const TIME_FORMAT = "HH:mm:ss";

class ContainerInspectView extends React.Component {
  state = {
    container: null,
    loading: true,
    activeSegment: 'config',
    error: null,
    term: null,
    websocket: null,
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

  logs = (e, values) => {
    e.preventDefault();

		let logOpts = {
			stdout: values.formData.options.indexOf("stdout") > -1 ? 1 : 0,
			stderr: values.formData.options.indexOf("stderr") > -1 ? 1 : 0,
			timestamps: values.formData.options.indexOf("timestamps") > -1 ? 1 : 0,
			since: values.formData.since ? moment(values.formData.since, `${DATE_FORMAT} ${TIME_FORMAT}`).unix() : 0,
		};

    const { id } = this.props.params;
    logsContainer(id, logOpts)
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

  execContainer = (e, values) => {
    e.preventDefault();

    const { id } = this.props.params;

    let cmd = values.formData.Command;
    let termHeight = values.formData.TermHeight || 30;
    let termWidth = values.formData.TermWidth || 79;

    execContainer(id)
      .then((session) => {
        let wsScheme = window.location.protocol.replace('http', 'ws');
        let wsAddr = `${wsScheme}//${window.location.hostname}:${window.location.port}/exec?id=${id}&cmd=${cmd}&h=${termHeight}&w=${termWidth}&token=${session.body.token}`;
        let websocket = new WebSocket(wsAddr);

        websocket.onopen = (evt) => {
          let term = new Terminal({
            cols: termWidth,
            rows: termHeight,
            screenKeys: true,
            useStyle: true,
            cursorBlink: true,
          });

          term.on('data', (data) => {
            websocket.send(data);
          });

          term.open(document.getElementById('Terminal'));

          websocket.onmessage = (evt) => {
            term.write(evt.data);
          };

          websocket.onclose = (evt) => {
            term.write("Session terminated");
            term.destroy();
          };

          websocket.onerror = (evt) => {
            console.error(evt)
          }

          this.setState({
            term,
            websocket,
          });
        };
      })
      .catch((error) => {
        this.setState({
          error,
        });
      });
  };


  // FIXME: Call disconnect terminal when navigating away from terminal page
  disconnectTerminal = () => {
    const { term, websocket } = this.state;
    if(websocket) {
      websocket.close();
    }
    if(term) {
      term.destroy();
    }
    this.setState({
      term: null,
      websocket: null,
    });
  };

  renderTerminal = () => {
    const { term } = this.state;
    return (
      <Segment basic>
        <Grid>
          <Grid.Column width={16}>
            { term !== null ?
              <Button content="Disconnect" color='red' onClick={this.disconnectTerminal} /> :
              <Form onSubmit={this.execContainer}>
								<Form.Group>
									<Form.Input name="Command" label="Command" placeholder="/bin/sh" required width={13} />
									<Form.Button label="&nbsp;" color="green">Connect</Form.Button>
								</Form.Group>
              </Form>
            }
          </Grid.Column>
          <Grid.Column width={16}>
            <div id="Terminal"></div>
          </Grid.Column>
        </Grid>
      </Segment>
    );
  };

  renderLogs = () => {
    const { logs } = this.state;
    return (
      <Segment basic>
        <Grid>
          <Grid.Column width={16}>
						<Form onSubmit={this.logs}>
							<Form.Group>
								<Form.Field width={7}>
									<label>Options</label>
									<Form.Group inline>
										<Form.Checkbox label="stdout" name="options" value="stdout" defaultChecked={true} />
										<Form.Checkbox label="stderr" name="options" value="stderr" defaultChecked={true} />
										<Form.Checkbox label="timestamps" name="options" value="timestamps" defaultChecked={false} />
									</Form.Group>
								</Form.Field>
								<Form.Field width={6}>
									<label>Since</label>
									<DateTime name="since" inputProps={{name: "since"}} dateFormat={DATE_FORMAT} timeFormat={TIME_FORMAT}/>
								</Form.Field>
								<Form.Field>
									<label>&nbsp;</label>
									<Form.Button color="green">Get Logs</Form.Button>
								</Form.Field>
							</Form.Group>
						</Form>
          </Grid.Column>
          <Grid.Column width={16}>
            <pre><code>{logs}</code></pre>
          </Grid.Column>
        </Grid>
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
                <Menu.Item name='Logs' active={activeSegment === 'logs'} onClick={() => { this.changeSegment('logs'); }} />
                <Menu.Item name='Terminal' active={activeSegment === 'Terminal'} onClick={() => { this.changeSegment('terminal'); }} />
              </Menu>

              { activeSegment === 'config' ? this.renderConfig(container) : null }
              { activeSegment === 'env' ? this.renderEnvVars(container) : null }
              { activeSegment === 'labels' ? this.renderLabels(container) : null }
              { activeSegment === 'ports' ? this.renderPorts(container) : null }
              { activeSegment === 'mounts' ? this.renderMounts(container) : null }
              { activeSegment === 'networking' ? this.renderNetworking(container) : null }
              { activeSegment === 'healthcheck' ? this.renderHealthcheck(container) : null }
              { activeSegment === 'logs' ? this.renderLogs() : null }
              { activeSegment === 'terminal' ? this.renderTerminal() : null }

            </Grid.Column>
          </Grid.Row>
        </Grid>
      </Container>
    );
  }
}

export default ContainerInspectView;
