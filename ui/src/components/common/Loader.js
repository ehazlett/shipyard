import React from 'react';

import { Loader, Dimmer } from 'semantic-ui-react';

const ShipyardLoader = () => {
  return (
    <Dimmer inverted active>
      <Loader />
    </Dimmer>
  )
}

export default ShipyardLoader;

