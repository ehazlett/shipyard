var React = require("react");
var HomeView = require("./home.js");
var LoginView = require("./login.js");
var ContainersView = require("./containers.js");
var ImagesView = require("./images.js");
var VolumesView = require("./volumes.js");
var NotFound = require("./notfound.js");
var auth = require('./auth.js');

var RouterMixin = require('react-mini-router').RouterMixin;
var App = React.createClass({
    mixins: [RouterMixin],
    routes: {
        '/': 'home',
        '/login': 'login',
        '/containers': 'containers',
        '/images': 'images',
        '/volumes': 'volumes'
    },
    render: function() {
        return this.renderCurrentRoute();
    },
    home: function() {
        return (
            <HomeView />
        )
    },
    login: function() {
        return (
            <LoginView />
        )
    },
    containers: function() {
        return (
            <ContainersView />
        )
    },
    images: function() {
        return (
            <ImagesView />
        )
    },
    volumes: function() {
        return (
            <VolumesView />
        )
    },
    notFound: function(path) {
        this.state.path = path;
        return (
            <NotFound path={this.state.path} />
        )
    }
});

React.render(<App />, document.querySelector('body'));
