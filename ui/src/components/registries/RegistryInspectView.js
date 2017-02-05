import React from 'react';

import ReactTable from 'react-table';
import { Grid } from 'semantic-ui-react';
import { Link } from "react-router-dom";
import _ from 'lodash';

import Loader from "../common/Loader";
import { repositoriesRegistry, inspectRegistry } from '../../api';
import { showError } from '../../lib';

class RegistryInspectView extends React.Component {
  state = {
    registry: null,
    repositories: null,
    loading: true,
  };

  componentDidMount() {
    Promise.all([
      this.getRepos(),
      this.getRegistry(),
    ])
      .then(() => {
        this.setState({
          loading: false,
        });
      })
      .catch(() => {
        this.setState({
          loading: false,
        });
      })
  }

  getRepos = () => {
    const { id } = this.props.match.params;
    return repositoriesRegistry(id)
      .then((repositories) => {
        this.setState({
          repositories: repositories.body,
        });
      })
      .catch((err) => {
        showError(err);
      });
  }

  getRegistry = () => {
    const { id } = this.props.match.params;
    return inspectRegistry(id)
      .then((registry) => {
        this.setState({
          registry: registry.body,
        });
      })
      .catch((err) => {
        showError(err);
      });
  }

  render() {
    const { loading, registry, repositories } = this.state;

    if(loading) {
      return <Loader />;
    }

    const columns = [{
      header: 'Name',
      accessor: 'name',
      sortable: true,
      sort: 'asc'
    }, {
      header: 'Tag',
      accessor: 'tag',
      sortable: true
    }];

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
            <ReactTable
              data={repositories}
              columns={columns}
              defaultPageSize={10}
              pageSize={10}
              minRows={0}
              />
          </Grid.Column>
        </Grid.Row>
      </Grid>
    );
  }
}

export default RegistryInspectView;
