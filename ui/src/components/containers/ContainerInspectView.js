import React from 'react';

import { Container, Grid, Message  } from 'semantic-ui-react';
import ContainerInspect from '../containers/ContainerInspect';
import { Link } from 'react-router';
import _ from 'lodash';

import { inspectContainer } from '../../api';

class ContainerListView extends React.Component {
  state = {
    container: null,
    loading: true,
    error: null
  };

  componentDidMount() {
    const { id } = this.props.params;
    inspectContainer(id)
      .then((container) => {
        this.setState({
          error: null,
          container: container.body,
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

  render() {
    const { loading, container, error } = this.state;

    if(loading) {
      return <div></div>;
    }

    return (
      <Container>
        <Grid>
          <Grid.Row>
            <Grid.Column width={16}>
              <div className="ui breadcrumb">
                <Link to="/containers" className="section">Containers</Link>
                <div className="divider"> / </div>
                <div className="active section">{container.Name.substring(1)}</div>
              </div>
            </Grid.Column>
            <Grid.Column className="sixteen wide">
              {error && (<Message error>{error}</Message>)}
              <ContainerInspect container={container} />
            </Grid.Column>
          </Grid.Row>
        </Grid>
      </Container>
    );
  }
}

export default ContainerListView;
