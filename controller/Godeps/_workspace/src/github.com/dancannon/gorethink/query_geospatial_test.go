package gorethink

import (
	"github.com/dancannon/gorethink/types"

	test "gopkg.in/check.v1"
)

func (s *RethinkSuite) TestGeospatialDecodeGeometryPseudoType(c *test.C) {
	var response types.Geometry
	res, err := Expr(map[string]interface{}{
		"$reql_type$": "GEOMETRY",
		"type":        "Polygon",
		"coordinates": []interface{}{
			[]interface{}{
				[]interface{}{-122.423246, 37.779388},
				[]interface{}{-122.423246, 37.329898},
				[]interface{}{-121.88642, 37.329898},
				[]interface{}{-121.88642, 37.779388},
				[]interface{}{-122.423246, 37.779388},
			},
		},
	}).Run(sess)
	c.Assert(err, test.IsNil)

	err = res.One(&response)
	c.Assert(err, test.IsNil)
	c.Assert(response, test.DeepEquals, types.Geometry{
		Type: "Polygon",
		Lines: types.Lines{
			types.Line{
				types.Point{Lon: -122.423246, Lat: 37.779388},
				types.Point{Lon: -122.423246, Lat: 37.329898},
				types.Point{Lon: -121.88642, Lat: 37.329898},
				types.Point{Lon: -121.88642, Lat: 37.779388},
				types.Point{Lon: -122.423246, Lat: 37.779388},
			},
		},
	})
}

func (s *RethinkSuite) TestGeospatialEncodeGeometryPseudoType(c *test.C) {
	encoded, err := encode(types.Geometry{
		Type: "Polygon",
		Lines: types.Lines{
			types.Line{
				types.Point{Lon: -122.423246, Lat: 37.779388},
				types.Point{Lon: -122.423246, Lat: 37.329898},
				types.Point{Lon: -121.88642, Lat: 37.329898},
				types.Point{Lon: -121.88642, Lat: 37.779388},
				types.Point{Lon: -122.423246, Lat: 37.779388},
			},
		},
	})
	c.Assert(err, test.IsNil)
	c.Assert(encoded, test.DeepEquals, map[string]interface{}{
		"$reql_type$": "GEOMETRY",
		"type":        "Polygon",
		"coordinates": []interface{}{
			[]interface{}{
				[]interface{}{-122.423246, 37.779388},
				[]interface{}{-122.423246, 37.329898},
				[]interface{}{-121.88642, 37.329898},
				[]interface{}{-121.88642, 37.779388},
				[]interface{}{-122.423246, 37.779388},
			},
		},
	})
}

