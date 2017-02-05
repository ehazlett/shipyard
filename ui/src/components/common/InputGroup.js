import React from 'react';

import uuid from 'uuid';

import { Form, Button } from 'semantic-ui-react';
import { Input } from 'formsy-semantic-ui-react';

export default class InputGroup extends React.Component {
  state = {
    keys: [],
  };

  add = () => {
    const { keys } = this.state;
    this.setState({
      keys: [...keys, uuid()],
    })
  }

  remove = (id) => {
    const { keys } = this.state;
    this.setState({
      keys: keys.filter((k) => k !== id),
    });
  }

  render() {
    const { keys } = this.state;
    const { columns, friendlyName, inputName } = this.props;

    return (
      <div className="ui field">
        {keys.map((key, idx) => {
          return (
            <Form.Group key={key} widths="equal">
              {columns.map((columnName) => {
                return (
                  <Form.Field key={columnName}>
                    <label>{columnName}</label>
                    <Input name={`${inputName}[${idx}].${columnName.replace(' ','')}`} fluid />
                  </Form.Field>
                );
              })}
              <Form.Field width={1}>
                <label>&nbsp;</label>
                <Button type="button" icon="minus" color="red" onClick={() => { this.remove(key); }} />
              </Form.Field>
            </Form.Group>
          );
        })}
        <Button basic color="blue" size="tiny" content={friendlyName} icon="plus" onClick={this.add} type="button" />
      </div>
    );
  }
}
