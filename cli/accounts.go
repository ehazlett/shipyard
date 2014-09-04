package main

import (
	"fmt"
	"os"
	"text/tabwriter"

	"github.com/codegangsta/cli"
	"github.com/shipyard/shipyard"
)

var accountsCommand = cli.Command{
	Name:   "accounts",
	Usage:  "show accounts",
	Action: accountsAction,
}

func accountsAction(c *cli.Context) {
	cfg, err := loadConfig()
	if err != nil {
		logger.Fatal(err)
	}
	m := NewManager(cfg)
	accounts, err := m.Accounts()
	if err != nil {
		logger.Fatalf("error getting accounts: %s", err)
	}
	if len(accounts) == 0 {
		return
	}
	w := tabwriter.NewWriter(os.Stdout, 0, 8, 1, '\t', 0)
	fmt.Fprintln(w, "Username\tID\tRole")
	for _, u := range accounts {
		fmt.Fprintf(w, "%s\t%s\t%s\n", u.Username, u.ID, u.Role.Name)
	}
	w.Flush()
}

var addAccountCommand = cli.Command{
	Name:   "add-account",
	Usage:  "add account",
	Action: addAccountAction,
	Flags: []cli.Flag{
		cli.StringFlag{
			Name:  "username, u",
			Usage: "account username",
		},
		cli.StringFlag{
			Name:  "password, p",
			Usage: "account password",
		},
		cli.StringFlag{
			Name:  "role, r",
			Usage: "account role (admin, user)",
		},
	},
}

func addAccountAction(c *cli.Context) {
	cfg, err := loadConfig()
	if err != nil {
		logger.Fatal(err)
	}
	m := NewManager(cfg)
	user := c.String("username")
	pass := c.String("password")
	if user == "" || pass == "" {
		logger.Fatalf("you must specify a username and password")
	}
	role, err := m.Role(c.String("role"))
	if err != nil {
		logger.Fatal(err)
	}
	account := &shipyard.Account{
		Username: user,
		Password: pass,
		Role:     role,
	}
	if err := m.AddAccount(account); err != nil {
		logger.Fatalf("error adding account: %s", err)
	}
}

var deleteAccountCommand = cli.Command{
	Name:        "delete-account",
	Usage:       "delete account",
	Description: "delete-account <username> [<username>]",
	Action:      deleteAccountAction,
}

func deleteAccountAction(c *cli.Context) {
	cfg, err := loadConfig()
	if err != nil {
		logger.Fatal(err)
	}
	m := NewManager(cfg)
	accounts := c.Args()
	if len(accounts) == 0 {
		return
	}
	for _, acct := range accounts {
		account := &shipyard.Account{
			Username: acct,
		}
		if err := m.DeleteAccount(account); err != nil {
			logger.Fatalf("error deleting account: %s", err)
		}
	}
}
