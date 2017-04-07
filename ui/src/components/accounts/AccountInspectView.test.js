import React from "react";
import ReactDOM from "react-dom";
import { MemoryRouter } from "react-router";
import AccountInspectView from "./AccountInspectView";
import renderer from "react-test-renderer";

it("AccountInspectView renders without crashing", () => {
  const div = document.createElement("div");
  ReactDOM.render(
    <MemoryRouter>
      <AccountInspectView match={{ params: { id: "id" } }} />
    </MemoryRouter>,
    div
  );
});

it("AccountInspectView snapshot matches", () => {
  const tree = renderer
    .create(
      <MemoryRouter>
        <AccountInspectView match={{ params: { id: "id" } }} />
      </MemoryRouter>
    )
    .toJSON();
  expect(tree).toMatchSnapshot();
});
