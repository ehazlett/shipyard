import React from 'react';

import { Message, Segment, Grid, Icon } from 'semantic-ui-react';
import { Table, Tr, Td } from 'reactable';
import { Link } from 'react-router';

import { listImages } from '../../api';

class ImageListView extends React.Component {
  state = {
    error: null,
    images: [],
    loading: true,
  };

  componentDidMount() {
    listImages()
      .then((images) => {
        this.setState({
          error: null,
          images: images.body,
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

  renderRow = (image, tagIndex) => {
    return (
      <Tr key={image.Id}>
        <Td column="Repository">
          {image.RepoTags[tagIndex].split(':')[0]}
        </Td>
        <Td column="Tag">
          <Link to={`/images/${image.Id}`}>{image.RepoTags[tagIndex].split(':')[1]}</Link>
        </Td>
        <Td column="Image ID" className="collapsing">
          {image.Id.replace('sha256:', '').substring(0, 12)}
        </Td>
        <Td column="Created">
          {new Date(image.Created * 1000).toLocaleString()}
        </Td>
        <Td column="Size">
          {image.Size}
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
    const { loading, error, images } = this.state;

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
                filterable={['Repository', 'Tag', 'Image ID', 'Created', 'Size']}
                hideFilterInput
                noDataText="Couldn't find any images"
              >
                {Object.keys(images).map( key => this.renderImage(images[key]) )}
              </Table>
            </Grid.Column>
          </Grid.Row>
        </Grid>
      </Segment>
    );
  }
}

export default ImageListView;
