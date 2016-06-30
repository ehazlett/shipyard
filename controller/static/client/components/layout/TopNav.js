import React from 'react';

import { Link } from 'react-router';
import { Menu, Container, Dropdown, Icon } from 'react-semantify';

const TopNav = React.createClass({
  render() {
    return (
      <Menu className="inverted borderless blue">
        <Container>
          <Link to="/services" className="item">
            <Icon className="cubes"></Icon>
            Services
          </Link>

          <Link to="/containers" className="item">
            <Icon className="cube"></Icon>
            Containers
          </Link>

          <Link to="/images" className="item">
            <Icon className="file"></Icon>
            Images
          </Link>

          <Link to="/nodes" className="item">
            <Icon className="server"></Icon>
            Nodes
          </Link>

          <Link to="/networks" className="item">
            <Icon className="sitemap"></Icon>
            Networks
          </Link>

          <Link to="/volumes" className="item">
            <Icon className="database"></Icon>
            Volumes
          </Link>

          <Link to="/events" className="item">
            <Icon className="browser"></Icon>
            Events
          </Link>

          <Link to="/settings" className="right item">
            <Icon className="setting"></Icon>
            Settings
          </Link>
        </Container>
      </Menu>
    );
  }
});

export default TopNav;
