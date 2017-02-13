import React from 'react';

import { Button, Checkbox, /*Input,*/ Grid } from 'semantic-ui-react';
import ReactTable from 'react-table';
import { Link } from "react-router-dom";
import _ from 'lodash';

import Loader from "../common/Loader";
import { listRegistries, removeRegistry } from '../../api';
import { showError } from '../../lib';

class RegistryListView extends React.Component {
  state = {
    registries: [],
    selected: [],
    loading: true,
  };

  componentDidMount() {
    this.getRegistries()
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

  getRegistries = () => {
    return listRegistries()
      .then((registries) => {
        this.setState({
          registries: registries.body,
        });
      })
      .catch((err) => {
        /* TODO: If something went wrong here, should probably redirect to an error page. */
        showError(err);
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

  render() {
    const { loading, registries, selected } = this.state;

    if(loading) {
      return <Loader />;
    }

    const columns = [{
      render: row => {
        let selected = this.state.selected.indexOf(row.row.id) > -1;
        return <Checkbox checked={selected} onChange={() => { this.selectItem(row.row.id) }}
                  className={selected ? "active" : ""} key={row.row.id}/>
      },
      sortable: false,
      width: 30
    }, {
      header: 'ID',
      accessor: 'id',
      render: row => {
        return <Link to={`/registries/inspect/${row.row.id}`}>{row.row.id.substring(0, 8)}</Link>
      },
      sortable: true
    }, {
      header: 'Name',
      accessor: 'name',
      sortable: true,
      sort: 'asc'
    }, {
      header: 'Address',
      accessor: 'addr',
      sortable: true
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
            <ReactTable
                  data={registries}
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

export default RegistryListView;