func (s *RethinkSuite) TestGeospatialCircle(c *test.C) {
	var response types.Geometry
	res, err := Circle([]float64{-122.423246, 37.779388}, 10).Run(sess)
	c.Assert(err, test.IsNil)

	err = res.One(&response)
	c.Assert(err, test.IsNil)
	c.Assert(response, test.DeepEquals, types.Geometry{
		Type: "Polygon",
		Lines: types.Lines{
			types.Line{
				types.Point{Lon: -122.423246, Lat: 37.77929790366427},
				types.Point{Lon: -122.42326814543915, Lat: 37.77929963483801},
				types.Point{Lon: -122.4232894398445, Lat: 37.779304761831504},
				types.Point{Lon: -122.42330906488651, Lat: 37.77931308761787},
				types.Point{Lon: -122.42332626638755, Lat: 37.77932429224285},
				types.Point{Lon: -122.42334038330416, Lat: 37.77933794512014},
				types.Point{Lon: -122.42335087313059, Lat: 37.77935352157849},
				types.Point{Lon: -122.42335733274696, Lat: 37.77937042302436},
				types.Point{Lon: -122.4233595139113, Lat: 37.77938799994533},
				types.Point{Lon: -122.42335733279968, Lat: 37.7794055768704},
				types.Point{Lon: -122.42335087322802, Lat: 37.779422478327966},
				types.Point{Lon: -122.42334038343147, Lat: 37.77943805480385},
				types.Point{Lon: -122.42332626652532, Lat: 37.779451707701796},
				types.Point{Lon: -122.42330906501378, Lat: 37.77946291234741},
				types.Point{Lon: -122.42328943994191, Lat: 37.77947123815131},
				types.Point{Lon: -122.42326814549187, Lat: 37.77947636515649},
				types.Point{Lon: -122.423246, Lat: 37.779478096334365},
				types.Point{Lon: -122.42322385450814, Lat: 37.77947636515649},
				types.Point{Lon: -122.4232025600581, Lat: 37.77947123815131},
				types.Point{Lon: -122.42318293498623, Lat: 37.77946291234741},
				types.Point{Lon: -122.42316573347469, Lat: 37.779451707701796},
				types.Point{Lon: -122.42315161656855, Lat: 37.77943805480385},
				types.Point{Lon: -122.423141126772, Lat: 37.779422478327966},
				types.Point{Lon: -122.42313466720033, Lat: 37.7794055768704},
				types.Point{Lon: -122.42313248608872, Lat: 37.77938799994533},
				types.Point{Lon: -122.42313466725305, Lat: 37.77937042302436},
				types.Point{Lon: -122.42314112686942, Lat: 37.77935352157849},
				types.Point{Lon: -122.42315161669585, Lat: 37.77933794512014},
				types.Point{Lon: -122.42316573361246, Lat: 37.77932429224285},
				types.Point{Lon: -122.4231829351135, Lat: 37.77931308761787},
				types.Point{Lon: -122.42320256015552, Lat: 37.779304761831504},
				types.Point{Lon: -122.42322385456086, Lat: 37.77929963483801},
				types.Point{Lon: -122.423246, Lat: 37.77929790366427},
			},
		},
	})
}

func (s *RethinkSuite) TestGeospatialCirclePoint(c *test.C) {
	var response types.Geometry
	res, err := Circle(Point(-122.423246, 37.779388), 10).Run(sess)
	c.Assert(err, test.IsNil)

	err = res.One(&response)
	c.Assert(err, test.IsNil)
	c.Assert(response, test.DeepEquals, types.Geometry{
		Type: "Polygon",
		Lines: types.Lines{
			types.Line{
				types.Point{Lon: -122.423246, Lat: 37.77929790366427},
				types.Point{Lon: -122.42326814543915, Lat: 37.77929963483801},
				types.Point{Lon: -122.4232894398445, Lat: 37.779304761831504},
				types.Point{Lon: -122.42330906488651, Lat: 37.77931308761787},
				types.Point{Lon: -122.42332626638755, Lat: 37.77932429224285},
				types.Point{Lon: -122.42334038330416, Lat: 37.77933794512014},
				types.Point{Lon: -122.42335087313059, Lat: 37.77935352157849},
				types.Point{Lon: -122.42335733274696, Lat: 37.77937042302436},
				types.Point{Lon: -122.4233595139113, Lat: 37.77938799994533},
				types.Point{Lon: -122.42335733279968, Lat: 37.7794055768704},
				types.Point{Lon: -122.42335087322802, Lat: 37.779422478327966},
				types.Point{Lon: -122.42334038343147, Lat: 37.77943805480385},
				types.Point{Lon: -122.42332626652532, Lat: 37.779451707701796},
				types.Point{Lon: -122.42330906501378, Lat: 37.77946291234741},
				types.Point{Lon: -122.42328943994191, Lat: 37.77947123815131},
				types.Point{Lon: -122.42326814549187, Lat: 37.77947636515649},
				types.Point{Lon: -122.423246, Lat: 37.779478096334365},
				types.Point{Lon: -122.42322385450814, Lat: 37.77947636515649},
				types.Point{Lon: -122.4232025600581, Lat: 37.77947123815131},
				types.Point{Lon: -122.42318293498623, Lat: 37.77946291234741},
				types.Point{Lon: -122.42316573347469, Lat: 37.779451707701796},
				types.Point{Lon: -122.42315161656855, Lat: 37.77943805480385},
				types.Point{Lon: -122.423141126772, Lat: 37.779422478327966},
				types.Point{Lon: -122.42313466720033, Lat: 37.7794055768704},
				types.Point{Lon: -122.42313248608872, Lat: 37.77938799994533},
				types.Point{Lon: -122.42313466725305, Lat: 37.77937042302436},
				types.Point{Lon: -122.42314112686942, Lat: 37.77935352157849},
				types.Point{Lon: -122.42315161669585, Lat: 37.77933794512014},
				types.Point{Lon: -122.42316573361246, Lat: 37.77932429224285},
				types.Point{Lon: -122.4231829351135, Lat: 37.77931308761787},
				types.Point{Lon: -122.42320256015552, Lat: 37.779304761831504},
				types.Point{Lon: -122.42322385456086, Lat: 37.77929963483801},
				types.Point{Lon: -122.423246, Lat: 37.77929790366427},
			},
		},
	})
}

