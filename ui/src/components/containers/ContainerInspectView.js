import React from 'react';

import { Segment, Container, Grid } from 'semantic-ui-react';
import { Link } from "react-router-dom";
import _ from 'lodash';

import ContainerInspect from './ContainerInspect';
import { inspectContainer } from '../../api';

class ContainerInspectView extends React.Component {
  state = {
    container: null,
    loading: true,
    error: null,
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
    const { loading, container } = this.state;

    if(loading) {
      return <div></div>;
    }

    return (
      <Container>
        <Grid>
          <Grid.Row>
            <Grid.Column width={16}>
              <Segment basic>
                <div className="ui breadcrumb">
                  <Link to="/containers" className="section">Containers</Link>
                  <div className="divider"> / </div>
                  <div className="active section">{container.Name.substring(1)}</div>
                </div>
              </Segment>
              <ContainerInspect container={container} />
            </Grid.Column>
          </Grid.Row>
        </Grid>
      </Container>
    );
  }
}

export default ContainerInspectView;
