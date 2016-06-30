import React from 'react';

import { Container, Grid, Column, Row, Input, Dropdown, Item, Menu, Button, Icon } from 'react-semantify';
import { Table, Tbody, Tr, Td, Thead, Th } from 'reactable';
import { Link } from 'react-router';

const NodeListView = React.createClass({
  componentDidMount() {
    this.props.fetchNodes();
  },

  updateFilter(input) {
    this.refs.table.filterBy(input.target.value);
  },

  renderNode(node) {
    return (
      <Tr key={node.Id}>
        <Td column="" className="collapsing">
          <Icon className={'circle ' + (node.Status.State === 'ready' ? 'green' : 'red')}></Icon>
        </Td>
        <Td column="ID" className="collapsing"><Link to={'/nodes/' + node.ID}>{node.ID.substring(0, 12)}</Link></Td>
        <Td column="Hostname">{node.Description.Hostname}</Td>
        <Td column="OS">
          <span>{node.Description.Platform.OS} {node.Description.Platform.Architecture}</span>
        </Td>
        <Td column="Engine">{node.Description.Engine.EngineVersion}</Td>
        <Td column="Type">{node.ManagerStatus.Leader ? 'Leader' : 'Worker'}</Td>
        <Td column="&nbsp;" className="collapsing">
          <div className="ui simple dropdown">
            <i className="dropdown icon"></i>
            <div className="menu">
              <div className="item" onClick={this.props.acceptNode(node.ID)}>Accept</div>
              <div className="item" onClick={this.props.rejectNode(node.ID)}>Reject</div>

              <div className="item" onClick={this.props.activateNode(node.ID)}>Activate</div>
              <div className="item" onClick={this.props.pauseNode(node.ID)}>Pause</div>
              <div className="item" onClick={this.props.drainNode(node.ID)}>Drain</div>

              <div className="item" onClick={this.props.disconnectNode(node.ID)}>Disconnect</div>

              <div className="item" onClick={this.props.promoteNode(node.ID)}>Promote</div>
              <div className="item" onClick={this.props.demoteNode(node.ID)}>Demote</div>
            </div>
          </div>
        </Td>
      </Tr>
    );
  },

  render() {
    return (
      <Container>
        <Grid>
          <Row>
            <Column className="six wide">
              <div className="ui fluid icon input">
                <Icon className="search" />
                <input placeholder="Search..." onChange={this.updateFilter}></input>
              </div>
            </Column>
            <Column className="right aligned ten wide">
            </Column>
          </Row>
          <Row>
            <Column className="sixteen wide">
              <Table
                ref="table"
                className="ui compact celled sortable table"
                sortable
                filterable={['Hostname', 'OS', 'Engine', 'Type']}
                hideFilterInput
                noDataText="Couldn't find any nodes"
              >
                {this.props.nodes ? this.props.nodes.map(this.renderNode) : []}
              </Table>
            </Column>
          </Row>
        </Grid>
      </Container>
    );
  },
});

export default NodeListView;
