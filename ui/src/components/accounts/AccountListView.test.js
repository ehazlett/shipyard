import React from "react";
import ReactDOM from "react-dom";
import { MemoryRouter } from "react-router";
import AccountListView from "./AccountListView";
import renderer from "react-test-renderer";

it("AccountListView renders without crashing", () => {
  const div = document.createElement("div");
  ReactDOM.render(
    <MemoryRouter>
      <AccountListView />
    </MemoryRouter>,
    div
  );
});

it("AccountListView snapshot matches", () => {
  const tree = renderer
    .create(<MemoryRouter><AccountListView /></MemoryRouter>)
    .toJSON();
  expect(tree).toMatchSnapshot();
});
