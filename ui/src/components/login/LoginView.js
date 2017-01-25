import React from 'react';

import { Redirect } from 'react-router';
import { Divider, Grid, Header } from 'semantic-ui-react';

import LoginForm from "./LoginForm";
import { getAuthToken } from '../../services/auth';

import "./LoginView.css";
import logo from "../../img/logo.png";

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
        <Grid id="LoginView" centered>
          {redirect && (
            <Redirect to={'/'}/>
          )}
          <Grid.Row>
            <Grid.Column textAlign="center" mobile={12} tablet={8} computer={6} largeScreen={5}>
              <img src={logo} className="logo" alt="Shipyard Logo" />
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
