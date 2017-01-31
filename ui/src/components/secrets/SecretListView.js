import React from 'react';

import { Button, Checkbox, Input, Grid } from 'semantic-ui-react';
import { Table, Tr, Td } from 'reactable';
import { Link } from "react-router-dom";
import _ from 'lodash';

import { listSecrets, removeSecret } from '../../api';
import { showError } from '../../lib';

class SecretListView extends React.Component {
  state = {
    secrets: [],
    selected: [],
    loading: true,
  };

  componentDidMount() {
    this.getSecrets();
  }

  getSecrets = () => {
    listSecrets()
      .then((secrets) => {
        this.setState({
          secrets: secrets.body,
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
    let promises = _.map(this.state.selected, removeSecret);

    this.setState({
      selected: []
    });

    Promise.all(promises)
      .then(() => {
        this.getSecrets();
      })
      .catch((err) => {
        showError(err);
        this.getSecrets();
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

  renderRow = (secret, tagIndex) => {
    let selected = this.state.selected.indexOf(secret.ID) > -1;
    return (
      <Tr className={selected ? "active" : ""} key={secret.ID}>
        <Td column="" className="collapsing">
          <Checkbox checked={selected} onChange={() => { this.selectItem(secret.ID) }} />
        </Td>
        <Td column="ID" value={secret.ID} className="collapsing">
          <Link to={`/secrets/inspect/${secret.ID}`}>
            {secret.ID.substring(0, 12)}
          </Link>
        </Td>
        <Td column="Name">
          {secret.Spec.Name}
        </Td>
      </Tr>
    );
  }

  renderSecret = (secret) => {
    const rows = [];
    if(secret.RepoTags) {
      for (let i = 0; i < secret.RepoTags.length; i++) {
        rows.push(this.renderRow(secret, i));
      }
    }
    return rows;
  }

  render() {
    const { loading, secrets, selected } = this.state;

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
                <Button as={Link} to="/secrets/create" color="green" icon="add" content="Create" /> :
                <span>
                  <b>{selected.length} Secrets Selected: </b>
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
              sortable={["ID", "Name"]}
              defaultSort={{column: 'Name', direction: 'asc'}}
              filterable={["ID", "Name"]}
              hideFilterInput
              noDataText="Couldn't find any secrets"
            >
              {secrets.map(this.renderRow)}
            </Table>
          </Grid.Column>
        </Grid.Row>
      </Grid>
    );
  }
}

export default SecretListView;
