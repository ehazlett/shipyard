import React, { PropTypes } from 'react';

import { Container, Button } from 'react-semantify';

const SwarmInitView = ({ swarmInit }) => (
  <Container className="center middle aligned">
    <div className="ui centered grid">
      <div className="ui eight wide center aligned column">
        <h2 className="ui header" style={{ marginTop: '5em', marginBottom: '1.5em' }}>
          <div className="content">
            Get Started
            <div className="sub header">
              To start using Docker Swarm you will need to initialize your swarm cluster, press the
              button below to get started now
            </div>
          </div>
        </h2>

        <Button className="big green" onClick={swarmInit}>Initialize</Button>
      </div>
    </div>
  </Container>
);

SwarmInitView.propTypes = {
  swarmInit: PropTypes.func.isRequired,
};

export default SwarmInitView;
