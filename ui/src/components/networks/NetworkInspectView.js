import React from 'react';

import { Container, Grid, Message  } from 'semantic-ui-react';
import { Link } from "react-router-dom";
import _ from 'lodash';
import moment from 'moment';

import { inspectNetwork } from '../../api';

class NetworkInspectView extends React.Component {
  state = {
    network: null,
    loading: true,
    error: null
  };

  componentDidMount() {
    const { id } = this.props.params;
    inspectNetwork(id)
      .then((network) => {
        this.setState({
          error: null,
          network: network.body,
          loading: false,
        });
      })
      .catch((error) => {
        this.setState({
          error,
          loading: false,
        });
      });
  }

  render() {
    const { loading, network, error } = this.state;

    if(loading) {
      return <div></div>;
    }

    return (
      <Container>
        <Grid>
          <Grid.Row>
            <Grid.Column width={16}>
              <div className="ui breadcrumb">
                <Link to="/networks" className="section">Networks</Link>
                <div className="divider"> / </div>
                <div className="active section">{network.Name}</div>
              </div>
            </Grid.Column>
            <Grid.Column className="ui sixteen wide basic segment">
              {error && (<Message error>{error}</Message>)}
              <div className="ui header">Details</div>
              <table className="ui very basic celled table">
                <tbody>
                  <tr><td className="four wide column">Id</td><td>{network.Id}</td></tr>
                  <tr><td>Name</td><td>{network.Name}</td></tr>
                  <tr><td>Created</td><td>{moment(network.CreatedAt).toString()}</td></tr>
                  <tr><td>Last Updated</td><td>{moment(network.UpdatedAt).toString()}</td></tr>
                </tbody>
              </table>
            </Grid.Column>

            <Grid.Column className="ui sixteen wide basic segment">
              <div className="ui header">Details</div>
              <table className="ui very basic celled table">
                <tbody>
                  <tr><td className="four wide column">Driver</td><td>{network.Driver}</td></tr>
                  <tr><td>Scope</td><td>{network.Scope}</td></tr>
                  <tr><td>Attachable</td><td>{network.Attachable}</td></tr>
                  <tr><td>Internal</td><td>{network.Internal}</td></tr>
                  <tr><td>EnableIPV6</td><td>{network.EnableIPV6}</td></tr>
                </tbody>
              </table>

              <div className="ui header">Options</div>
              <table className="ui very basic celled table">
                <tbody>
                {
                  !_.isEmpty(network.Options) ?
                    Object.keys(network.Options).map((k) => (
                      <tr key={k}>
                        <td className="four wide column">{k}</td>
                        <td>{network.Options[k]}</td>
                      </tr>
                    )) :
                    <tr><td>No network options</td></tr>
                }
                </tbody>
              </table>

              <div className="ui header">IPAM</div>
              <table className="ui very basic celled table">
                <tbody>
                  <tr><td className="four wide column">Driver</td><td>{network.IPAM.Driver}</td></tr>
                </tbody>
              </table>

              <div className="ui small header">Configuration</div>
              <table className="ui very basic celled table">
                <tbody>
                {
                  network.IPAM && !_.isEmpty(network.IPAM.Config) ?
                    network.IPAM.Config.map((c) => (
                      <tr key={c.Gateway}>
                        <td className="four wide column">{c.Gateway}</td>
                        <td>{c.Subnet}</td>
                      </tr>
                    )) :
                    <tr><td>No IPAM configuration entries</td></tr>
                }
                </tbody>
              </table>

              <div className="ui small header">Options</div>
              <table className="ui very basic celled table">
                <tbody>
                {
                  network.IPAM && !_.isEmpty(network.IPAM.Options) ?
                    Object.keys(network.Options).map((k) => (
                      <tr key={k}>
                        <td className="four wide column">{k}</td>
                        <td>{network.Options[k]}</td>
                      </tr>
                    )) :
                    <tr><td>No IPAM options configured</td></tr>
                }
                </tbody>
              </table>

              <div className="ui header">Labels</div>
              <table className="ui very basic celled table">
                <tbody>
                {
                  !_.isEmpty(network.Labels) ?
                    Object.keys(network.Labels).map((k) => (
                      <tr key={k}>
                        <td className="four wide column">{k}</td>
                        <td>{network.Labels[k]}</td>
                      </tr>
                    )) :
                    <tr><td>No network labels</td></tr>
                }
                </tbody>
              </table>

              <div className="ui header">Peers</div>
              <table className="ui very basic celled table">
                <tbody>
                {
                  !_.isEmpty(network.Peers) ?
                    network.Peers.map((p) => (
                      <tr key={p.Name}>
                        <td className="four wide column">{p.Name}</td>
                        <td>{p.IP}</td>
                      </tr>
                    )) :
                    <tr><td>No network labels</td></tr>
                }
                </tbody>
              </table>
            </Grid.Column>
          </Grid.Row>
        </Grid>
      </Container>
    );
  }
}

export default NetworkInspectView;
