import React from 'react';

import { Container, Grid, Column, Row, Input, Dropdown, Item, Menu, Button, Icon } from 'react-semantify';
import { Table, Tbody, Tr, Td, Thead, Th } from 'reactable';

import _ from 'lodash';

const ImageListView = React.createClass({
  componentDidMount() {
    this.props.fetchImages();
  },

  updateFilter(input) {
    this.refs.table.filterBy(input.target.value);
  },

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
  },

	                    renderImage(image) {
  const rows = [];
  for (var i = 0; i < image.RepoTags.length; i++) {
    rows.push(this.renderRow(image, i));
  }
  return rows;
	},

  render() {
    return (
			<Container>
        <Grid>
          <Row>
            <Column className="six wide">
              <div className="ui fluid icon input">
                <Icon className="search" />
                <input placeholder="Search..." onChange={this.updateFilter}></input>
              </div>
            </Column>
            <Column className="right aligned ten wide">
              <Button className="green" onClick={this.props.showPullImageModal}>
                <Icon className="add" />
                Pull
              </Button>
            </Column>
          </Row>
          <Row>
            <Column className="sixteen wide">
        <Table
          ref="table"
          className="ui compact celled sortable table"
          sortable
          filterable={['Repository', 'Tag', 'Image ID', 'Created', 'Size']}
          hideFilterInput
          noDataText="Couldn't find any images"
        >
						{this.props.images ? this.props.images.map(this.renderImage) : []}
				</Table>
            </Column>
          </Row>
        </Grid>
			</Container>
    );
  },
});

export default ImageListView;
