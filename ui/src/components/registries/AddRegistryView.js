import React from "react";

import { Container, Grid, Segment } from "semantic-ui-react";
import { Link } from "react-router-dom";

import AddRegistryForm from "./AddRegistryForm";

const AddRegistryView = props => (
  <Container>
    <Grid>
      <Grid.Row>
        <Grid.Column width={16}>
          <Segment basic>
            <div className="ui breadcrumb">
              <Link to="/registries" className="section">Registries</Link>
              <div className="divider"> / </div>
              <div className="active section">Create a new registry</div>
            </div>
          </Segment>
          <Segment basic>
            <AddRegistryForm {...props} />
          </Segment>
        </Grid.Column>
      </Grid.Row>
    </Grid>
  </Container>
);

export default AddRegistryView;
