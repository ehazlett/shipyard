import React, { PropTypes } from 'react';

import { Link } from 'react-router';
import { Dropdown, Menu, Container } from 'semantic-ui-react';

export default class TopNav extends React.Component {
  static propTypes = {
    signOut: PropTypes.func.isRequired
  };

  render() {
    const { signOut, username, location } = this.props;
    return (
      <Menu inverted borderless color="blue">
        <Container>
          <Menu.Item name="services" icon="cubes" to="/services" as={Link} active={location.pathname === "/services" || location.pathname === "/"} />
          <Menu.Item name="containers" icon="cube" to="/containers" as={Link} active={location.pathname === "/containers"} />
          <Menu.Item name="images" icon="file" to="/images" as={Link} active={location.pathname === "/images"} />
          <Menu.Item name="nodes" icon="server" to="/nodes" as={Link} active={location.pathname === "/nodes"} />
          <Menu.Item name="networks" icon="sitemap" to="/networks" as={Link} active={location.pathname === "/networks"} />
          <Menu.Item name="volumes" icon="database" to="/volumes" as={Link} active={location.pathname === "/volumes"} />
          <Menu.Item name="accounts" icon="users" to="/accounts" as={Link} active={location.pathname === "/accounts"} />
          <Menu.Item name="settings" icon="settings" to="/settings" as={Link} active={location.pathname === "/settings"} />

          <Menu.Menu position='right'>
            <Dropdown simple as={Menu.Item} text={username}>
              <Dropdown.Menu>
                <Dropdown.Item icon="sign out" text="Sign Out" onClick={signOut}></Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          </Menu.Menu>
        </Container>
      </Menu>
    )
  }
}
