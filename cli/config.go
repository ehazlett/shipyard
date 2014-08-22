package main

import (
	"errors"
)

const (
	CONFIG_PATH = ".shipyardrc" // this is joined to the user's home dir
)

var (
	ErrConfigDoesNotExist = errors.New("config does not exist")
	ErrInvalidConfig      = errors.New("invalid config")
)

type (
	ShipyardConfig struct {
		Host     string `json:"host,omitempty"`
		Username string `json:"username,omitempty"`
		Token    string `json:"token,omitempty"`
	}
)
