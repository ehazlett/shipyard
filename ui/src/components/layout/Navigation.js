import React, { PropTypes } from 'react';

import { Link } from 'react-router';
import { Menu, Container } from 'semantic-ui-react';

import './Navigation.css';
import logo from "../../img/logo.png";

export default class TopNav extends React.Component {
  static propTypes = {
    signOut: PropTypes.func.isRequired
  };

  render() {
    const { signOut, username, location } = this.props;
    return (
      <Menu id="Navigation" fixed="left" inverted vertical color="blue">
        <Container>
          <Menu.Item header to="/" as={Link}>
            <img src={logo} className="logo" alt="Shipyard Logo" />
            <div>Shipyard</div>
          </Menu.Item>

          <Menu.Item>
            <div className="header">Swarm</div>
            <Menu.Menu>
              <Menu.Item name="services" icon="cubes" to="/services" as={Link} active={location.pathname.indexOf("/services") === 0 || location.pathname === "/"} />
              <Menu.Item name="containers" icon="cube" to="/containers" as={Link} active={location.pathname.indexOf("/containers") === 0} />
              <Menu.Item name="images" icon="file" to="/images" as={Link} active={location.pathname.indexOf("/images") === 0} />
              <Menu.Item name="nodes" icon="server" to="/nodes" as={Link} active={location.pathname.indexOf("/nodes") === 0} />
              <Menu.Item name="networks" icon="sitemap" to="/networks" as={Link} active={location.pathname.indexOf("/networks") === 0} />
              <Menu.Item name="volumes" icon="disk outline" to="/volumes" as={Link} active={location.pathname.indexOf("/volumes") === 0} />
              <Menu.Item name="secrets" icon="privacy" to="/secrets" as={Link} active={location.pathname.indexOf("/secrets") === 0} />
            </Menu.Menu>
          </Menu.Item>

          <Menu.Item>
            <div className="header">Shipyard</div>
            <Menu.Menu>
              <Menu.Item name="accounts" icon="users" to="/accounts" as={Link} active={location.pathname.indexOf("/accounts") === 0} />
              <Menu.Item name="registries" icon="database" to="/registries" as={Link} active={location.pathname.indexOf("/registries") === 0} />
              <Menu.Item name="settings" icon="settings" to="/settings" as={Link} active={location.pathname.indexOf("/settings") === 0} />
              <Menu.Item name="about" icon="question circle outline" to="/about" as={Link} active={location.pathname.indexOf("/about") === 0} />
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
