import React from 'react';

import { Message, Segment, Grid, Icon } from 'semantic-ui-react';
import { Table, Tr, Td } from 'reactable';
import { Link } from 'react-router';

import { listSecrets } from '../../api';

class SecretListView extends React.Component {
  state = {
    error: null,
    secrets: [],
    loading: true,
  };

  componentDidMount() {
    listSecrets()
      .then((secrets) => {
        this.setState({
          error: null,
          secrets: secrets.body,
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

  renderRow = (secret, tagIndex) => {
    return (
      <Tr key={secret.ID}>
        <Td column="ID" className="collapsing">
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
    const { loading, error, secrets } = this.state;

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
            <Grid.Column width={10} />
          </Grid.Row>
          <Grid.Row>
            <Grid.Column width={16}>
              {error && (<Message error>{error}</Message>)}
              <Table
                ref="table"
                className="ui compact celled sortable unstackable table"
                sortable
                filterable={["ID", "Name"]}
                hideFilterInput
                noDataText="Couldn't find any secrets"
              >
                {secrets.map(this.renderRow)}
              </Table>
            </Grid.Column>
          </Grid.Row>
        </Grid>
      </Segment>
    );
  }
}

export default SecretListView;
