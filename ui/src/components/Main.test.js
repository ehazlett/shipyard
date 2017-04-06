import React from "react";
import ReactDOM from "react-dom";
import Main from "./Main";
import renderer from "react-test-renderer";

it("Main renders without crashing", () => {
  const div = document.createElement("div");
  ReactDOM.render(<Main />, div);
});

it("Main snapshot matches", () => {
  const tree = renderer.create(<Main />).toJSON();
  expect(tree).toMatchSnapshot();
});
