import React from 'react';

import { Button, Checkbox, /*Input,*/ Grid } from 'semantic-ui-react';
import ReactTable from 'react-table';
import { Link } from 'react-router-dom';
import _ from 'lodash';

import Loader from "../common/Loader";
import { listImages, removeImage } from '../../api';
import { showError, getReadableFileSizeString } from '../../lib';

class ImageListView extends React.Component {
  state = {
    images: [],
    selected: [],
    loading: true,
  };

  componentDidMount() {
    this.getImages()
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

  getImages = () => {
    return listImages()
      .then((images) => {
        this.setState({
          images: images.body,
        });
      })
      .catch((err) => {
        /* TODO: If something went wrong here, should probably redirect to an error page. */
        showError(err);
      });
  };

  removeSelected = () => {
    let promises = _.map(this.state.selected, removeImage);

    this.setState({
      selected: []
    });

    Promise.all(promises)
      .then(() => {
        this.getImages();
      })
      .catch((err) => {
        showError(err);
        this.getImages();
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
  }

  render() {
    const { loading, selected, images } = this.state;

    if(loading) {
      return <Loader />;
    }

    const columns = [{
      render: row => {
        let selected = this.state.selected.indexOf(row.rowValues.Id) > -1;
        return <Checkbox checked={selected} onChange={() => { this.selectItem(row.rowValues.Id) }}
                  className={selected ? "active" : ""} key={row.rowValues.Id}/>
      },
      sortable: false,
      width: 30
    }, {
      header: 'Repository',
      id: 'Repository',
      accessor: d => (d.RepoTags === undefined || d.RepoTags === null) ? '' : d.RepoTags[0],
      render: row => {
        return <span>{row.value.split(':')[0]}</span>
      },
      sortable: true,
      sort: 'asc'
    }, {
      header: 'Tag',
      id: 'Tag',
      accessor: d => (d.RepoTags === undefined || d.RepoTags === null) ? '' : d.RepoTags[0],
      render: row => {
        return <Link to={`/images/inspect/${row.rowValues.Id}`}>{row.value.split(':')[1]}</Link>
      },
      sortable: true,
      sort: 'asc'
    }, {
      header: 'Image ID',
      accessor: 'Id',
      render: row => {
        return <Link to={`/images/inspect/${row.rowValues.Id}`}>{row.value.replace('sha256:', '').substring(0, 12)}</Link>
      },
      sortable: true
     }, {
      header: 'Created',
      accessor: 'Created',
      render: row => {
        return <span>{new Date(row.value * 1000).toLocaleString()}</span>
      },
      sortable: true
    }, {
      header: 'Size',
      accessor: 'Size',
      render: row => {
        return <span>{getReadableFileSizeString(row.value)}</span>
      },
      sortable: true
    }];

    return (
      <Grid padded>
        <Grid.Row>
          <Grid.Column width={6}>
            { /* <Input fluid icon="search" placeholder="Search..." onChange={this.updateFilter} /> */ }
          </Grid.Column>
          <Grid.Column width={10} textAlign="right">
            {
              _.isEmpty(selected) ?
                <Button color="green" icon="add" content="Pull Image" /> :
                <span>
                  <b>{selected.length} Images Selected: </b>
                  <Button color="red" onClick={this.removeSelected} content="Remove" />
                </span>
            }
          </Grid.Column>
        </Grid.Row>
        <Grid.Row>
          <Grid.Column width={16}>
            <ReactTable
                  data={images}
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

export default ImageListView;
