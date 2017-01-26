import React from 'react';

import { Message, Segment, Grid, Icon } from 'semantic-ui-react';
import { Table, Tr, Td } from 'reactable';
import { Link } from 'react-router';

import { listRegistries } from '../../api';

class RegistryListView extends React.Component {
  state = {
    error: null,
    registries: [],
    loading: true,
  };

  componentDidMount() {
    listRegistries()
      .then((registries) => {
        this.setState({
          error: null,
          registries: registries.body,
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
  }

  renderRow = (registry, tagIndex) => {
    return (
      <Tr key={registry.id}>
        <Td column="ID" className="collapsing">
          {registry.id.substring(0, 12)}
        </Td>
        <Td column="Name">
          {registry.name}
        </Td>
        <Td column="Address">
          {registry.addr}
        </Td>
      </Tr>
    );
  }

  renderRegistry = (registry) => {
    const rows = [];
    if(registry.RepoTags) {
      for (let i = 0; i < registry.RepoTags.length; i++) {
        rows.push(this.renderRow(registry, i));
      }
    }
    return rows;
  }

  render() {
    const { loading, error, registries } = this.state;

    if(loading) {
      return <div></div>;
    }

    return (
      <Segment basic>
        <Grid>
          <Grid.Row>
            <Grid.Column width={6}>
              <div className="ui fluid icon input">
                <Icon className="search" />
                <input placeholder="Search..." onChange={this.updateFilter}></input>
              </div>
            </Grid.Column>
            <Grid.Column width={10} textAlign="right">
              <Link to="/registries/add" className="ui green button">
                <Icon className="add" />
                Add
              </Link>
            </Grid.Column>
          </Grid.Row>
          <Grid.Row>
            <Grid.Column width={16}>
              {error && (<Message error>{error}</Message>)}
              <Table
                ref="table"
                className="ui compact celled sortable unstackable table"
                sortable
                filterable={["ID", "Name", "Address"]}
                hideFilterInput
                noDataText="Couldn't find any registries"
              >
                {registries.map(this.renderRow)}
              </Table>
            </Grid.Column>
          </Grid.Row>
        </Grid>
      </Segment>
    );
  }
}

export default RegistryListView;
