import React from 'react';

import { Table, Tr, Td } from 'reactable';
import { Grid, Message  } from 'semantic-ui-react';
import { Link } from 'react-router';
import _ from 'lodash';

import { repositoriesRegistry, inspectRegistry } from '../../api';

class RegistryInspectView extends React.Component {
  state = {
    registry: null,
    repositories: null,
    loading: true,
    error: null
  };

  componentDidMount() {
    const { id } = this.props.params;
    inspectRegistry(id)
      .then((registry) => {
        this.setState({
          error: null,
          registry: registry.body,
          loading: false,
        });
      })
      .catch((error) => {
        this.setState({
          error,
          loading: false,
        });
      });

    repositoriesRegistry(id)
      .then((repositories) => {
        this.setState({
          error: null,
          repositories: repositories.body,
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

  renderRepo = (repo) => {
    return (
      <Tr key={`${repo.name}:${repo.tag}`}>
        <Td column="Name">{repo.name}</Td>
        <Td column="Tag">{repo.tag}</Td>
      </Tr>
    );
  };

  render() {
    const { loading, registry, repositories, error } = this.state;

    if(loading) {
      return <div></div>;
    }

    return (
      <Grid padded>
        <Grid.Row>
          <Grid.Column width={16}>
            <div className="ui breadcrumb">
              <Link to="/registries" className="section">Registries</Link>
              <div className="divider"> / </div>
              <div className="active section">{registry.id.substring(0, 8)}</div>
            </div>
          </Grid.Column>
          <Grid.Column className="ui sixteen wide basic segment">
            {error && (<Message error>{error}</Message>)}
            <div className="ui header">Details</div>
            <table className="ui very basic celled table">
              <tbody>
                <tr><td className="four wide column">Id</td><td>{registry.id}</td></tr>
                <tr><td>Name</td><td>{registry.name}</td></tr>
                <tr><td>Address</td><td>{registry.addr}</td></tr>
              </tbody>
            </table>
          </Grid.Column>
          <Grid.Column className="ui sixteen wide basic segment">
            <Table
              ref="table"
              className="ui compact celled unstackable table"
              defaultSort={{column: 'Name', direction: 'asc'}}
              sortable={["Name", "Tag"]}
              filterable={["Name"]}
              hideFilterInput
              noDataText="Couldn't find any registries"
            >
              { !_.isEmpty(repositories) ? repositories.map(this.renderRepo) : null }
            </Table>
          </Grid.Column>
        </Grid.Row>
      </Grid>
    );
  }
}

export default RegistryInspectView;
