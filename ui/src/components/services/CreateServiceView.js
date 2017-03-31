import React from "react";

import { Container, Grid, Segment } from "semantic-ui-react";
import { Link } from "react-router-dom";

import CreateServiceForm from "./CreateServiceForm";

const CreateServiceView = props => (
  <Container>
    <Grid>
      <Grid.Row>
        <Grid.Column width={16}>
          <Segment basic>
            <div className="ui breadcrumb">
              <Link to="/services" className="section">Services</Link>
              <div className="divider"> / </div>
              <div className="active section">Create a new service</div>
            </div>
          </Segment>
          <Segment basic>
            <CreateServiceForm {...props} />
          </Segment>
        </Grid.Column>
      </Grid.Row>
    </Grid>
  </Container>
);

export default CreateServiceView;
