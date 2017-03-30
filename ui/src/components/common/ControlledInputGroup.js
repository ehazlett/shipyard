import React, { PropTypes, Component } from "react";

import _ from "lodash";

import { Form, Button } from "semantic-ui-react";
import { Input } from "formsy-semantic-ui-react";

import { updateSpecFromInput } from "../../lib";

export default class ControlledInputGroup extends Component {
  static PropTypes = {
    value: PropTypes.array.isRequired,
    columns: PropTypes.array.isRequired,
    name: PropTypes.string.isRequired,
    singleColumn: PropTypes.boolean
  };

  changed = updatedValue => {
    const { name, onChange } = this.props;
    if (onChange) {
      onChange(
        {},
        {
          name,
          type: "ControlledInputGroup",
          value: updatedValue
        }
      );
    }
  };

  add = () => {
    const { value, columns, singleColumn } = this.props;
    if (singleColumn) {
      this.changed([...value, ""]);
    } else {
      const newRow = {};
      _.forEach(columns, c => {
        newRow[c.accessor] = "";
      });
      this.changed([...value, newRow]);
    }
  };

  remove = row => {
    const { value } = this.props;
    const idx = value.indexOf(row);
    this.changed([
      ...value.splice(0, idx),
      ...value.splice(idx + 1, value.length)
    ]);
  };

  onChangeHandler = (e, input) => {
    const { value } = this.props;
    const updatedProps = {
      value: [...value]
    };
    this.changed(updateSpecFromInput(input, updatedProps).value);
  };

  render() {
    const { columns, value, singleColumn, friendlyName } = this.props;
    return (
      <div className="ui field">
        {value.map((obj, idx) => {
          return (
            <Form.Group key={value.indexOf(obj)} widths="equal">
              {columns.map(column => {
                const columnName = singleColumn
                  ? `value[${idx}]`
                  : `value[${idx}].${column.accessor}`;

                const columnValue = singleColumn
                  ? value[idx]
                  : _.get(value[idx], column.accessor, "");

                return (
                  <Form.Field key={columns.indexOf(column)}>
                    <label>{column.name}</label>
                    {column.component
                      ? <column.component
                          name={columnName}
                          value={columnValue}
                          onChange={this.onChangeHandler}
                          type={column.type}
                          {...column.props}
                        />
                      : <Input
                          name={columnName}
                          value={columnValue}
                          onChange={this.onChangeHandler}
                          type={column.type}
                          {...column.props}
                        />}
                  </Form.Field>
                );
              })}
              <Form.Field width={1}>
                <label>&nbsp;</label>
                <Button
                  type="button"
                  icon="minus"
                  color="red"
                  onClick={() => {
                    this.remove(obj);
                  }}
                />
              </Form.Field>
            </Form.Group>
          );
        })}
        <Button
          basic
          color="blue"
          size="tiny"
          content={friendlyName}
          icon="plus"
          onClick={this.add}
          type="button"
        />
      </div>
    );
  }
}
