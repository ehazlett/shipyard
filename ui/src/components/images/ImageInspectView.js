import React from "react";

import { Container, Grid, Message } from "semantic-ui-react";
import { Link } from "react-router-dom";
import _ from "lodash";
import moment from "moment";

import { inspectImage, historyImage } from "../../api";
import { getReadableFileSizeString } from "../../lib";

class ImageInspectView extends React.Component {
  state = {
    image: null,
    history: null,
    loading: true,
    error: null
  };

  componentDidMount() {
    const { id } = this.props.match.params;
    inspectImage(id)
      .then(image => {
        this.setState({
          error: null,
          image: image.body,
          loading: false
        });
      })
      .catch(error => {
        this.setState({
          error,
          loading: false
        });
      });

    historyImage(id)
      .then(history => {
        this.setState({
          history: history.body
        });
      })
      .catch(error => {
        this.setState({
          error
        });
      });
  }

  render() {
    const { loading, image, history, error } = this.state;

    if (loading) {
      return <div />;
    }

    return (
      <Container>
        <Grid>
          <Grid.Row>
            <Grid.Column width={16}>
              <div className="ui breadcrumb">
                <Link to="/images" className="section">Images</Link>
                <div className="divider"> / </div>
                <div className="active section">
                  {image.Id.replace("sha256:", "").substring(0, 12)}
                </div>
              </div>
            </Grid.Column>
            <Grid.Column className="ui sixteen wide basic segment">
              {error && <Message error>{error}</Message>}
              <div className="ui header">Details</div>
              <table className="ui very basic celled table">
                <tbody>
                  <tr>
                    <td className="four wide column">Id</td><td>{image.Id}</td>
                  </tr>
                  <tr>
                    <td>Created</td>
                    <td>{moment(image.CreatedAt).toString()}</td>
                  </tr>
                  <tr>
                    <td>Last Updated</td>
                    <td>{moment(image.UpdatedAt).toString()}</td>
                  </tr>
                </tbody>
              </table>
            </Grid.Column>

            <Grid.Column className="ui sixteen wide basic segment">
              <div className="ui header">Tags</div>
              <table className="ui very basic celled table">
                <tbody>
                  {!_.isEmpty(image.RepoTags)
                    ? image.RepoTags.map(t => (
                        <tr key={t}>
                          <td>{t}</td>
                        </tr>
                      ))
                    : <tr><td>No image tags</td></tr>}
                </tbody>
              </table>

              <div className="ui header">Digests</div>
              <table className="ui very basic celled table">
                <tbody>
                  {!_.isEmpty(image.RepoDigests)
                    ? image.RepoDigests.map(d => (
                        <tr key={d}>
                          <td>{d}</td>
                        </tr>
                      ))
                    : <tr><td>No image digests</td></tr>}
                </tbody>
              </table>

              <div className="ui header">Details</div>
              <table className="ui very basic celled table">
                <tbody>
                  <tr>
                    <td className="four wide column">Architecture</td>
                    <td>{image.Architecture}</td>
                  </tr>
                  <tr><td>OS</td><td>{image.OS}</td></tr>
                  <tr><td>Author</td><td>{image.Author}</td></tr>
                  <tr><td>Comment</td><td>{image.Comment}</td></tr>
                  <tr><td>Docker Version</td><td>{image.DockerVersion}</td></tr>
                  <tr>
                    <td>Size</td>
                    <td>{getReadableFileSizeString(image.Size)}</td>
                  </tr>
                  <tr>
                    <td>Virtual Size</td>
                    <td>{getReadableFileSizeString(image.VirtualSize)}</td>
                  </tr>
                </tbody>
              </table>

              {/*
                TODO: Add loader while history is being fetched
              */}
              <div className="ui header">History</div>
              <table className="ui very basic celled table">
                <tbody>
                  {!_.isEmpty(history)
                    ? history.map(h => (
                        <tr key={history.indexOf(h)}>
                          <td>{h.CreatedBy}</td>
                        </tr>
                      ))
                    : <tr><td>No image history</td></tr>}
                </tbody>
              </table>
            </Grid.Column>
          </Grid.Row>
        </Grid>
      </Container>
    );
  }
}

export default ImageInspectView;
