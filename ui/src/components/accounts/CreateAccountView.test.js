import React from "react";
import ReactDOM from "react-dom";
import { MemoryRouter } from "react-router";
import CreateAccountView from "./CreateAccountView";
import renderer from "react-test-renderer";

it("CreateAccountView renders without crashing", () => {
  const div = document.createElement("div");
  ReactDOM.render(
    <MemoryRouter>
      <CreateAccountView />
    </MemoryRouter>,
    div
  );
});

it("CreateAccountView snapshot matches", () => {
  const tree = renderer
    .create(<MemoryRouter><CreateAccountView /></MemoryRouter>)
    .toJSON();
  expect(tree).toMatchSnapshot();
});
