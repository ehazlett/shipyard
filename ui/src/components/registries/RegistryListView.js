import React from 'react';

import { Button, Checkbox, Input, Grid } from 'semantic-ui-react';
import { Table, Tr, Td } from 'reactable';
import { Link } from "react-router-dom";
import _ from 'lodash';

import { listRegistries, removeRegistry } from '../../api';
import { showError } from '../../lib';

class RegistryListView extends React.Component {
  state = {
    registries: [],
    selected: [],
    loading: true,
  };

  componentDidMount() {
    this.getRegistries();
  }

  getRegistries = () => {
    listRegistries()
      .then((registries) => {
        this.setState({
          registries: registries.body,
          loading: false,
        });
      })
      .catch((err) => {
        /* TODO: If something went wrong here, should probably redirect to an error page. */
        showError(err);
        this.setState({
          loading: false,
        });
      });
  };

  removeSelected = () => {
    let promises = _.map(this.state.selected, removeRegistry);

    this.setState({
      selected: []
    });

    Promise.all(promises)
      .then(() => {
        this.getRegistries();
      })
      .catch((err) => {
        showError(err);
        this.getRegistries();
      });
  }

  selectItem = (id) => {
    let i = this.state.selected.indexOf(id);
    if (i > -1) {
      this.setState({
        selected: this.state.selected.slice(i+1, 1)
      });
    } else {
      this.setState({
        selected: [...this.state.selected, id]
      });
    }
  }

  updateFilter = (input) => {
    this.refs.table.filterBy(input.target.value);
  }

  renderRow = (registry, tagIndex) => {
    let selected = this.state.selected.indexOf(registry.id) > -1;
    return (
      <Tr key={registry.id}>
        <Td column="" className="collapsing">
          <Checkbox checked={selected} onChange={() => { this.selectItem(registry.id) }} />
        </Td>
        <Td column="ID" value={registry.id} className="collapsing">
          <Link to={`/registries/inspect/${registry.id}`}>
            {registry.id.substring(0, 8)}
          </Link>
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
    const { loading, registries, selected } = this.state;

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
            {
              _.isEmpty(selected) ?
                <Button as={Link} to="/registries/add" color="green" icon="add" content="Add" /> :
                <span>
                  <b>{selected.length} Registries Selected: </b>
                  <Button color="red" onClick={this.removeSelected} content="Remove" />
                </span>
            }
          </Grid.Column>
        </Grid.Row>
        <Grid.Row>
          <Grid.Column width={16}>
            <Table
              ref="table"
              className="ui compact celled unstackable table"
              sortable={["ID", "Name", "Address"]}
              defaultSort={{column: 'Name', direction: 'asc'}}
              filterable={["ID", "Name", "Address"]}
              hideFilterInput
              noDataText="Couldn't find any registries"
            >
              {registries.map(this.renderRow)}
            </Table>
          </Grid.Column>
        </Grid.Row>
      </Grid>
    );
  }
}

export default RegistryListView;