func (s *RethinkSuite) TestGeospatialCirclePointFill(c *test.C) {
	var response types.Geometry
	res, err := Circle(Point(-122.423246, 37.779388), 10, CircleOpts{Fill: true}).Run(sess)
	c.Assert(err, test.IsNil)

	err = res.One(&response)
	c.Assert(err, test.IsNil)
	c.Assert(response, test.DeepEquals, types.Geometry{
		Type: "Polygon",
		Lines: types.Lines{
			types.Line{
				types.Point{Lon: -122.423246, Lat: 37.77929790366427},
				types.Point{Lon: -122.42326814543915, Lat: 37.77929963483801},
				types.Point{Lon: -122.4232894398445, Lat: 37.779304761831504},
				types.Point{Lon: -122.42330906488651, Lat: 37.77931308761787},
				types.Point{Lon: -122.42332626638755, Lat: 37.77932429224285},
				types.Point{Lon: -122.42334038330416, Lat: 37.77933794512014},
				types.Point{Lon: -122.42335087313059, Lat: 37.77935352157849},
				types.Point{Lon: -122.42335733274696, Lat: 37.77937042302436},
				types.Point{Lon: -122.4233595139113, Lat: 37.77938799994533},
				types.Point{Lon: -122.42335733279968, Lat: 37.7794055768704},
				types.Point{Lon: -122.42335087322802, Lat: 37.779422478327966},
				types.Point{Lon: -122.42334038343147, Lat: 37.77943805480385},
				types.Point{Lon: -122.42332626652532, Lat: 37.779451707701796},
				types.Point{Lon: -122.42330906501378, Lat: 37.77946291234741},
				types.Point{Lon: -122.42328943994191, Lat: 37.77947123815131},
				types.Point{Lon: -122.42326814549187, Lat: 37.77947636515649},
				types.Point{Lon: -122.423246, Lat: 37.779478096334365},
				types.Point{Lon: -122.42322385450814, Lat: 37.77947636515649},
				types.Point{Lon: -122.4232025600581, Lat: 37.77947123815131},
				types.Point{Lon: -122.42318293498623, Lat: 37.77946291234741},
				types.Point{Lon: -122.42316573347469, Lat: 37.779451707701796},
				types.Point{Lon: -122.42315161656855, Lat: 37.77943805480385},
				types.Point{Lon: -122.423141126772, Lat: 37.779422478327966},
				types.Point{Lon: -122.42313466720033, Lat: 37.7794055768704},
				types.Point{Lon: -122.42313248608872, Lat: 37.77938799994533},
				types.Point{Lon: -122.42313466725305, Lat: 37.77937042302436},
				types.Point{Lon: -122.42314112686942, Lat: 37.77935352157849},
				types.Point{Lon: -122.42315161669585, Lat: 37.77933794512014},
				types.Point{Lon: -122.42316573361246, Lat: 37.77932429224285},
				types.Point{Lon: -122.4231829351135, Lat: 37.77931308761787},
				types.Point{Lon: -122.42320256015552, Lat: 37.779304761831504},
				types.Point{Lon: -122.42322385456086, Lat: 37.77929963483801},
				types.Point{Lon: -122.423246, Lat: 37.77929790366427},
			},
		},
	})
}

