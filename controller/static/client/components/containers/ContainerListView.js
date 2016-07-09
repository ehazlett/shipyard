import React, { PropTypes } from 'react';

import { Container, Grid, Column, Row, Icon } from 'react-semantify';
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
        <Td column="Command">{container.Command}</Td>
        <Td column="Created" className="collapsing">
          {new Date(container.Created * 1000).toLocaleString()}
        </Td>
        <Td column="Status">{container.Status}</Td>
        <Td column="Name">{container.Names[0]}</Td>
      </Tr>
    );
  }

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
            <Column className="right aligned ten wide" />
          </Row>
          <Row>
            <Column className="sixteen wide">
              <Table
                ref="table"
                className="ui compact celled sortable unstackable table"
                sortable
                filterable={['ID', 'Image', 'Command', 'Created', 'Status', 'Name']}
                hideFilterInput
                noDataText="Couldn't find any containers"
              >
                {this.props.containers ? this.props.containers.map(this.renderContainer) : []}
              </Table>
            </Column>
          </Row>
        </Grid>
      </Container>
    );
  }
}

// ContainerListView.propTypes = {
//   fetchContainers: PropTypes.func.isRequired,
//   containers: PropTypes.array.isRequired,
// };

export default ContainerListView;
