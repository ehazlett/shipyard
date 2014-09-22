package main

import (
	"testing"
)

func TestParseRestartPolicy(t *testing.T) {
	p := "on-failure"
	policy, retry, err := parseRestartPolicy(p)
	if err != nil {
		t.Error(err)
	}
	if policy != p {
		t.Errorf("expected policy %s; received %s", p, policy)
	}
	if retry != 0 {
		t.Errorf("expected 0 retries; received %s", retry)
	}
}

func TestParseRestartPolicyWithMaximum(t *testing.T) {
	p := "on-failure:5"
	policy, retry, err := parseRestartPolicy(p)
	if err != nil {
		t.Error(err)
	}
	if policy != "on-failure" {
		t.Errorf("expected policy %s; received %s", p, policy)
	}
	if retry != 5 {
		t.Errorf("expected 5 retries; received %s", retry)
	}
}
