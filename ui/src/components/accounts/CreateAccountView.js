import React from 'react';

import { Container, Grid, Segment } from 'semantic-ui-react';
import { Link } from 'react-router-dom';

import CreateAccountForm from './CreateAccountForm';

const CreateAccountView = (props) => (
  <Container>
    <Grid>
      <Grid.Row>
        <Grid.Column width={16}>
          <Segment basic>
            <div className="ui breadcrumb">
              <Link to="/accounts" className="section">Accounts</Link>
              <div className="divider"> / </div>
              <div className="active section">Create a new account</div>
            </div>
          </Segment>
          <Segment basic>
            <CreateAccountForm {...props} />
          </Segment>
        </Grid.Column>
      </Grid.Row>
    </Grid>
  </Container>
);

export default CreateAccountView;
