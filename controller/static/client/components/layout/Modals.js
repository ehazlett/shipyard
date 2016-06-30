import React from 'react';

import CreateServiceModal from '../services/CreateServiceModal';
import CreateVolumeModal from '../volumes/CreateVolumeModal';
import ImagePullModal from '../images/ImagePullModal';

const Modals = React.createClass({
  handleClick(ev) {
    if (ev.target == this.refs.modalDimmer) {
      this.props.hideModal();
    }
  },
  render() {
    const visible = _.filter(this.props.modals, function (k, v) {
      return k;
    }).length > 0;
    const modal_classes = visible ? 'ui dimmer modals page transition visible active' : 'ui dimmer modals page transition hidden';
    return (
      <div className={modal_classes} onClick={this.handleClick} ref="modalDimmer">
        <CreateServiceModal visible={this.props.modals['create-service-modal']} {...this.props} />
        <CreateVolumeModal visible={this.props.modals['create-volume-modal']} {...this.props} />
        <ImagePullModal visible={this.props.modals['pull-image']} {...this.props} />
      </div>
    );
  },
});

export default Modals;
