import React from 'react';

import { Popup, Icon } from 'semantic-ui-react';

const Tooltip = (props) => {
  return (
    <Popup
      trigger={<Icon color="blue" name="help circle" />}
      content={props.content}
      basic
    />
  )
}

export default Tooltip;
