import React from "react";

import { Container, Grid, Segment } from "semantic-ui-react";
import { Link } from "react-router-dom";

import CreateNetworkForm from "./CreateNetworkForm";

const CreateNetworkView = props => (
  <Container>
    <Grid>
      <Grid.Row>
        <Grid.Column width={16}>
          <Segment basic>
            <div className="ui breadcrumb">
              <Link to="/networks" className="section">Networks</Link>
              <div className="divider"> / </div>
              <div className="active section">Create a new network</div>
            </div>
          </Segment>
          <Segment basic>
            <CreateNetworkForm {...props} />
          </Segment>
        </Grid.Column>
      </Grid.Row>
    </Grid>
  </Container>
);

export default CreateNetworkView;
