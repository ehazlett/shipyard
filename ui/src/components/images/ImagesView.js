import React from 'react';

import { Route, Switch, Redirect } from "react-router-dom";

import ImageListView from './ImageListView';
import ImageInspectView from './ImageInspectView';

class ImagesView extends React.Component {
  render() {
    return (
      <Switch>
        <Route exact path="/images" component={ImageListView} />
        <Route exact path="/images/inspect/:id" component={ImageInspectView} />
        <Route render={() => <Redirect to="/images" />} />
      </Switch>
    );
  }
}

export default ImagesView;
