import React from 'react';

import { Redirect } from 'react-router';
import { Divider, Grid, Form, Header, Message } from 'semantic-ui-react';

import { login } from '../../api';
import { getAuthToken } from '../../services/auth';

export default class LoginView extends React.Component {
  state = {
    error: null,
    loading: false,
    redirect: false
  };

  handleLoginSuccess = () => {
    this.setState({
      error: null,
      loading: false,
      redirect: true,
    });
  };

  handleLoginError = (error) => {
    error.response.text()
      .then((text) => {
        this.setState({
          error: text,
          loading: false,
        });
      });
  };

  tryLogin = (e, values) => {
    this.setState({
      error: null,
      loading: true,
    });

    login(values.formData.username, values.formData.password)
      .then(this.handleLoginSuccess)
      .catch(this.handleLoginError);

    e.preventDefault();
  };

  componentDidMount() {
    if(getAuthToken()) {
      this.setState({
        redirect: true
      });
    }
  }

  render() {
    const { redirect, error } = this.state;
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
              <Form onSubmit={this.tryLogin}>
                {error && (<Message negative>{this.state.error}</Message>)}
                <Message error />
                <Form.Input name="username" icon="user" iconPosition="left" placeholder="Username" autoFocus />
                <Form.Input name="password" icon="lock" iconPosition="left" placeholder="Password" type="password" />
                <Form.Button fluid inverted basic type="submit">Login</Form.Button>
              </Form>
            </Grid.Column>
          </Grid.Row>
        </Grid>
    );
  }
}