func (s *RethinkSuite) TestGeospatialPointDistanceMethod(c *test.C) {
	var response float64
	res, err := Point(-122.423246, 37.779388).Distance(Point(-117.220406, 32.719464)).Run(sess)
	c.Assert(err, test.IsNil)

	err = res.One(&response)
	c.Assert(err, test.IsNil)
	c.Assert(response, test.Equals, 734125.249602186)
}

func (s *RethinkSuite) TestGeospatialPointDistanceRoot(c *test.C) {
	var response float64
	res, err := Distance(Point(-122.423246, 37.779388), Point(-117.220406, 32.719464)).Run(sess)
	c.Assert(err, test.IsNil)

	err = res.One(&response)
	c.Assert(err, test.IsNil)
	c.Assert(response, test.Equals, 734125.249602186)
}

func (s *RethinkSuite) TestGeospatialPointDistanceRootKm(c *test.C) {
	var response float64
	res, err := Distance(Point(-122.423246, 37.779388), Point(-117.220406, 32.719464), DistanceOpts{Unit: "km"}).Run(sess)
	c.Assert(err, test.IsNil)

	err = res.One(&response)
	c.Assert(err, test.IsNil)
	c.Assert(response, test.Equals, 734.125249602186)
}

func (s *RethinkSuite) TestGeospatialFill(c *test.C) {
	var response types.Geometry
	res, err := Line(
		[]float64{-122.423246, 37.779388},
		[]float64{-122.423246, 37.329898},
		[]float64{-121.886420, 37.329898},
		[]float64{-121.886420, 37.779388},
	).Fill().Run(sess)
	c.Assert(err, test.IsNil)

	err = res.One(&response)
	c.Assert(err, test.IsNil)
	c.Assert(response, test.DeepEquals, types.Geometry{
		Type: "Polygon",
		Lines: types.Lines{
			types.Line{
				types.Point{Lon: -122.423246, Lat: 37.779388},
				types.Point{Lon: -122.423246, Lat: 37.329898},
				types.Point{Lon: -121.88642, Lat: 37.329898},
				types.Point{Lon: -121.88642, Lat: 37.779388},
				types.Point{Lon: -122.423246, Lat: 37.779388},
			},
		},
	})
}

func (s *RethinkSuite) TestGeospatialGeojson(c *test.C) {
	var response types.Geometry
	res, err := Geojson(map[string]interface{}{
		"type":        "Point",
		"coordinates": []interface{}{-122.423246, 37.779388},
	}).Run(sess)
	c.Assert(err, test.IsNil)

	err = res.One(&response)
	c.Assert(err, test.IsNil)
	c.Assert(response, test.DeepEquals, types.Geometry{
		Type:  "Point",
		Point: types.Point{Lon: -122.423246, Lat: 37.779388},
	})
}

func (s *RethinkSuite) TestGeospatialToGeojson(c *test.C) {
	var response map[string]interface{}
	res, err := Point(-122.423246, 37.779388).ToGeojson().Run(sess)
	c.Assert(err, test.IsNil)

	err = res.One(&response)
	c.Assert(err, test.IsNil)
	c.Assert(response, test.DeepEquals, map[string]interface{}{
		"type":        "Point",
		"coordinates": []interface{}{-122.423246, 37.779388},
	})
}

