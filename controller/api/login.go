package api

import (
	"encoding/json"
	"net/http"

	log "github.com/Sirupsen/logrus"
	"github.com/shipyard/shipyard/auth"
	"github.com/shipyard/shipyard/auth/ldap"
	"github.com/shipyard/shipyard/controller/manager"
)

func (a *Api) login(w http.ResponseWriter, r *http.Request) {
	var creds *Credentials
	if err := json.NewDecoder(r.Body).Decode(&creds); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	loginSuccessful, err := a.manager.Authenticate(creds.Username, creds.Password)
	if err != nil {
		log.Errorf("error during login for %s from %s: %s", creds.Username, r.RemoteAddr, err)
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	if !loginSuccessful {
		log.Warnf("invalid login for %s from %s", creds.Username, r.RemoteAddr)
		http.Error(w, "invalid username/password", http.StatusForbidden)
		return
	}

	// check for ldap and autocreate for users
	if a.manager.GetAuthenticator().Name() == "ldap" {
		if a.manager.GetAuthenticator().(*ldap.LdapAuthenticator).AutocreateUsers {
			defaultAccessLevel := a.manager.GetAuthenticator().(*ldap.LdapAuthenticator).DefaultAccessLevel
			log.Debug("ldap: checking for existing user account and creating if necessary")
			// give default users readonly access to containers
			acct := &auth.Account{
				Username: creds.Username,
				Roles:    []string{defaultAccessLevel},
			}

			// check for existing account
			if _, err := a.manager.Account(creds.Username); err != nil {
				if err == manager.ErrAccountDoesNotExist {
					log.Debugf("autocreating user for ldap: username=%s access=%s", creds.Username, defaultAccessLevel)
					if err := a.manager.SaveAccount(acct); err != nil {
						log.Errorf("error autocreating ldap user %s: %s", creds.Username, err)
						http.Error(w, err.Error(), http.StatusInternalServerError)
						return
					}
				} else {
					log.Errorf("error checking user for autocreate: %s", err)
					http.Error(w, err.Error(), http.StatusInternalServerError)
					return
				}
			}

		}
	}

	// return token
	token, err := a.manager.NewAuthToken(creds.Username, r.UserAgent())
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	if err := json.NewEncoder(w).Encode(token); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
}

func (a *Api) changePassword(w http.ResponseWriter, r *http.Request) {
	session, _ := a.manager.Store().Get(r, a.manager.StoreKey())
	var creds *Credentials
	if err := json.NewDecoder(r.Body).Decode(&creds); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	username := session.Values["username"].(string)
	if username == "" {
		http.Error(w, "unauthorized", http.StatusInternalServerError)
		return
	}
	if err := a.manager.ChangePassword(username, creds.Password); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
}
