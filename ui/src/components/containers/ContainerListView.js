import React from 'react';

import { Button, Checkbox, Input, Grid, Icon } from 'semantic-ui-react';
import { Table, Tr, Td } from 'reactable';
import { Link } from "react-router-dom";
import _ from 'lodash';

import { listContainers, removeContainer } from '../../api';
import { shortenImageName, showError } from '../../lib';

class ContainerListView extends React.Component {
  state = {
    containers: [],
    selected: [],
    loading: true,
  };

  componentDidMount() {
    this.getContainers();
  }

  getContainers = () => {
    return listContainers(true)
      .then((containers) => {
        this.setState({
          containers: containers.body,
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
  }

  removeSelected = () => {
    let promises = _.map(this.state.selected, removeContainer);

    this.setState({
      selected: []
    });

    Promise.all(promises)
      .then(() => {
        this.getContainers();
      })
      .catch((err) => {
        showError(err);
        this.getContainers();
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
  };

  renderContainer = (container) => {
    let selected = this.state.selected.indexOf(container.Id) > -1;
    return (
      <Tr className={selected ? "active" : ""} key={container.Id}>
        <Td column="&nbsp;" className="collapsing">
          <Checkbox checked={selected} onChange={() => { this.selectItem(container.Id) }} />
        </Td>
        <Td column="" className="collapsing">
          <Icon fitted className={`circle ${container.Status.indexOf('Up') === 0 ? 'green' : 'red'}`} />
        </Td>
        <Td column="ID" value={container.Id} className="collapsing">
          <Link to={`/containers/inspect/${container.Id}`}>{container.Id.substring(0, 12)}</Link>
        </Td>
        <Td column="Image" value={container.Image}>
          {shortenImageName(container.Image)}
        </Td>
        <Td column="Created" value={container.Created} className="collapsing">
          {new Date(container.Created * 1000).toLocaleString()}
        </Td>
        <Td column="Name">{container.Names[0]}</Td>
      </Tr>
    );
  }

  render() {
    const { loading, selected, containers } = this.state;

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
                <Button as={Link} to="/containers/create" color="green" icon="add" content="Create" /> :
                <span>
                  <b>{selected.length} Containers Selected: </b>
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
              sortable={["ID", "Image", "Created", "Name"]}
              defaultSort={{column: "Name", direction: "asc"}}
              filterable={["ID", "Image", "Created", "Name"]}
              hideFilterInput
              noDataText="Couldn't find any containers"
            >
              {Object.keys(containers).map( key => this.renderContainer(containers[key] ))}
            </Table>
          </Grid.Column>
        </Grid.Row>
      </Grid>
    );
  }
}

export default ContainerListView;
