import React, { PropTypes } from 'react';

import { Segment, Grid, Column, Row, Icon } from 'react-semantify';
import { Table, Tr, Td } from 'reactable';

class ImageListView extends React.Component {

  constructor(props) {
    super(props);

    this.updateFilter = this.updateFilter.bind(this);
    this.renderRow = this.renderRow.bind(this);
    this.renderImage = this.renderImage.bind(this);
  }

  componentDidMount() {
    this.props.fetchImages();
  }

  updateFilter(input) {
    this.refs.table.filterBy(input.target.value);
  }

  renderRow(image, tagIndex) {
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
      </Tr>
    );
  }

  renderImage(image) {
    const rows = [];
    for (let i = 0; i < image.RepoTags.length; i++) {
      rows.push(this.renderRow(image, i));
    }
    return rows;
  }

  render() {
    return (
      <Segment className={`basic ${this.props.services.loading ? 'loading' : ''}`}>
        <Grid>
          <Row>
            <Column className="six wide">
              <div className="ui fluid icon input">
                <Icon className="search" />
                <input placeholder="Search..." onChange={this.updateFilter}></input>
              </div>
            </Column>
            <Column className="right aligned ten wide" />
          </Row>
          <Row>
            <Column className="sixteen wide">
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
            </Column>
          </Row>
        </Grid>
      </Segment>
    );
  }
}

// ImageListView.propTypes = {
//   fetchImages: PropTypes.func.isRequired,
//   images: PropTypes.array.isRequired,
// };

export default ImageListView;
