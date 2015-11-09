var React = require("react");
var auth = require("./auth.js");
var navigate = require('react-mini-router').navigate;
var docker = require("./docker.js");

function doRequest(url, callback, errorCallback) {
    $.ajax({
        url: url,
        dataType: 'json',
        beforeSend: function (request) {
            request.setRequestHeader("X-Auth-Token", auth.getUsername() + ":" + auth.getToken());
        },
        cache: false,
        success: function(data) {
            callback(data);
        },
        error: function(xhr, status, err) {
            if (status == 401) {
                navigate("/login");
            } else {
                errorCallback(xhr, status, err);
            }
        }
    });
};

var API = function(opts){};

API.prototype = {
    info: function(callback){
        if (!auth.isLoggedIn()) {
            navigate("/login");
        } else {
            var d = docker();
            d.info(function(err, data){
                console.log(data);
                callback(err, data);
            });
        }
    },
    listContainers: function(opts, callback){
        if (!auth.isLoggedIn()) {
            navigate("/login");
        } else {
            var d = docker();
            d.listContainers(opts, function(err, data){
                callback(err, data);
            });
        }
    },
    listImages: function(opts, callback){
        if (!auth.isLoggedIn()) {
            navigate("/login");
        } else {
            var d = docker();
            d.listImages(opts, function(err, data){
                callback(err, data);
            });
        }
    }
}

module.exports = new API;

