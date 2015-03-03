package gorethink

import (
	p "github.com/dancannon/gorethink/ql2"
)

// Aggregation
// These commands are used to compute smaller values from large sequences.

// Produce a single value from a sequence through repeated application of a
// reduction function
func (t Term) Reduce(args ...interface{}) Term {
	return constructMethodTerm(t, "Reduce", p.Term_REDUCE, funcWrapArgs(args), map[string]interface{}{})
}

type DistinctOpts struct {
	Index interface{} `gorethink:"index,omitempty"`
}

func (o *DistinctOpts) toMap() map[string]interface{} {
	return optArgsToMap(o)
}

// Remove duplicate elements from the sequence.
func (t Term) Distinct(optArgs ...DistinctOpts) Term {
	opts := map[string]interface{}{}
	if len(optArgs) >= 1 {
		opts = optArgs[0].toMap()
	}
	return constructMethodTerm(t, "Distinct", p.Term_DISTINCT, []interface{}{}, opts)
}

// Takes a stream and partitions it into multiple groups based on the
// fields or functions provided. Commands chained after group will be
//  called on each of these grouped sub-streams, producing grouped data.
func (t Term) Group(fieldOrFunctions ...interface{}) Term {
	return constructMethodTerm(t, "Group", p.Term_GROUP, funcWrapArgs(fieldOrFunctions), map[string]interface{}{})
}

// Takes a stream and partitions it into multiple groups based on the
// fields or functions provided. Commands chained after group will be
// called on each of these grouped sub-streams, producing grouped data.
func (t Term) GroupByIndex(index interface{}, fieldOrFunctions ...interface{}) Term {
	return constructMethodTerm(t, "Group", p.Term_GROUP, funcWrapArgs(fieldOrFunctions), map[string]interface{}{
		"index": index,
	})
}

func (t Term) Ungroup(args ...interface{}) Term {
	return constructMethodTerm(t, "Ungroup", p.Term_UNGROUP, args, map[string]interface{}{})
}

//Returns whether or not a sequence contains all the specified values, or if
//functions are provided instead, returns whether or not a sequence contains
//values matching all the specified functions.
func (t Term) Contains(args ...interface{}) Term {
	return constructMethodTerm(t, "Contains", p.Term_CONTAINS, args, map[string]interface{}{})
}

// Aggregators
// These standard aggregator objects are to be used in conjunction with group_by.

// Count the number of elements in the sequence. With a single argument,
// count the number of elements equal to it. If the argument is a function,
// it is equivalent to calling filter before count.
func (t Term) Count(args ...interface{}) Term {
	return constructMethodTerm(t, "Count", p.Term_COUNT, funcWrapArgs(args), map[string]interface{}{})
}

// Sums all the elements of a sequence. If called with a field name, sums all
// the values of that field in the sequence, skipping elements of the sequence
// that lack that field. If called with a function, calls that function on every
// element of the sequence and sums the results, skipping elements of the
// sequence where that function returns null or a non-existence error.
func (t Term) Sum(args ...interface{}) Term {
	return constructMethodTerm(t, "Sum", p.Term_SUM, funcWrapArgs(args), map[string]interface{}{})
}

// Averages all the elements of a sequence. If called with a field name, averages
// all the values of that field in the sequence, skipping elements of the sequence
// that lack that field. If called with a function, calls that function on every
// element of the sequence and averages the results, skipping elements of the
// sequence where that function returns null or a non-existence error.
func (t Term) Avg(args ...interface{}) Term {
	return constructMethodTerm(t, "Avg", p.Term_AVG, funcWrapArgs(args), map[string]interface{}{})
}

// Finds the minimum of a sequence. If called with a field name, finds the element
// of that sequence with the smallest value in that field. If called with a function,
// calls that function on every element of the sequence and returns the element
// which produced the smallest value, ignoring any elements where the function
// returns null or produces a non-existence error.
func (t Term) Min(args ...interface{}) Term {
	return constructMethodTerm(t, "Min", p.Term_MIN, funcWrapArgs(args), map[string]interface{}{})
}

// Finds the maximum of a sequence. If called with a field name, finds the element
// of that sequence with the largest value in that field. If called with a function,
// calls that function on every element of the sequence and returns the element
// which produced the largest value, ignoring any elements where the function
// returns null or produces a non-existence error.
func (t Term) Max(args ...interface{}) Term {
	return constructMethodTerm(t, "Max", p.Term_MAX, funcWrapArgs(args), map[string]interface{}{})
}
