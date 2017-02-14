import React from 'react';

import { Button, Checkbox, /*Input,*/ Grid } from 'semantic-ui-react';
import ReactTable from 'react-table';
import { Link } from "react-router-dom";
import _ from 'lodash';

import Loader from "../common/Loader";
import { listSecrets, removeSecret } from '../../api';
import { showError } from '../../lib';

class SecretListView extends React.Component {
  state = {
    secrets: [],
    selected: [],
    loading: true,
  };

  componentDidMount() {
    this.getSecrets()
      .then(() => {
        this.setState({
          loading: false,
        });
      })
      .catch(() => {
        this.setState({
          loading: false,
        });
      });
  }

  getSecrets = () => {
    return listSecrets()
      .then((secrets) => {
        this.setState({
          secrets: secrets.body,
        });
      })
      .catch((err) => {
        /* TODO: If something went wrong here, should probably redirect to an error page. */
        showError(err);
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

  render() {
    const { loading, secrets, selected } = this.state;

    if(loading) {
      return <Loader />;
    }

    const columns = [{
      render: row => {
        let selected = this.state.selected.indexOf(row.row.Id) > -1;
        return <Checkbox checked={selected} onChange={() => { this.selectItem(row.row.Id) }}
                  className={selected ? "active" : ""} key={row.row.Id}/>
      },
      sortable: false,
      width: 30
    }, {
      header: 'ID',
      accessor: 'ID',
      render: row => {
        return <Link to={`/secrets/inspect/${row.row.ID}`}>{row.row.ID.substring(0, 12)}</Link>

      },
      sortable: true
    }, {
      header: 'Name',
      accessor: 'Name',
      sortable: true,
      sort: 'asc'
    }];

    return (
      <Grid padded>
        <Grid.Row>
          <Grid.Column width={6}>
            { /*<Input fluid icon="search" placeholder="Search..." onChange={this.updateFilter} />*/ }
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
            <ReactTable
                  data={secrets}
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

export default SecretListView;
