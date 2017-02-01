import React from 'react';

import { Button, Checkbox, Input, Grid } from 'semantic-ui-react';
import { Table, Tr, Td } from 'reactable';
import { Link } from "react-router-dom";
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

  updateFilter = (input) => {
    this.refs.table.filterBy(input.target.value);
  }

  renderRow = (image, tagIndex) => {
    let selected = this.state.selected.indexOf(image.Id) > -1;
    return (
      <Tr className={selected ? "active" : ""} key={image.Id}>
        <Td column="" className="collapsing">
          <Checkbox checked={selected} onChange={() => { this.selectItem(image.Id) }} />
        </Td>
        <Td column="Repository">
          {image.RepoTags[tagIndex].split(':')[0]}
        </Td>
        <Td column="Tag" value={image.RepoTags[tagIndex].split(':')[1]}>
          <Link to={`/images/inspect/${image.Id}`}>{image.RepoTags[tagIndex].split(':')[1]}</Link>
        </Td>
        <Td column="Image ID" value={image.Id} className="collapsing">
          {image.Id.replace('sha256:', '').substring(0, 12)}
        </Td>
        <Td column="Created" value={image.Created}>
          {new Date(image.Created * 1000).toLocaleString()}
        </Td>
        <Td column="Size" value={image.Size}>
          {getReadableFileSizeString(image.Size)}
        </Td>
      </Tr>
    );
  }

  renderImage = (image) => {
    const rows = [];
    if(image.RepoTags) {
      for (let i = 0; i < image.RepoTags.length; i++) {
        rows.push(this.renderRow(image, i));
      }
    }
    return rows;
  }

  render() {
    const { loading, selected, images } = this.state;

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
            <Table
              ref="table"
              className="ui compact celled unstackable table"
              sortable={['Repository', 'Tag', 'Image ID', 'Created']}
              defaultSort={{column: 'Repository', direction: 'asc'}}
              filterable={['Repository', 'Tag', 'Image ID', 'Created', 'Size']}
              hideFilterInput
              noDataText="Couldn't find any images"
              itemsPerPage={10}
              pageButtonLimit={10}
            >
              {Object.keys(images).map( key => this.renderImage(images[key]) )}
            </Table>
          </Grid.Column>
        </Grid.Row>
      </Grid>
    );
  }
}

export default ImageListView;
