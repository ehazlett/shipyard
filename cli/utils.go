package main

import (
	"fmt"
	"os"
	"text/tabwriter"
)

type Display struct {
	minWidth int
	maxWidth int
	fillChar byte
}

func NewDisplay(min int, max int, fill byte) *Display {
	return &Display{
		minWidth: min,
		maxWidth: max,
		fillChar: fill,
	}
}

func (d *Display) Write(text string) {
	w := tabwriter.NewWriter(os.Stdout, d.minWidth, d.maxWidth, 5, d.fillChar, 0)
	fmt.Fprintln(w, text)
	w.Flush()
}
