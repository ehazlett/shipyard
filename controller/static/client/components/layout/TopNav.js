import React from 'react';

import { Link } from 'react-router';
import { Menu, Container, Icon } from 'react-semantify';

const TopNav = (props) => (
  <Menu className="inverted borderless blue">
    <Container>
      <Link to="/services" className="item">
        <Icon className="cubes" />
        Services
      </Link>

      <Link to="/containers" className="item">
        <Icon className="cube" />
        Containers
      </Link>

      <Link to="/images" className="item">
        <Icon className="file" />
        Images
      </Link>

      <Link to="/nodes" className="item">
        <Icon className="server" />
        Nodes
      </Link>

      <Link to="/networks" className="item">
        <Icon className="sitemap" />
        Networks
      </Link>

      <Link to="/volumes" className="item">
        <Icon className="database" />
        Volumes
      </Link>

      <Link to="/accounts" className="item">
        <Icon className="users" />
        Accounts
      </Link>

      <Link to="/settings" className="item">
        <Icon className="setting" />
        Settings
      </Link>

      <div className="ui right floated simple dropdown item">
        <Icon className="user" />
        <div className="menu">
          <a className="item" onClick={props.signOut}>Sign Out</a>
        </div>
      </div>
    </Container>
  </Menu>
);

export default TopNav;
