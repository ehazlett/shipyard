import React from 'react';

import { Grid, Menu } from 'semantic-ui-react';

import { getVersion, getInfo } from '../../api';


class SettingsView extends React.Component {
  state = {
    info: null,
    version: null,
    error: null,
    activeSegment: 'info',
    loading: true,
  };

  componentDidMount() {
    this.getSwarmInfo();
    this.getSwarmVersion();
  }

  getSwarmVersion = () => {
    getVersion()
      .then((version) => {
        this.setState({
          error: null,
          version: version.body,
        });
      })
      .catch((error) => {
        this.setState({
          error,
        });
      });
  };

  getSwarmInfo = () => {
    getInfo()
      .then((info) => {
        this.setState({
          error: null,
          info: info.body,
          loading: false,
        });
      })
      .catch((error) => {
        this.setState({
          error,
          loading: false,
        });
      });
  };

  changeSegment = (name) => {
    this.setState({
      activeSegment: name,
    });
  };

  render() {
    var { version, info, loading, activeSegment } = this.state;
    console.log(version, info);

    if(loading) {
      return <div></div>;
    }

    return (
      <Grid padded>
        <Grid.Column width={16}>
          <Menu pointing secondary>
            <Menu.Item name='Info' active={activeSegment === 'info'} onClick={() => { this.changeSegment('info'); }} />
            <Menu.Item name='Version' active={activeSegment === 'version'} onClick={() => { this.changeSegment('version'); }} />
          </Menu>

          <pre>{ activeSegment === 'info' ? JSON.stringify(info, null, '  ') : null }{ activeSegment === 'version' ? JSON.stringify(version, null, '  ') : null }</pre>
        </Grid.Column>
      </Grid>
    );
  }
}

export default SettingsView;
