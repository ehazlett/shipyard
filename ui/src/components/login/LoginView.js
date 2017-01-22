import React from 'react';

import { Redirect } from 'react-router';
import { Divider, Grid, Header } from 'semantic-ui-react';

import LoginForm from "./LoginForm";
import { getAuthToken } from '../../services/auth';

export default class LoginView extends React.Component {
  state = {
    error: null,
    redirect: false,
  };

  componentDidMount() {
    if(getAuthToken()) {
      this.setState({
        redirect: true
      });
    }
  }

  handleLoginSuccess = () => {
    console.log('Handling success');
    this.setState({
      redirect: true,
    });
  };

  render() {
    const { redirect } = this.state;
    return (
        <Grid verticalAlign="middle" centered style={{ height: '100vh', width: '100vw', backgroundColor: '#2185D0', padding: 0, margin: 0 }}>
          {redirect && (
            <Redirect to={'/'}/>
          )}
          <Grid.Row>
            <Grid.Column textAlign="center" verticalAlign="middle" mobile={12} tablet={8} computer={6} largeScreen={5}>
              <Header as="h1" inverted>
                Shipyard
              </Header>
              <Divider hidden />
              <LoginForm successHandler={this.handleLoginSuccess} />
            </Grid.Column>
          </Grid.Row>
        </Grid>
    );
  }
}
