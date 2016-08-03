package emitter

import (
	"testing"
	"time"
	//"fmt"
)

func TestEmitMsgToSingleListener(t *testing.T) {
	e := NewEmitter()
	passed := false

	ch := make(chan struct{})

	go func() {
		m := e.WaitForMessage()
		if m.Category != "aloha" {
			t.Fatal("Incorrect Category recieved")
		}
		ch <- struct{}{}
	}()

	timeout := make(chan bool, 1)
	go func() {
		time.Sleep(20 * time.Second)
		timeout <- true
	}()

	go func() {
		// Since we aren't waiting for listeners (waitForListeners is set to false)
		// we have to make sure that this routine runs after e.WaitForMessage()
		time.Sleep(1 * time.Second)
		e.BroadcastMessage("aloha", struct{}{}, false, 0)
	}()

	select {
	case <-ch:
		passed = true
	case <-timeout:
	}

	if !passed {
		t.Fatal("Broadcast timeout")
	}
}

func TestEmitMsgToMultipleListeners(t *testing.T) {
	e := NewEmitter()

	ch := make(chan struct{})

	for i := 0; i < 3; i++ {
		go func() {
			m := e.WaitForMessage()
			if m.Category != "aloha" {
				t.Fatal("Incorrect Category recieved")
			}
			ch <- struct{}{}
		}()
	}

	timeout := make(chan bool, 1)
	go func() {
		time.Sleep(20 * time.Second)
		timeout <- true
	}()

	go func() {
		// Since we aren't waiting for listeners (waitForListeners is set to false)
		// we have to make sure that this routine runs after e.WaitForMessage()
		time.Sleep(1 * time.Second)
		e.BroadcastMessage("aloha", struct{}{}, false, 0)
	}()

	for i := 0; i < 3; i++ {
		passed := false

		select {
		case <-ch:
			passed = true
		case <-timeout:
		}

		if !passed {
			t.Fatal("Broadcast timeout")
		}
	}
}

func TestEmitMsgAndWaitForListener(t *testing.T) {
	e := NewEmitter()
	passed := false

	ch := make(chan struct{})

	go func() {
		// Since we testing the waitForListeners functionality,
		// we have to wait until a message is broadcasted before setting
		// the listeners
		time.Sleep(1 * time.Second)
		m := e.WaitForMessage()
		if m.Category != "aloha" {
			t.Fatal("Incorrect Category recieved")
		}
		ch <- struct{}{}
	}()

	timeout := make(chan bool, 1)
	go func() {
		time.Sleep(20 * time.Second)
		timeout <- true
	}()

	go func() {
		e.BroadcastMessage("aloha", struct{}{}, true, 60)
	}()

	select {
	case <-ch:
		passed = true
	case <-timeout:
	}

	if !passed {
		t.Fatal("Broadcast timeout")
	}
}

func TestEmitMsgAndWaitForMultipleListeners(t *testing.T) {
	e := NewEmitter()

	ch := make(chan struct{})

	for i := 0; i < 3; i++ {
		go func() {
			m := e.WaitForMessage()
			if m.Category != "aloha" {
				t.Fatal("Incorrect Category recieved")
			}
			ch <- struct{}{}
		}()
	}

	// Since we testing the waitForListeners functionality,
	// we have to wait until a message is broadcasted before setting
	// the listeners
	time.Sleep(1 * time.Second)

	timeout := make(chan bool, 1)
	go func() {
		time.Sleep(20 * time.Second)
		timeout <- true
	}()

	go func() {
		e.BroadcastMessage("aloha", struct{}{}, true, 60)
	}()

	for i := 0; i < 3; i++ {
		passed := false

		select {
		case <-ch:
			passed = true
		case <-timeout:
		}

		if !passed {
			t.Fatal("Broadcast timeout")
		}
	}
}
