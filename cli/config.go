package main

import (
	"errors"
)

const (
	CONFIG_PATH = ".shipyardrc" // this is joined to the user's home dir
)

var (
	ErrConfigDoesNotExist = errors.New("config does not exist; try logging in")
	ErrInvalidConfig      = errors.New("invalid config")
)

type (
	ShipyardConfig struct {
		Url      string `json:"url,omitempty"`
		Username string `json:"username,omitempty"`
		Token    string `json:"token,omitempty"`
	}
)
