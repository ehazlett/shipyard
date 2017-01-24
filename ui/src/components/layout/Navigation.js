import React, { PropTypes } from 'react';

import { Link } from 'react-router';
import { Menu, Container } from 'semantic-ui-react';

export default class TopNav extends React.Component {
  static propTypes = {
    signOut: PropTypes.func.isRequired
  };

  render() {
    const { signOut, username, location } = this.props;
    return (
      <Menu fixed="left" inverted vertical color="blue">
        <Container>
          <Menu.Item header>
            Shipyard
          </Menu.Item>

          <Menu.Item>
            <div className="header">Swarm</div>
            <Menu.Menu>
              <Menu.Item name="services" icon="cubes" to="/services" as={Link} active={location.pathname.indexOf("/services") === 0 || location.pathname === "/"} />
              <Menu.Item name="containers" icon="cube" to="/containers" as={Link} active={location.pathname.indexOf("/containers") === 0} />
              <Menu.Item name="images" icon="file" to="/images" as={Link} active={location.pathname.indexOf("/images") === 0} />
              <Menu.Item name="nodes" icon="server" to="/nodes" as={Link} active={location.pathname.indexOf("/nodes") === 0} />
              <Menu.Item name="networks" icon="sitemap" to="/networks" as={Link} active={location.pathname.indexOf("/networks") === 0} />
              <Menu.Item name="volumes" icon="database" to="/volumes" as={Link} active={location.pathname.indexOf("/volumes") === 0} />
              <Menu.Item name="accounts" icon="users" to="/accounts" as={Link} active={location.pathname.indexOf("/accounts") === 0} />
              <Menu.Item name="settings" icon="settings" to="/settings" as={Link} active={location.pathname.indexOf("/settings") === 0} />
            </Menu.Menu>
          </Menu.Item>

          <Menu.Item>
            <div className="header">{username}</div>
            <Menu.Menu>
              <Menu.Item icon="sign out" name="sign out" onClick={signOut}></Menu.Item>
            </Menu.Menu>
          </Menu.Item>
        </Container>
      </Menu>
    )
  }
}
