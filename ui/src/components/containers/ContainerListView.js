import React from 'react';

import { Message, Input, Grid, Icon } from 'semantic-ui-react';
import { Table, Tr, Td } from 'reactable';
import { Link } from 'react-router';

import { listContainers } from '../../api';
import { shortenImageName } from '../../lib';

class ContainerListView extends React.Component {
  state = {
    error: null,
    containers: [],
    loading: true,
  };

  componentDidMount() {
    listContainers()
      .then((containers) => {
        this.setState({
          error: null,
          containers: containers.body,
          loading: false,
        });
      })
      .catch((error) => {
        this.setState({
          error,
          loading: false,
        });
      });
  }

  updateFilter = (input) => {
    this.refs.table.filterBy(input.target.value);
  };

  renderContainer = (container) => {
    return (
      <Tr key={container.Id}>
        <Td column="" className="collapsing">
          <Icon fitted className={`circle ${container.Status.indexOf('Up') === 0 ? 'green' : 'red'}`} />
        </Td>
        <Td column="ID" className="collapsing">
          <Link to={`/containers/inspect/${container.Id}`}>{container.Id.substring(0, 12)}</Link>
        </Td>
        <Td column="Image">{shortenImageName(container.Image)}</Td>
        <Td column="Created" className="collapsing">
          {new Date(container.Created * 1000).toLocaleString()}
        </Td>
        <Td column="Name">{container.Names[0]}</Td>
      </Tr>
    );
  }

  render() {
    const { loading, error, containers } = this.state;

    if(loading) {
      return <div></div>;
    }

    return (
      <Grid padded>
        <Grid.Row>
          <Grid.Column width={6}>
            <Input fluid icon="search" placeholder="Search..." onChange={this.updateFilter} />
          </Grid.Column>
          <Grid.Column width={10} textAlign="right">
            { /* _.isEmpty(selected) ?
              <Button as={Link} to="/containers/create" color="green" icon="add" content="Create" /> :
              <span>
                <b>{selected.length} Containers Selected: </b>
                <Button color="red" onClick={this.removeSelected} content="Remove" />
              </span>
            */}
          </Grid.Column>
        </Grid.Row>
        <Grid.Row>
          <Grid.Column width={16}>
            {error && (<Message error>{error}</Message>)}
            <Table
              ref="table"
              className="ui compact celled sortable unstackable table"
              sortable
              filterable={["ID", "Image", "Created", "Name"]}
              hideFilterInput
              noDataText="Couldn't find any containers"
            >
              {Object.keys(containers).map( key => this.renderContainer(containers[key] ))}
            </Table>
          </Grid.Column>
        </Grid.Row>
      </Grid>
    );
  }
}

export default ContainerListView;
