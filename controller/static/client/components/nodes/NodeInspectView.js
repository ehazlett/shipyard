import React from 'react';

import { Container, Grid, Column, Row, Input, Dropdown, Item, Menu, Button, Icon } from 'react-semantify';
import { Table, Tbody, Tr, Td, Thead, Th } from 'reactable';
import TaskStates from '../services/TaskStates';
import { Link } from 'react-router';
import _ from 'lodash';

const NodeListView = React.createClass({
  componentDidMount() {
    this.props.fetchServices();
    this.props.fetchNodes();
  },

  updateFilter(input) {
    this.refs.table.filterBy(input.target.value);
  },

  renderTask(s, t, services = {}) {
    return (
			<Tr key={t.ID}>
        <Td column="" className="collapsing">
          <i className={'ui circle icon ' + TaskStates(t.Status.State)}></i>
        </Td>
        <Td column="ID" className="collapsing">
          {t.ID.substring(0, 12)}
        </Td>
        <Td column="Container ID" className="collapsing">
          {t.Status.ContainerStatus.ContainerID ? t.Status.ContainerStatus.ContainerID.substring(0, 12) : <span className="weak">N/A</span>}
        </Td>
        <Td column="Name">
          {services[t.ServiceID] ? services[t.ServiceID].Spec.Name + '.' + t.Slot : ''}
        </Td>
        <Td column="Image">
          {t.Spec.ContainerSpec.Image}
        </Td>
        <Td column="Last Status Update" className="collapsing">
          {new Date(t.Status.Timestamp).toLocaleString()}
        </Td>
        <Td column="Service" className="collapsing">
          <Link to={'/services/' + t.ServiceID}>{services[t.ServiceID] ? services[t.ServiceID].Spec.Name : ''}</Link>
        </Td>
			</Tr>
    );
  },

  render() {
    const { id } = this.props.params;
    const node = _.filter(this.props.nodes, function (s) {
      return s.ID === id;
    })[0];
    const tasks = _.filter(this.props.tasks, function (t) {
      return t.NodeID === id;
    });
    const services = _.keyBy(this.props.services, function (n) { return n.ID; });

    if (!node) {
      return (<div></div>);
    }

    return (
			<Container>
        <Grid>
          <Row>
            <Column className="sixteen wide basic ui segment">
              <div className="ui breadcrumb">
                <Link to="/nodes" className="section">Nodes</Link>
                <div className="divider"> / </div>
                <div className="active section">{node.Description.Hostname}</div>
              </div>
            </Column>
            <Column className="sixteen wide">
              <div className="ui basic segment">
                <div className="ui relaxed large horizontal list">
                  <div className="item">
                    <div className="header">ID</div>
                    {node.ID.substring(0, 12)}
                  </div>
                  <div className="item">
                    <div className="header">Name</div>
                    {node.Description.Hostname}
                  </div>
                </div>
              </div>
            </Column>
            <Column className="sixteen wide">
              <div className="ui segment">
                <h3 className="ui header">Tasks</h3>
                <div className="ui fluid icon input">
                  <Icon className="search" />
                  <input placeholder="Search..." onChange={this.updateFilter}></input>
                </div>
                <Table
                  className="ui compact celled sortable table"
                  ref="table"
                  sortable
                  filterable={['ID', 'Name', 'Image', 'Command']}
                  hideFilterInput
                  noDataText="Couldn't find any nodes"
                >
                  {this.props.tasks ? this.props.tasks.map((t) => this.renderTask(node, t, services)) : []}
                </Table>
              </div>
            </Column>
          </Row>
        </Grid>
			</Container>
    );
  },
});

export default NodeListView;
