package main

import (
	"time"

	"github.com/citadel/citadel"
	"github.com/shipyard/shipyard"
)

type (
	EventHandler struct {
		Manager *Manager
	}
)

func (h *EventHandler) Handle(e *citadel.Event) error {
	logger.Infof("event: date=%s type=%s image=%s container=%s", e.Time.Format(time.RubyDate), e.Type, e.Container.Image.Name, e.Container.ID[:12])
	h.logEvent(e)
	return nil
}

func (h *EventHandler) logEvent(e *citadel.Event) error {
	evt := &shipyard.Event{
		Type:      e.Type,
		Time:      e.Time,
		Container: e.Container,
		Engine:    e.Engine,
	}
	if err := h.Manager.SaveEvent(evt); err != nil {
		return err
	}
	return nil
}