func (s *RethinkSuite) TestGeospatialGetIntersecting(c *test.C) {
	// Setup table
	Db("test").TableDrop("geospatial").Run(sess)
	Db("test").TableCreate("geospatial").Run(sess)
	Db("test").Table("geospatial").IndexCreate("area", IndexCreateOpts{
		Geo: true,
	}).Run(sess)
	Db("test").Table("geospatial").Insert([]interface{}{
		map[string]interface{}{"area": Circle(Point(-117.220406, 32.719464), 100000)},
		map[string]interface{}{"area": Circle(Point(-100.220406, 20.719464), 100000)},
		map[string]interface{}{"area": Circle(Point(-117.200406, 32.723464), 100000)},
	}).Run(sess)

	var response []interface{}
	res, err := Db("test").Table("geospatial").GetIntersecting(
		Circle(Point(-117.220406, 32.719464), 100000),
		GetIntersectingOpts{
			Index: "area",
		},
	).Run(sess)
	c.Assert(err, test.IsNil)

	err = res.All(&response)
	c.Assert(err, test.IsNil)
	c.Assert(response, test.HasLen, 2)
}

func (s *RethinkSuite) TestGeospatialGetNearest(c *test.C) {
	// Setup table
	Db("test").TableDrop("geospatial").Run(sess)
	Db("test").TableCreate("geospatial").Run(sess)
	Db("test").Table("geospatial").IndexCreate("area", IndexCreateOpts{
		Geo: true,
	}).Run(sess)
	Db("test").Table("geospatial").Insert([]interface{}{
		map[string]interface{}{"area": Circle(Point(-117.220406, 32.719464), 100000)},
		map[string]interface{}{"area": Circle(Point(-100.220406, 20.719464), 100000)},
		map[string]interface{}{"area": Circle(Point(-115.210306, 32.733364), 100000)},
	}).Run(sess)

	var response []interface{}
	res, err := Db("test").Table("geospatial").GetNearest(
		Point(-117.220406, 32.719464),
		GetNearestOpts{
			Index:   "area",
			MaxDist: 1,
		},
	).Run(sess)
	c.Assert(err, test.IsNil)

	err = res.All(&response)

	c.Assert(err, test.IsNil)
	c.Assert(response, test.HasLen, 1)
}

func (s *RethinkSuite) TestGeospatialIncludesTrue(c *test.C) {
	var response bool
	res, err := Polygon(
		Point(-122.4, 37.7),
		Point(-122.4, 37.3),
		Point(-121.8, 37.3),
		Point(-121.8, 37.7),
	).Includes(Point(-122.3, 37.4)).Run(sess)
	c.Assert(err, test.IsNil)

	err = res.One(&response)
	c.Assert(err, test.IsNil)
	c.Assert(response, test.Equals, true)
}

func (s *RethinkSuite) TestGeospatialIncludesFalse(c *test.C) {
	var response bool
	res, err := Polygon(
		Point(-122.4, 37.7),
		Point(-122.4, 37.3),
		Point(-121.8, 37.3),
		Point(-121.8, 37.7),
	).Includes(Point(100.3, 37.4)).Run(sess)
	c.Assert(err, test.IsNil)

	err = res.One(&response)
	c.Assert(err, test.IsNil)
	c.Assert(response, test.Equals, false)
}

func (s *RethinkSuite) TestGeospatialIntersectsTrue(c *test.C) {
	var response bool
	res, err := Polygon(
		Point(-122.4, 37.7),
		Point(-122.4, 37.3),
		Point(-121.8, 37.3),
		Point(-121.8, 37.7),
	).Intersects(Polygon(
		Point(-122.3, 37.4),
		Point(-122.4, 37.3),
		Point(-121.8, 37.3),
		Point(-121.8, 37.4),
	)).Run(sess)
	c.Assert(err, test.IsNil)

	err = res.One(&response)
	c.Assert(err, test.IsNil)
	c.Assert(response, test.Equals, true)
}

func (s *RethinkSuite) TestGeospatialIntersectsFalse(c *test.C) {
	var response bool
	res, err := Polygon(
		Point(-122.4, 37.7),
		Point(-122.4, 37.3),
		Point(-121.8, 37.3),
		Point(-121.8, 37.7),
	).Intersects(Polygon(
		Point(-102.4, 37.7),
		Point(-102.4, 37.3),
		Point(-101.8, 37.3),
		Point(-101.8, 37.7),
	)).Run(sess)
	c.Assert(err, test.IsNil)

	err = res.One(&response)
	c.Assert(err, test.IsNil)
	c.Assert(response, test.Equals, false)
}

