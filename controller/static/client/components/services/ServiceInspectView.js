import React from 'react';

import { Container, Grid, Column, Row, Input, Dropdown, Item, Menu, Button, Icon } from 'react-semantify';
import { Table, Tbody, Tr, Td, Thead, Th } from 'reactable';
import TaskStates from './TaskStates';
import { Link } from 'react-router';
import _ from 'lodash';

const ServiceListView = React.createClass({
  componentDidMount() {
    this.props.fetchServices();
    this.props.fetchNodes();
  },

  updateFilter(input) {
    this.refs.table.filterBy(input.target.value);
  },

  renderTask(s, t, nodes = {}) {
    return (
			<Tr key={t.ID}>
        <Td column="" className="collapsing">
          <i className={'ui circle icon ' + TaskStates(t.Status.State)}></i>
        </Td>
        <Td column="ID" className="collapsing">
          <Link to={'/services/' + s.ID + '/tasks/' + t.ID}>{t.ID.substring(0, 12)}</Link>
        </Td>
        <Td column="Container ID" className="collapsing">
          {t.Status.ContainerStatus.ContainerID ? t.Status.ContainerStatus.ContainerID.substring(0, 12) : ''}
        </Td>
        <Td column="Name">
          {s.Spec.Name + '.' + t.Slot}
        </Td>
        <Td column="Image">
          {t.Spec.ContainerSpec.Image}
        </Td>
        <Td column="Last Status Update" className="collapsing">
          {new Date(t.Status.Timestamp).toLocaleString()}
        </Td>
        <Td column="Node">
          {nodes[t.NodeID] ? nodes[t.NodeID].Description.Hostname : ''}
        </Td>
			</Tr>
    );
  },

  render() {
    const { id } = this.props.params;
    const service = _.filter(this.props.services, function (s) {
      return s.ID === id;
    })[0];
    const tasks = _.filter(this.props.tasks, function (t) {
      return t.ServiceID === id;
    });
    const nodes = _.keyBy(this.props.nodes, function (n) { return n.ID; });

    if (!service) {
      return (<div></div>);
    }

    return (
			<Container>
        <Grid>
          <Row>
            <Column className="sixteen wide basic ui segment">
              <div className="ui breadcrumb">
                <Link to="/services" className="section">Services</Link>
                <div className="divider"> / </div>
                <div className="active section">{service ? service.Spec.Name : ''}</div>
              </div>
            </Column>
            <Column className="sixteen wide">
              <div className="ui basic segment">
                <div className="ui relaxed large horizontal list">
                  <div className="item">
                    <div className="header">ID</div>
                    {service.ID.substring(0, 12)}
                  </div>
                  <div className="item">
                    <div className="header">Name</div>
                    {service.Spec.Name}
                  </div>
                  <div className="item">
                    <div className="header">Type</div>
                    {service.Spec.Mode.Replicated ? 'Replicated' : ''}
                    {service.Spec.Mode.Global ? 'Global' : ''}
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
                  noDataText="Couldn't find any tasks"
                >
                  {this.props.tasks ? this.props.tasks.map((t) => this.renderTask(service, t, nodes)) : []}
                </Table>
              </div>
            </Column>
          </Row>
        </Grid>
			</Container>
    );
  },
});

export default ServiceListView;
