import React from "react";
import ReactDOM from "react-dom";
import { MemoryRouter } from "react-router";
import AccountsView from "./AccountsView";
import renderer from "react-test-renderer";

it("AccountsView renders without crashing", () => {
  const div = document.createElement("div");
  ReactDOM.render(
    <MemoryRouter>
      <AccountsView />
    </MemoryRouter>,
    div
  );
});

it("AccountsView snapshot matches", () => {
  const tree = renderer
    .create(<MemoryRouter><AccountsView /></MemoryRouter>)
    .toJSON();
  expect(tree).toMatchSnapshot();
});