func (s *RethinkSuite) TestGeospatialLineLatLon(c *test.C) {
	var response types.Geometry
	res, err := Line([]float64{-122.423246, 37.779388}, []float64{-121.886420, 37.329898}).Run(sess)
	c.Assert(err, test.IsNil)

	err = res.One(&response)
	c.Assert(err, test.IsNil)
	c.Assert(response, test.DeepEquals, types.Geometry{
		Type: "LineString",
		Line: types.Line{
			types.Point{Lon: -122.423246, Lat: 37.779388},
			types.Point{Lon: -121.886420, Lat: 37.329898},
		},
	})
}

func (s *RethinkSuite) TestGeospatialLinePoint(c *test.C) {
	var response types.Geometry
	res, err := Line(Point(-122.423246, 37.779388), Point(-121.886420, 37.329898)).Run(sess)
	c.Assert(err, test.IsNil)

	err = res.One(&response)
	c.Assert(err, test.IsNil)
	c.Assert(response, test.DeepEquals, types.Geometry{
		Type: "LineString",
		Line: types.Line{
			types.Point{Lon: -122.423246, Lat: 37.779388},
			types.Point{Lon: -121.886420, Lat: 37.329898},
		},
	})
}

func (s *RethinkSuite) TestGeospatialPoint(c *test.C) {
	var response types.Geometry
	res, err := Point(-122.423246, 37.779388).Run(sess)
	c.Assert(err, test.IsNil)

	err = res.One(&response)
	c.Assert(err, test.IsNil)
	c.Assert(response, test.DeepEquals, types.Geometry{
		Type:  "Point",
		Point: types.Point{Lon: -122.423246, Lat: 37.779388},
	})
}

func (s *RethinkSuite) TestGeospatialPolygon(c *test.C) {
	var response types.Geometry
	res, err := Polygon(Point(-122.423246, 37.779388), Point(-122.423246, 37.329898), Point(-121.886420, 37.329898)).Run(sess)
	c.Assert(err, test.IsNil)

	err = res.One(&response)
	c.Assert(err, test.IsNil)
	c.Assert(response, test.DeepEquals, types.Geometry{
		Type: "Polygon",
		Lines: types.Lines{
			types.Line{
				types.Point{Lon: -122.423246, Lat: 37.779388},
				types.Point{Lon: -122.423246, Lat: 37.329898},
				types.Point{Lon: -121.88642, Lat: 37.329898},
				types.Point{Lon: -122.423246, Lat: 37.779388},
			},
		},
	})
}

func (s *RethinkSuite) TestGeospatialPolygonSub(c *test.C) {
	var response types.Geometry
	res, err := Polygon(
		Point(-122.4, 37.7),
		Point(-122.4, 37.3),
		Point(-121.8, 37.3),
		Point(-121.8, 37.7),
	).PolygonSub(Polygon(
		Point(-122.3, 37.4),
		Point(-122.3, 37.6),
		Point(-122.0, 37.6),
		Point(-122.0, 37.4),
	)).Run(sess)
	c.Assert(err, test.IsNil)

	err = res.One(&response)
	c.Assert(err, test.IsNil)
	c.Assert(response, test.DeepEquals, types.Geometry{
		Type: "Polygon",
		Lines: types.Lines{
			types.Line{
				types.Point{Lon: -122.4, Lat: 37.7},
				types.Point{Lon: -122.4, Lat: 37.3},
				types.Point{Lon: -121.8, Lat: 37.3},
				types.Point{Lon: -121.8, Lat: 37.7},
				types.Point{Lon: -122.4, Lat: 37.7},
			},
			types.Line{
				types.Point{Lon: -122.3, Lat: 37.4},
				types.Point{Lon: -122.3, Lat: 37.6},
				types.Point{Lon: -122, Lat: 37.6},
				types.Point{Lon: -122, Lat: 37.4},
				types.Point{Lon: -122.3, Lat: 37.4},
			},
		},
	})
}
