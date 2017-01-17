import React, { PropTypes } from 'react';

import $ from 'jquery';

import { Form as SUIForm } from 'semantic-ui-react';

import { getUnhandledProps } from '../../lib';

export default class Form extends React.Component {

  static defaultProps = {
    inline: true,
    validateOn: 'submit',
  };

  static propTypes = {
    validateOn: PropTypes.string,
    inline: PropTypes.bool,
    fields: PropTypes.object.isRequired,
    onSubmit: PropTypes.func.isRequired,
  };

  onSubmitValidator = (e, values) => {
    const form = $(this.form._form);

    form.form(this.state.formConfig)
      .form('validate form');

    if(form.form('is valid')) {
      this.props.onSubmit(e, values);
    } else {
      e.preventDefault();
    }
  };

  updateFormConfig = (props) => {
    const { inline, validateOn, fields } = props;
    this.setState({
      formConfig: {
        inline: inline,
        on: validateOn,
        fields,
      },
    });
  };

  componentWillReceiveProps(nextProps) {
    this.updateFormConfig(nextProps);
  }

  componentDidMount() {
    this.updateFormConfig(this.props);
  }

  render() {
    const rest = getUnhandledProps(Form, this.props);
    return (
      <SUIForm
        onSubmit={this.onSubmitValidator}
        ref={(input) => this.form = input}
        {...rest} />
    );
  }

  static Field = SUIForm.Field;
  static Button = SUIForm.Button;
  static Checkbox = SUIForm.Checkbox;
  static Dropdown = SUIForm.Dropdown;
  static Group = SUIForm.Group;
  static Input = SUIForm.Input;
  static Radio = SUIForm.Radio;
  static Select = SUIForm.Select;
  static TextArea = SUIForm.TextArea;
}
