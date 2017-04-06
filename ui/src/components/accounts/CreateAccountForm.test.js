import React from "react";
import ReactDOM from "react-dom";
import { MemoryRouter } from "react-router";
import CreateAccountForm from "./CreateAccountForm";
import renderer from "react-test-renderer";

it("CreateAccountForm renders without crashing", () => {
  const div = document.createElement("div");
  ReactDOM.render(
    <MemoryRouter>
      <CreateAccountForm />
    </MemoryRouter>,
    div
  );
});

it("CreateAccountForm snapshot matches", () => {
  const tree = renderer
    .create(<MemoryRouter><CreateAccountForm /></MemoryRouter>)
    .toJSON();
  expect(tree).toMatchSnapshot();
});
