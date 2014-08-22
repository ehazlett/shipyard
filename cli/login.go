package main

import (
	"bufio"
	"encoding/json"
	"fmt"
	"os"
	"os/user"
	"path/filepath"
	"strings"

	"github.com/codegangsta/cli"
	"github.com/howeyc/gopass"
)

var loginCommand = cli.Command{
	Name:   "login",
	Usage:  "login to a shipyard cluster",
	Action: loginAction,
}

func loginAction(c *cli.Context) {
	m := NewManager()
	reader := bufio.NewReader(os.Stdin)
	fmt.Printf("Host: ")
	h, err := reader.ReadString('\n')
	if err != nil {
		logger.Fatal(err)
	}
	fmt.Printf("Username: ")
	u, err := reader.ReadString('\n')
	if err != nil {
		logger.Fatal(err)
	}
	fmt.Printf("Password: ")
	p := gopass.GetPasswd()
	host := strings.TrimSpace(string(h[:]))
	username := strings.TrimSpace(string(u[:]))
	pass := strings.TrimSpace(string(p[:]))
	token, err := m.Login(username, pass)
	if err != nil {
		logger.Fatal(err)
	}
	cfg := &ShipyardConfig{
		Host:     host,
		Username: username,
		Token:    token.Token,
	}
	usr, err := user.Current()
	if err != nil {
		logger.Fatal(err)
	}
	path := filepath.Join(usr.HomeDir, CONFIG_PATH)
	f, err := os.OpenFile(path, os.O_WRONLY, 0600)
	if err != nil {
		if os.IsNotExist(err) {
			fc, fErr := os.Create(path)
			if fErr != nil {
				logger.Fatal(err)
			}
			fc.Chmod(0600)
			f = fc
		} else {
			logger.Fatal(err)
		}
	}
	defer f.Close()
	if err := json.NewEncoder(f).Encode(cfg); err != nil {
		logger.Fatalf("error writing config: %s", err)
	}
}
