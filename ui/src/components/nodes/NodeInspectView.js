import React from 'react';

import { Container, Grid, Column, Row, Icon } from 'react-semantify';
import { Table, Tr, Td } from 'reactable';
import TaskStates from '../services/TaskStates';
import { Link } from 'react-router';
import _ from 'lodash';
import moment from 'moment';

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
            <Column className="sixteen wide basic ui segment">
              <div className="ui header">Details</div>
              <table className="ui very basic celled table">
                <tbody>
                  <tr><td className="four wide column">ID</td><td>{node.ID.substring(0, 12)}</td></tr>
                  <tr><td>Role</td><td>{node.Spec.Role}</td></tr>
                  <tr><td>Hostname</td><td>{node.Description.Hostname}</td></tr>
                  <tr><td>OS</td><td>{node.Description.Platform.OS}</td></tr>
                  <tr><td>Architecture</td><td>{node.Description.Platform.Architecture}</td></tr>
                  <tr><td>Engine</td><td>{node.Description.Engine ? node.Description.Engine.EngineVersion : 'Unknown'}</td></tr>
                  <tr><td>Created</td><td>{moment(node.CreatedAt).toString()}</td></tr>
                  <tr><td>Last Updated</td><td>{moment(node.UpdatedAt).toString()}</td></tr>
                </tbody>
              </table>
              <div className="ui header">Status</div>
              <table className="ui very basic celled table">
                {
                  node.ManagerStatus ?
                    <tbody>
                      <tr><td className="four wide column">State</td><td>{node.Status.State}</td></tr>
                      <tr><td>Availability</td><td>{node.Spec.Availability}</td></tr>
                      <tr><td>Message</td><td>{node.Status.Message}</td></tr>
                      <tr><td>Address</td><td>{node.ManagerStatus.Addr}</td></tr>
                      <tr><td>Reachability</td><td>{node.ManagerStatus.Reachability}</td></tr>
                      <tr><td>Leader</td><td>{node.ManagerStatus.Leader ? 'Yes' : 'No'}</td></tr>
                    </tbody>
                    :
                    <tbody>
                      <tr><td className="four wide column">State</td><td>{node.Status.State}</td></tr>
                      <tr><td>Availability</td><td>{node.Spec.Availability}</td></tr>
                      <tr><td>Message</td><td>{node.Status.Message}</td></tr>
                    </tbody>
                }
              </table>
              <div className="ui header">Resources</div>
              <table className="ui very basic celled table">
                <tbody>
                  <tr><td className="four wide column">CPU (Nanos)</td><td>{node.Description.Resources ? `${node.Description.Resources.NanoCPUs}` : 'Unknown'}</td></tr>
                  <tr><td>Memory (Bytes)</td><td>{node.Description.Resources ? `${node.Description.Resources.MemoryBytes}` : 'Unknown'}</td></tr>
                </tbody>
              </table>
              <div className="ui header">Plugins</div>
              <table className="ui very basic celled table">
                <tbody>
                {
                  node.Description.Engine && node.Description.Engine.Plugins ?
                    node.Description.Engine.Plugins.map((p) => (
                    <tr key={p.Name}>
                      <td className="four wide column">{p.Name}</td>
                      <td>{p.Type}</td>
                    </tr>
                    )) : (
                      <tr><td>No plugins found</td></tr>
                    )
                }
                </tbody>
              </table>
              <div className="ui header">Node Labels</div>
              <table className="ui very basic celled table">
                <tbody>
                {
                  node.Description.Engine && node.Description.Engine.Labels ?
                    _.keys(node.Description.Engine.Labels).map((l) => (
                      <tr key={l}>
                        <td>{l}</td><td>{node.Description.Engine.Labels[l]}</td>
                      </tr>
                    )) : (
                      <tr><td>No labels found</td></tr>
                    )
                }
                </tbody>
              </table>
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
