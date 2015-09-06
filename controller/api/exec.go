package api

import (
	"strconv"
	"strings"

	log "github.com/Sirupsen/logrus"
	"github.com/samalba/dockerclient"
	"golang.org/x/net/websocket"
)

func (a *Api) execContainer(ws *websocket.Conn) {
	qry := ws.Request().URL.Query()
	containerId := qry.Get("id")
	command := qry.Get("cmd")
	ttyWidth := qry.Get("w")
	ttyHeight := qry.Get("h")
	token := qry.Get("token")
	cmd := strings.Split(command, ",")

	if !a.manager.ValidateConsoleSessionToken(containerId, token) {
		ws.Write([]byte("unauthorized"))
		ws.Close()
		return
	}

	log.Debugf("starting exec session: container=%s cmd=%s", containerId, command)
	clientUrl := a.manager.DockerClient().URL

	execConfig := &dockerclient.ExecConfig{
		AttachStdin:  true,
		AttachStdout: true,
		AttachStderr: true,
		Tty:          true,
		Cmd:          cmd,
		Container:    containerId,
		Detach:       true,
	}

	execId, err := a.manager.DockerClient().ExecCreate(execConfig)
	if err != nil {
		log.Errorf("error calling exec: %s", err)
		return
	}

	if err := a.hijack(clientUrl.Host, "POST", "/exec/"+execId+"/start", true, ws, ws, ws, nil, nil); err != nil {
		log.Errorf("error during hijack: %s", err)
		return
	}

	// resize
	w, err := strconv.Atoi(ttyWidth)
	if err != nil {
		log.Error(err)
		return
	}

	h, err := strconv.Atoi(ttyHeight)
	if err != nil {
		log.Error(err)
		return
	}

	if err := a.manager.DockerClient().ExecResize(execId, w, h); err != nil {
		log.Errorf("error resizing exec tty: %s", err)
		return
	}

}
