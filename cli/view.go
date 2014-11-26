package main

import (
	"fmt"
	"os"
	"time"

	log "github.com/Sirupsen/logrus"
	"github.com/codegangsta/cli"
	"github.com/olekukonko/tablewriter"
	"github.com/shipyard/shipyard"
	"github.com/shipyard/shipyard/client"
	"github.com/wsxiaoys/terminal/color"
)

var viewCommand = cli.Command{
	Name:   "view",
	Usage:  "start viewer",
	Action: viewAction,
	Flags: []cli.Flag{
		cli.StringFlag{
			Name:  "controller, c",
			Value: "http://127.0.0.1:8080",
			Usage: "URL to controller",
		},
		cli.StringFlag{
			Name:  "service-key, k",
			Value: "",
			Usage: "shipyard service key",
		},
		cli.IntFlag{
			Name:  "refresh, r",
			Value: 1,
			Usage: "view refresh interval (in seconds)",
		},
	},
}

func viewAction(c *cli.Context) {
	view, err := NewView(c.String("controller"), c.String("service-key"), c.Int("refresh"))
	if err != nil {
		log.Fatalf("error connecting to docker: %s", err)
	}

	view.Start()

	waitForInterrupt()
}

type View struct {
	controllerUrl   string
	serviceKey      string
	refreshInterval int
	shipyardClient  *client.Manager
}

func NewView(controllerUrl string, serviceKey string, refreshInterval int) (*View, error) {
	cfg := &client.ShipyardConfig{
		Url:        controllerUrl,
		ServiceKey: serviceKey,
	}
	client := client.NewManager(cfg)

	return &View{
		controllerUrl:   controllerUrl,
		serviceKey:      serviceKey,
		refreshInterval: refreshInterval,
		shipyardClient:  client,
	}, nil
}

func (v *View) Start() {
	ticker := time.NewTicker(time.Second * time.Duration(v.refreshInterval))

	go func() {
		for _ = range ticker.C {
			v.refresh()
		}
	}()

}

func (v *View) getEngines() ([]*shipyard.Engine, error) {
	return v.shipyardClient.Engines()
}

func (v *View) refresh() {
	engines, err := v.getEngines()
	if err != nil {
		log.Fatalf("unable to get engines: %s", err)
	}

	fmt.Print("\033[2J")
	fmt.Print("\033[H")
	fmt.Print("|")
	color.Printf("@b Shipyard: %s\n", v.controllerUrl)
	fmt.Print("|\n")

	if len(engines) == 0 {
		fmt.Println("| ----- No engines -----")
		fmt.Println("|")
	} else {
		t := tablewriter.NewWriter(os.Stdout)
		t.SetHeader([]string{"ID", "NAME", "CPUs", "MEMORY", "VERSION", "STATUS"})

		for _, eng := range engines {

			cpus := fmt.Sprintf("%.2f", eng.Engine.Cpus)
			memory := fmt.Sprintf("%.2f", eng.Engine.Memory)
			if eng.Engine.Cpus == 0.0 {
				cpus = ""
			}
			if eng.Engine.Memory == 0.0 {
				memory = ""
			}
			status := fmt.Sprintf("%s: %dms", eng.Health.Status, eng.Health.ResponseTime/1000000)
			t.Append([]string{eng.ID, eng.Engine.ID, cpus, memory, eng.DockerVersion, status})
		}

		t.Render()
	}
}
