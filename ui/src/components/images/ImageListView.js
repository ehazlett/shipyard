import React from 'react';

import { Button, Checkbox, Input, Grid } from 'semantic-ui-react';
import ReactTable from 'react-table'
import { Link } from 'react-router-dom';
import _ from 'lodash';

import { listImages, removeImage } from '../../api';
import { showError, getReadableFileSizeString } from '../../lib';

class ImageListView extends React.Component {
  state = {
    images: [],
    selected: [],
    loading: true,
  };

  componentDidMount() {
    this.getImages();
  }

  getImages = () => {
    return listImages()
      .then((images) => {
        this.setState({
          images: images.body,
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

  render() {
    const { loading, selected, images } = this.state;

    if(loading) {
      return <div></div>;
    }

    const columns = [{
      header: 'Repository',
      accessor: 'RepoTags[0]',
      render: row => {
        return <span>{row.value.split(':')[0]}</span>
      },
      sortable: true,
      sort: 'asc'
    }, {
      header: 'Tag',
      accessor: 'RepoTags[0]',
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
    }]

    return (
      <Grid padded>
        <Grid.Row>
          <Grid.Column width={6}>
            <Input fluid icon="search" placeholder="Search..." onChange={this.updateFilter} />
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
            {error && (<Message error>{error}</Message>)}
            <ReactTable
                  data={images}
                  columns={columns}
                  defaultPageSize={10}
                  pageSize={10}
              />
          </Grid.Column>
        </Grid.Row>
      </Grid>
    );
  }
}

export default ImageListView;
