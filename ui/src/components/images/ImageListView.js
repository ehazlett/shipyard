import React from 'react';

import { Segment, Grid, Icon } from 'semantic-ui-react';
import { Table, Tr, Td } from 'reactable';

class ImageListView extends React.Component {

  componentDidMount() {
    this.props.fetchImages();
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
          {image.RepoTags[tagIndex].split(':')[1]}
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
        <Td column="&nbsp;" className="collapsing">
          <div className="ui simple dropdown">
            <i className="dropdown icon"></i>
            <div className="menu">
              <div className="item" onClick={() => this.props.removeImage(image.Id)}>
                <Icon className="red remove" />
                Remove
              </div>
            </div>
          </div>
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
    return (
      <Segment className={`basic ${this.props.services.loading ? 'loading' : ''}`}>
        <Grid>
          <Grid.Row>
            <Grid.Column className="six wide">
              <div className="ui fluid icon input">
                <Icon className="search" />
                <input placeholder="Search..." onChange={this.updateFilter}></input>
              </div>
            </Grid.Column>
            <Grid.Column className="right aligned ten wide" />
          </Grid.Row>
          <Grid.Row>
            <Grid.Column className="sixteen wide">
              <Table
                ref="table"
                className="ui compact celled sortable unstackable table"
                sortable
                filterable={['Repository', 'Tag', 'Image ID', 'Created', 'Size']}
                hideFilterInput
                noDataText="Couldn't find any images"
              >
                {Object.values(this.props.images.data).map(this.renderImage)}
              </Table>
            </Grid.Column>
          </Grid.Row>
        </Grid>
      </Segment>
    );
  }
}

export default ImageListView;
