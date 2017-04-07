import React from "react";
import ReactDOM from "react-dom";
import AboutView from "./AboutView";
import renderer from "react-test-renderer";

it("AboutView renders without crashing", () => {
  const div = document.createElement("div");
  ReactDOM.render(<AboutView />, div);
});

it("AboutView snapshot matches", () => {
  const tree = renderer.create(<AboutView />).toJSON();
  expect(tree).toMatchSnapshot();
});
