import React from "react";

import { Container, Grid, Segment } from "semantic-ui-react";
import { Link } from "react-router-dom";

import CreateVolumeForm from "./CreateVolumeForm";

const CreateVolumeView = props => (
  <Container>
    <Grid>
      <Grid.Row>
        <Grid.Column width={16}>
          <Segment basic>
            <div className="ui breadcrumb">
              <Link to="/volumes" className="section">Volumes</Link>
              <div className="divider"> / </div>
              <div className="active section">Create a new volume</div>
            </div>
          </Segment>
          <Segment basic>
            <CreateVolumeForm {...props} />
          </Segment>
        </Grid.Column>
      </Grid.Row>
    </Grid>
  </Container>
);

export default CreateVolumeView;
