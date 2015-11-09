var React = require("react");
var navigate = require('react-mini-router').navigate;

module.exports = {
    login(username, password, cb) {
        cb = arguments[arguments.length - 1]
        if (localStorage.authToken) {
            if (cb) cb(true, null)
            this.onChange(true)
            return
        }

        authenticate(username, password, (res, err) => {
            if (res.authenticated) {
                localStorage.username = username
                localStorage.authToken = res.authToken
                if (cb) cb(true, null)
                this.onChange(true)
            } else {
                if (cb) cb(false, err)
                this.onChange(false)
            }
        });
    },
    getUsername() {
        return localStorage.username
    },
    getToken() {
        return localStorage.authToken
    },
    logout(cb) {
        userLogout( () => {
            delete localStorage.username;
            delete localStorage.authToken;
            this.onChange(false);
        });
    },
    isLoggedIn() {
        return !!localStorage.authToken
    },
    onChange(authenticated) {
        if (authenticated) {
            navigate("/");
        } else {
            navigate("/login");
        }
    }
}

// authenticate
function authenticate(username, password, cb) {
    setTimeout(() => {
        $.ajax({
            method: "POST",
            url: "/auth/login",
            contentType: "application/json; charset=UTF-8",
            dataType: "json",
            data: JSON.stringify({username: username, password: password}),
        }).done(function(data, statusText, xhr){
            if (xhr.status != 200) {
                var err = xhr.responseText;
                cb({ authenticated: false }, err)
            } else{
                cb({
                  authenticated: true,
                  authToken: data.auth_token
                }, null)
            }
        }).error(function(){
            cb({ authenticated: false }, null)
        });
    }, 0)
}

// userLogout removes the auth token for the user
function userLogout(cb) {
    setTimeout(() => {
        $.ajax({
            method: "GET",
            url: "/account/logout",
            beforeSend: function(xhr){
                xhr.setRequestHeader('X-Access-Token', localStorage.username + ":" + localStorage.authToken);
            }
        }).always(function(){
            if (cb) cb()
        });
    }, 0)
}
