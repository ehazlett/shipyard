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
	m := NewManager(c.GlobalString("host"))
	accounts, err := m.Accounts()
	if err != nil {
		logger.Fatalf("error getting accounts: %s", err)
	}
	if len(accounts) == 0 {
		return
	}
	w := tabwriter.NewWriter(os.Stdout, 0, 8, 1, '\t', 0)
	fmt.Fprintln(w, "Username\tID")
	for _, u := range accounts {
		fmt.Fprintf(w, "%s\t%s\n", u.Username, u.ID)
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
	},
}

func addAccountAction(c *cli.Context) {
	m := NewManager(c.GlobalString("host"))
	user := c.String("username")
	pass := c.String("password")
	if user == "" || pass == "" {
		logger.Fatalf("you must specify a username and password")
	}
	account := &shipyard.Account{
		Username: c.String("username"),
		Password: c.String("password"),
	}
	if err := m.AddAccount(account); err != nil {
		logger.Fatalf("error adding account: %s", err)
	}
}

var deleteAccountCommand = cli.Command{
	Name:   "delete-account",
	Usage:  "delete account",
	Action: deleteAccountAction,
	Flags: []cli.Flag{
		cli.StringFlag{
			Name:  "id, i",
			Usage: "account id",
		},
	},
}

func deleteAccountAction(c *cli.Context) {
	m := NewManager(c.GlobalString("host"))
	account := &shipyard.Account{
		ID: c.String("id"),
	}
	if err := m.DeleteAccount(account); err != nil {
		logger.Fatalf("error deleting account: %s", err)
	}
}
