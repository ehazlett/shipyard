import React from 'react';

import { Container, Grid, Column, Row, Icon } from 'react-semantify';
import { Table, Tr, Td } from 'reactable';
import TaskStates from '../services/TaskStates';
import { Link } from 'react-router';
import _ from 'lodash';

class NodeListView extends React.Component {
  constructor(props) {
    super(props);
    this.updateFilter = this.updateFilter.bind(this);
  }

  componentDidMount() {
    this.props.fetchServices();
    this.props.fetchNodes();
  }

  updateFilter(input) {
    this.refs.table.filterBy(input.target.value);
  }

  renderTask(s, t, services = {}) {
    return (
      <Tr key={t.ID}>
        <Td column="" className="collapsing">
          <i className={`ui circle icon ${TaskStates(t.Status.State)}`}></i>
        </Td>
        <Td column="Service" className="collapsing">
          <Link to={`/services/${t.ServiceID}`}>
            {services[t.ServiceID] ? services[t.ServiceID].Spec.Name : ''}
          </Link>
        </Td>
        <Td column="ID" className="collapsing">
          {t.ID.substring(0, 12)}
        </Td>
        <Td column="Container ID" className="collapsing">
          {t.Status.ContainerStatus.ContainerID ?
            <Link to={`/containers/${t.Status.ContainerStatus.ContainerID}`}>
              {t.Status.ContainerStatus.ContainerID.substring(0, 12)}
            </Link> :
              <span className="weak">N/A</span>}
            </Td>
            <Td column="Name">
              {services[t.ServiceID] ? `${services[t.ServiceID].Spec.Name}.${t.Slot}` : ''}
            </Td>
            <Td column="Image">
              {t.Spec.ContainerSpec.Image}
            </Td>
            <Td column="Last Status Update" className="collapsing">
              {new Date(t.Status.Timestamp).toLocaleString()}
            </Td>
          </Tr>
    );
  }

  render() {
    const { id } = this.props.params;
    const node = this.props.nodes.data[id];
    const tasks = _.filter(Object.values(this.props.tasks.data), function (t) {
      return t.NodeID === id;
    });

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
            <Column className="eight wide">
              <div className="ui basic segment">
                <div className="ui header">Details</div>
                <div className="ui large horizontal list">
                  <div className="item">
                    <div className="header">State</div>
                    {node.Status.State}
                  </div>
                  <div className="item">
                    <div className="header">Membership</div>
                    {node.Spec.Membership}
                  </div>
                  <div className="item">
                    <div className="header">Role</div>
                    {node.Spec.Role}
                  </div>
                  <div className="item">
                    <div className="header">Availability</div>
                    {node.Spec.Availability}
                  </div>
                  <div className="item">
                    <div className="header">ID</div>
                    {node.ID.substring(0, 12)}
                  </div>
                  <div className="item">
                    <div className="header">Hostname</div>
                    {node.Description.Hostname || 'Unknown'}
                  </div>
                  <div className="item">
                    <div className="header">Platform</div>
                    {node.Description.Platform ? `${node.Description.Platform.OS} ${node.Description.Platform.Architecture}` : 'Unknown'}
                  </div>
                </div>
              </div>
              {
                node.Status.Message ?
                  <div className="ui basic segment">
                    <div className="ui header">Message</div>
                    <pre>{node.Status.Message}</pre>
                  </div>
                  :
                    ''
              }
              {
                node.ManagerStatus ?
                  <div className="ui basic segment">
                    <div className="ui header">Manager Status</div>
                    <div className="ui large horizontal list">
                      <div className="item">
                        <div className="header">Address</div>
                        {node.ManagerStatus.Addr}
                      </div>
                      <div className="item">
                        <div className="header">Reachability</div>
                        {node.ManagerStatus.Reachability}
                      </div>
                      <div className="item">
                        <div className="header">Leader</div>
                        {node.ManagerStatus.Leader ? 'Yes' : 'No'}
                      </div>
                    </div>
                  </div>
                  :
                    ''
              }
              <div className="ui basic segment">
                <div className="ui header">Resources</div>
                <div className="ui large horizontal list">
                  <div className="item">
                    <div className="header">CPU (Nanos)</div>
                    {node.Description.Resources ? `${node.Description.Resources.NanoCPUs}` : 'Unknown'}
                  </div>
                  <div className="item">
                    <div className="header">Memory (Bytes)</div>
                    {node.Description.Resources ? `${node.Description.Resources.MemoryBytes}` : 'Unknown'}
                  </div>
                </div>
              </div>
            </Column>
            <Column className="eight wide">
              <div className="ui basic segment">
                <div className="ui header">Engine</div>
                <div className="ui large horizontal list">
                  <div className="item">
                    <div className="header">Version</div>
                    {node.Description.Engine ? `${node.Description.Engine.EngineVersion}` : 'Unknown'}
                  </div>
                </div>
                <div className="ui header">Plugins</div>
                <div className="ui horizontal large list">
                  {
                    node.Description.Engine && node.Description.Engine.Plugins ?
                      node.Description.Engine.Plugins.map((p) => (
                      <div className="ui item">
                        <div className="header">{p.Name}</div>
                        {p.Type}
                      </div>
                      )) :
                    'No labels found'

                  }
                </div>
                <div className="ui header">Node Labels</div>
                <div className="ui large list">
                  {
                    node.Description.Engine && node.Description.Engine.Labels ?
                      _.keys(node.Description.Engine.Labels).map((l) => (
                      <div className="ui item">
                        <div className="header">{l}</div>
                        {node.Description.Engine.Labels[l]}
                      </div>
                      )) :
                    'No labels found'
                  }
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
                  className="ui compact celled sortable unstackable table"
                  ref="table"
                  sortable
                  filterable={['ID', 'Name', 'Image', 'Command']}
                  hideFilterInput
                  noDataText="Couldn't find any tasks"
                >
                  {tasks.map((t) => this.renderTask(node, t, this.props.services.data))}
                </Table>
              </div>
            </Column>
          </Row>
        </Grid>
      </Container>
    );
  }
}

export default NodeListView;
