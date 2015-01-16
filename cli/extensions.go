package main

import (
	"bufio"
	"encoding/json"
	"fmt"
	"net/http"
	"os"
	"text/tabwriter"

	"github.com/codegangsta/cli"
	"github.com/shipyard/shipyard"
	"github.com/shipyard/shipyard/client"
)

var extensionsCommand = cli.Command{
	Name:   "extensions",
	Usage:  "show extensions",
	Action: extensionsAction,
}

func extensionsAction(c *cli.Context) {
	cfg, err := loadConfig(c)
	if err != nil {
		logger.Fatal(err)
	}
	m := client.NewManager(cfg)
	exts, err := m.Extensions()
	if err != nil {
		logger.Fatalf("error getting extensions: %s", err)
	}
	if len(exts) == 0 {
		return
	}
	w := tabwriter.NewWriter(os.Stdout, 0, 8, 1, '\t', 0)
	fmt.Fprintln(w, "ID\tName\tVersion\tAuthor\tImage\tUrl\tDescription")
	for _, e := range exts {
		fmt.Fprintf(w, "%s\t%s\t%s\t%s\t%s\t%s\t%s\n", e.ID, e.Name, e.Version, e.Author, e.Image, e.Url, e.Description)
	}
	w.Flush()
}

var addExtensionCommand = cli.Command{
	Name:   "add-extension",
	Usage:  "add extension",
	Action: addExtensionAction,
	Flags: []cli.Flag{
		cli.StringFlag{
			Name:  "url",
			Usage: "extension config url",
		},
		cli.StringSliceFlag{
			Name:  "env",
			Usage: "environment variables (key=value pairs)",
			Value: &cli.StringSlice{},
		},
		cli.StringSliceFlag{
			Name:  "arg",
			Usage: "arguments",
			Value: &cli.StringSlice{},
		},
	},
}

func addExtensionAction(c *cli.Context) {
	cfg, err := loadConfig(c)
	if err != nil {
		logger.Fatal(err)
	}
	m := client.NewManager(cfg)
	extUrl := c.String("url")
	if extUrl == "" {
		logger.Fatalf("you must specify an extension config url")
	}
	env := parseEnvironmentVariables(c.StringSlice("env"))
	args := c.StringSlice("arg")
	resp, err := http.Get(extUrl)
	if err != nil {
		logger.Fatalf("unable to get extension config: %s", err)
	}
	var ext *shipyard.Extension
	if err := json.NewDecoder(resp.Body).Decode(&ext); err != nil {
		logger.Fatalf("error parsing extension config: %s", err, err)
	}
	fmt.Printf("configuring %s (%s for more info)\n", ext.Name, ext.Url)
	// check for configuration
	for _, pe := range ext.Config.PromptEnvironment {
		fmt.Printf("enter value for container environment variable %s: ", pe)
		b := bufio.NewReader(os.Stdin)
		r, _, err := b.ReadLine()
		if err != nil {
			logger.Fatalf("unable to parse input: %s", err)
		}
		env[pe] = string(r)
	}
	for _, pa := range ext.Config.PromptArgs {
		fmt.Printf("enter value for container argument %s: ", pa)
		b := bufio.NewReader(os.Stdin)
		r, _, err := b.ReadLine()
		if err != nil {
			logger.Fatalf("unable to parse input: %s", err)
		}
		arg := string(r)
		if pa != "" {
			arg = fmt.Sprintf("%s=%s", pa, r)
		}
		args = append(args, arg)
	}
	ext.Config.Environment = env
	ext.Config.Args = args
	if err := m.AddExtension(ext); err != nil {
		logger.Fatalf("error adding extension: %s", err)
	}
	fmt.Printf("added extension name=%s version=%s\n", ext.Name, ext.Version)
}

var removeExtensionCommand = cli.Command{
	Name:        "remove-extension",
	Usage:       "remove an extension",
	Description: "remove-extension <id> [id]",
	Action:      removeExtensionAction,
}

func removeExtensionAction(c *cli.Context) {
	cfg, err := loadConfig(c)
	if err != nil {
		logger.Fatal(err)
	}
	m := client.NewManager(cfg)
	extIds := c.Args()
	if len(extIds) == 0 {
		return
	}
	for _, id := range extIds {
		if err := m.RemoveExtension(id); err != nil {
			logger.Fatalf("error removing extension: %s", err)
		}
	}
}
