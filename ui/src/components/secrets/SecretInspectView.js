import React from "react";

import { Container, Grid, Message } from "semantic-ui-react";
import { Link } from "react-router-dom";
import _ from "lodash";
import moment from "moment";

import { inspectSecret } from "../../api";

class SecretInspectView extends React.Component {
  state = {
    secret: null,
    loading: true,
    error: null
  };

  componentDidMount() {
    const { id } = this.props.match.params;
    inspectSecret(id)
      .then(secret => {
        this.setState({
          error: null,
          secret: secret.body,
          loading: false
        });
      })
      .catch(error => {
        this.setState({
          error,
          loading: false
        });
      });
  }

  render() {
    const { loading, secret, error } = this.state;

    if (loading) {
      return <div />;
    }

    return (
      <Container>
        <Grid>
          <Grid.Row>
            <Grid.Column width={16}>
              <div className="ui breadcrumb">
                <Link to="/secrets" className="section">Secrets</Link>
                <div className="divider"> / </div>
                <div className="active section">
                  {secret.ID.substring(0, 12)}
                </div>
              </div>
            </Grid.Column>
            <Grid.Column className="ui sixteen wide basic segment">
              {error && <Message error>{error}</Message>}
              <div className="ui header">Details</div>
              <table className="ui very basic celled table">
                <tbody>
                  <tr>
                    <td className="four wide column">Id</td><td>{secret.ID}</td>
                  </tr>
                  <tr><td>Name</td><td>{secret.Spec.Name}</td></tr>
                  <tr>
                    <td>Created</td>
                    <td>{moment(secret.CreatedAt).toString()}</td>
                  </tr>
                  <tr>
                    <td>Last Updated</td>
                    <td>{moment(secret.UpdatedAt).toString()}</td>
                  </tr>
                </tbody>
              </table>
            </Grid.Column>
          </Grid.Row>
        </Grid>
      </Container>
    );
  }
}

export default SecretInspectView;
