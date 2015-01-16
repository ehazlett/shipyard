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
	"github.com/shipyard/shipyard/client"
)

var loginCommand = cli.Command{
	Name:   "login",
	Usage:  "login to a shipyard cluster",
	Action: loginAction,
}

func saveConfig(cfg *client.ShipyardConfig) error {
	usr, err := user.Current()
	if err != nil {
		return err
	}
	path := filepath.Join(usr.HomeDir, CONFIG_PATH)
	f, err := os.OpenFile(path, os.O_WRONLY, 0600)
	if err != nil {
		if os.IsNotExist(err) {
			fc, fErr := os.Create(path)
			if fErr != nil {
				return err
			}
			fc.Chmod(0600)
			f = fc
		} else {
			return err
		}
	}
	defer f.Close()
	if err := json.NewEncoder(f).Encode(cfg); err != nil {
		return err
	}
	return nil
}

func loginAction(c *cli.Context) {
	reader := bufio.NewReader(os.Stdin)
	fmt.Printf("URL: ")
	ur, err := reader.ReadString('\n')
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
	sUrl := strings.TrimSpace(string(ur[:]))
	username := strings.TrimSpace(string(u[:]))
	pass := strings.TrimSpace(string(p[:]))

	cfg := &client.ShipyardConfig{
		Url:           sUrl,
		Username:      username,
		AllowInsecure: c.GlobalBool("allow-insecure"),
	}
	m := client.NewManager(cfg)
	token, err := m.Login(username, pass)
	if err != nil {
		logger.Fatal(err)
	}
	cfg.Token = token.Token
	if err := saveConfig(cfg); err != nil {
		logger.Fatal(err)
	}
}

var changePasswordCommand = cli.Command{
	Name:   "change-password",
	Usage:  "update your password",
	Action: changePasswordAction,
}

func changePasswordAction(c *cli.Context) {
	cfg, err := loadConfig(c)
	if err != nil {
		logger.Fatal(err)
	}
	m := client.NewManager(cfg)
	fmt.Printf("Password: ")
	p1 := gopass.GetPasswd()
	fmt.Printf("Confirm: ")
	p2 := gopass.GetPasswd()
	pass := strings.TrimSpace(string(p1[:]))
	pass_confirm := strings.TrimSpace(string(p2[:]))
	if pass != pass_confirm {
		logger.Fatal("passwords do not match")
	}
	if err := m.ChangePassword(pass); err != nil {
		logger.Fatal(err)
	}
}
