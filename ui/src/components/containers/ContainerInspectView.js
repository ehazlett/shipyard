import React from 'react';

import { Container, Grid,  } from 'semantic-ui-react';
import ContainerInspect from '../containers/ContainerInspect';
import { Link } from 'react-router';
import _ from 'lodash';

class ContainerListView extends React.Component {
  componentDidMount() {
    this.props.fetchContainers();
  }

  render() {
    const { id } = this.props.params;
    const container = this.props.containers.data[id];
    if (!container) return (<div></div>);

    return (
      <Container>
        <Grid>
          <Grid.Row>
            <Grid.Column className="sixteen wide basic ui segment">
              <div className="ui breadcrumb">
                <Link to="/containers" className="section">Containers</Link>
                <div className="divider"> / </div>
                <div className="active section">{container ? container.Names[0] : ''}</div>
              </div>
            </Grid.Column>
            <Grid.Column className="sixteen wide">
              <ContainerInspect container={container} />
            </Grid.Column>
          </Grid.Row>
        </Grid>
      </Container>
    );
  }
}

export default ContainerListView;

