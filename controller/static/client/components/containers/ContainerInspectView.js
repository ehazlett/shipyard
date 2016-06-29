import React from 'react';

import { Container, Grid, Column, Row, Input, Dropdown, Item, Menu, Button, Icon } from 'react-semantify';
import { Table, Tbody, Tr, Td, Thead, Th } from 'reactable';
import ContainerInspect from '../containers/ContainerInspect';
import { Link } from 'react-router';
import _ from 'lodash';

const ContainerListView = React.createClass({
  componentDidMount() {
    this.props.fetchContainers();
  },

  render() {
    const {id} = this.props.params;
    const container = _.filter(this.props.containers, function(s) {
      return s.Id === id;
    })[0];

    if(!container) return (<div></div>);

    return (
      <Container>
        <Grid>
          <Row>
            <Column className="sixteen wide basic ui segment">
              <div className="ui breadcrumb">
                <Link to="/containers" className="section">Containers</Link>
                <div className="divider"> / </div>
                <div className="active section">{ container ? container.Names[0] : '' }</div>
              </div>
            </Column>
            <Column className="sixteen wide">
              <ContainerInspect container={container} />
            </Column>
          </Row>
        </Grid>
      </Container>
    );
  }
});

export default ContainerListView;

