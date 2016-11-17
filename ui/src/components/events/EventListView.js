import React from 'react';

import { Container, Grid, Icon } from 'semantic-ui-react';
import { Table, Tr, Td } from 'reactable';

class EventListView extends React.Component {
  constructor(props) {
    super(props);
    this.updateFilter = this.updateFilter.bind(this);
    this.renderEvent = this.renderEvent.bind(this);
  }

  updateFilter(input) {
    this.refs.table.filterBy(input.target.value);
  }

  renderEvent(event) {
    return (
      <Tr key={event.id}>
        <Td column="Time" className="collapsing">{new Date(event.time * 1000).toLocaleString()}</Td>
        <Td column="Type" className="collapsing">{event.Type}</Td>
        <Td column="Action" className="collapsing">{event.Action}</Td>
        <Td column="Name">{event.Actor.Attributes.name}</Td>
      </Tr>
    );
  }

  render() {
    return (
      <Container>
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
                filterable={['Time', 'Type', 'Name', 'Action']}
                hideFilterInput
                noDataText="Couldn't find any events"
              >
                {this.props.events.map(this.renderEvent)}
              </Table>
            </Grid.Column>
          </Grid.Row>
        </Grid>
      </Container>
    );
  }
}

export default EventListView;
