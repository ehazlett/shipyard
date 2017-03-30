import React from "react";

import { Container, Grid, Message } from "semantic-ui-react";
import { Link } from "react-router-dom";
import _ from "lodash";
import moment from "moment";

import { inspectVolume } from "../../api";

class VolumeInspectView extends React.Component {
  state = {
    volume: null,
    loading: true,
    error: null
  };

  componentDidMount() {
    const { name } = this.props.match.params;
    inspectVolume(name)
      .then(volume => {
        this.setState({
          error: null,
          volume: volume.body,
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
    const { loading, volume, error } = this.state;

    if (loading) {
      return <div />;
    }

    return (
      <Container>
        <Grid>
          <Grid.Row>
            <Grid.Column width={16}>
              <div className="ui breadcrumb">
                <Link to="/volumes" className="section">Volumes</Link>
                <div className="divider"> / </div>
                <div className="active section">{volume.Name}</div>
              </div>
            </Grid.Column>
            <Grid.Column className="ui sixteen wide basic segment">
              {error && <Message error>{error}</Message>}
              <div className="ui header">Details</div>
              <table className="ui very basic celled table">
                <tbody>
                  <tr>
                    <td className="four wide column">Name</td>
                    <td>{volume.Name}</td>
                  </tr>
                  <tr>
                    <td>Created</td>
                    <td>{moment(volume.CreatedAt).toString()}</td>
                  </tr>
                  <tr>
                    <td>Last Updated</td>
                    <td>{moment(volume.UpdatedAt).toString()}</td>
                  </tr>
                </tbody>
              </table>
            </Grid.Column>

            <Grid.Column className="ui sixteen wide basic segment">
              <div className="ui header">Details</div>
              <table className="ui very basic celled table">
                <tbody>
                  <tr>
                    <td className="four wide column">Driver</td>
                    <td>{volume.Driver}</td>
                  </tr>
                  <tr><td>Driver</td><td>{volume.Mountpoint}</td></tr>
                  <tr><td>Scope</td><td>{volume.Scope}</td></tr>
                </tbody>
              </table>

              <div className="ui header">Options</div>
              <table className="ui very basic celled table">
                <tbody>
                  {!_.isEmpty(volume.Options)
                    ? Object.keys(volume.Options).map(k => (
                        <tr key={k}>
                          <td className="four wide column">{k}</td>
                          <td>{volume.Options[k]}</td>
                        </tr>
                      ))
                    : <tr><td>No volume options</td></tr>}
                </tbody>
              </table>

              <div className="ui header">Labels</div>
              <table className="ui very basic celled table">
                <tbody>
                  {!_.isEmpty(volume.Labels)
                    ? Object.keys(volume.Labels).map(k => (
                        <tr key={k}>
                          <td className="four wide column">{k}</td>
                          <td>{volume.Labels[k]}</td>
                        </tr>
                      ))
                    : <tr><td>No volume labels</td></tr>}
                </tbody>
              </table>
            </Grid.Column>
          </Grid.Row>
        </Grid>
      </Container>
    );
  }
}

export default VolumeInspectView;
