import React from 'react';

import { Segment, Grid, Icon } from 'semantic-ui-react';
import { Table, Tr, Td } from 'reactable';
import { Link } from 'react-router';

class ContainerListView extends React.Component {
  constructor(props) {
    super(props);
    this.updateFilter = this.updateFilter.bind(this);
    this.renderContainer = this.renderContainer.bind(this);
  }

  componentDidMount() {
    this.props.fetchContainers();
  }

  updateFilter(input) {
    this.refs.table.filterBy(input.target.value);
  }

  renderContainer(container) {
    return (
      <Tr key={container.Id}>
        <Td column="" className="collapsing">
          <Icon className={`circle ${container.Status.indexOf('Up') === 0 ? 'green' : 'red'}`} />
        </Td>
        <Td column="ID" className="collapsing">
          <Link to={`/containers/${container.Id}`}>{container.Id.substring(0, 12)}</Link>
        </Td>
        <Td column="Image">{container.Image}</Td>
        <Td column="Created" className="collapsing">
          {new Date(container.Created * 1000).toLocaleString()}
        </Td>
        <Td column="Status">{container.Status}</Td>
        <Td column="Name">{container.Names[0]}</Td>
        <Td column="&nbsp;" className="collapsing">
          <div className="ui simple dropdown">
            <i className="dropdown icon"></i>
            <div className="menu">
              <div className="item" onClick={() => this.props.startContainer(container.Id)}>
                <Icon className="green play" />
                Start
              </div>
              <div className="item" onClick={() => this.props.stopContainer(container.Id)}>
                <Icon className="black stop" />
                Stop
              </div>
              <div className="item" onClick={() => this.props.removeContainer(container.Id, true, true)}>
                <Icon className="red remove" />
                Remove
              </div>
            </div>
          </div>
        </Td>
      </Tr>
    );
  }

  render() {
    return (
      <Segment className={`basic ${this.props.services.loading ? 'loading' : ''}`}>
        <Grid>
          <Grid.Row>
            <Grid.Column className="six wide">
              <div className="ui fluid icon input">
                <Icon className="search" />
                <input placeholder="Search..." onChange={this.updateFilter}></input>
              </div>
            </Grid.Column>
            <Grid.Column className="right aligned ten wide" />
          </Grid.Row>
          <Grid.Row>
            <Grid.Column className="sixteen wide">
              <Table
                ref="table"
                className="ui compact celled sortable unstackable table"
                sortable
                filterable={['ID', 'Image', 'Created', 'Status', 'Name']}
                hideFilterInput
                noDataText="Couldn't find any containers"
              >
                {Object.values(this.props.containers.data).map(this.renderContainer)}
              </Table>
            </Grid.Column>
          </Grid.Row>
        </Grid>
      </Segment>
    );
  }
}

export default ContainerListView;
