package types

import "fmt"

type Geometry struct {
	Type  string
	Point Point
	Line  Line
	Lines Lines
}

type Point struct {
	Lon float64
	Lat float64
}
type Line []Point
type Lines []Line

func (p Point) Marshal() interface{} {
	return []interface{}{p.Lon, p.Lat}
}

func (l Line) Marshal() interface{} {
	coords := make([]interface{}, len(l))
	for i, point := range l {
		coords[i] = point.Marshal()
	}
	return coords
}

func (l Lines) Marshal() interface{} {
	coords := make([]interface{}, len(l))
	for i, line := range l {
		coords[i] = line.Marshal()
	}
	return coords
}

func UnmarshalPoint(v interface{}) (Point, error) {
	coords, ok := v.([]interface{})
	if !ok {
		return Point{}, fmt.Errorf("pseudo-type GEOMETRY object %v field \"coordinates\" is not valid", v)
	}
	if len(coords) != 2 {
		return Point{}, fmt.Errorf("pseudo-type GEOMETRY object %v field \"coordinates\" is not valid", v)
	}
	lon, ok := coords[0].(float64)
	if !ok {
		return Point{}, fmt.Errorf("pseudo-type GEOMETRY object %v field \"coordinates\" is not valid", v)
	}
	lat, ok := coords[1].(float64)
	if !ok {
		return Point{}, fmt.Errorf("pseudo-type GEOMETRY object %v field \"coordinates\" is not valid", v)
	}

	return Point{
		Lon: lon,
		Lat: lat,
	}, nil
}

func UnmarshalLineString(v interface{}) (Line, error) {
	points, ok := v.([]interface{})
	if !ok {
		return Line{}, fmt.Errorf("pseudo-type GEOMETRY object %v field \"coordinates\" is not valid", v)
	}

	var err error
	line := make(Line, len(points))
	for i, coords := range points {
		line[i], err = UnmarshalPoint(coords)
		if err != nil {
			return Line{}, err
		}
	}
	return line, nil
}

func UnmarshalPolygon(v interface{}) (Lines, error) {
	lines, ok := v.([]interface{})
	if !ok {
		return Lines{}, fmt.Errorf("pseudo-type GEOMETRY object %v field \"coordinates\" is not valid", v)
	}

	var err error
	polygon := make(Lines, len(lines))
	for i, line := range lines {
		polygon[i], err = UnmarshalLineString(line)
		if err != nil {
			return Lines{}, err
		}
	}
	return polygon, nil
}
