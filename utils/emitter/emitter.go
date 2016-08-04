package emitter

import (
	//"time"
	"errors"
	"github.com/shipyard/shipyard/utils"
)

type Emitter struct {
	Msg       chan Message
	listeners int
}

type Message struct {
	Category string
	Data     interface{}
}

func NewEmitter() *Emitter {
	emitter := new(Emitter)
	emitter.Msg = make(chan Message)
	return emitter
}

func (emitter *Emitter) GetListeners() int {
	return emitter.listeners
}

func (emitter *Emitter) WaitForMessage() Message {
	emitter.listeners++
	return <-emitter.Msg
}

func (emitter *Emitter) BroadcastMessage(
	category string,
	data interface{},
	waitForListeners bool,
	timeoutInSeconds int,
) error {
	if emitter.listeners == 0 && !waitForListeners {
		return errors.New("No listeners to consume message broadcast")
	}

	msg := Message{
		Category: category,
		Data:     data,
	}

	if waitForListeners {
		timeout := utils.ChanTimeout(timeoutInSeconds)
		select {
		case emitter.Msg <- msg:
			emitter.listeners--
		case <-timeout:
			return errors.New("No listeners were registered in the specified timeout")
		}
	}

	for emitter.listeners != 0 {
		emitter.Msg <- msg
		emitter.listeners--
	}

	return nil
}
