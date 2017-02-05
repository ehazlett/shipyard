import _ from 'lodash';

const pushUnique = (source, target) => source.forEach(x => {
  if (target.indexOf(x) === -1) target.push(x)
})

export const getUnhandledProps = (Component, props) => {
  const { autoControlledProps, defaultProps, propTypes } = Component
  let { handledProps } = Component

  if (!handledProps) {
    handledProps = []

    if (autoControlledProps) pushUnique(autoControlledProps, handledProps)
    if (defaultProps) pushUnique(Object.keys(defaultProps), handledProps)
    if (propTypes) pushUnique(Object.keys(propTypes), handledProps)

    Component.handledProps = handledProps
  }

  return Object.keys(props).reduce((acc, prop) => {
    if (handledProps.indexOf(prop) === -1) acc[prop] = props[prop]
    return acc
  }, {})
}

// FIXME: This is pretty hacky
export const shortenImageName = (image) => {
  const splitImage = image.split('@');
  if(splitImage.length > 1) {
  	const splitSha = splitImage[1].split(':');
    return `${splitImage[0]}@${splitSha[0]}:${splitSha[1].substring(0, 12)}`;
  } else {
  	return image;
  }
}

export const getReadableFileSizeString = (fileSizeInBytes) => {
  let i = -1;
  const byteUnits = [' kB', ' MB', ' GB', ' TB', 'PB', 'EB', 'ZB', 'YB'];
  do {
    fileSizeInBytes /= 1024;
    i++;
  } while (fileSizeInBytes > 1024);
  return Math.max(fileSizeInBytes, 0.1).toFixed(1) + byteUnits[i];
}

export const showError = (err) => {
  global.notification.addNotification({
    message: err.toString() || err,
    level: 'error',
    autoDismiss: 0,
  });
}

export const showSuccess = (msg) => {
  global.notification.addNotification({
    message: msg,
    level: 'success',
    autoDismiss: 5,
  });
}

export const updateSpecFromInput = (input, spec) => {
  const updatedSpec = Object.assign({}, spec);
  if(input.type === "number") {
    const num = parseFloat(input.value);
    if(isNaN(num)) {
      _.set(updatedSpec, input.name, null);
    } else {
      _.set(updatedSpec, input.name, num);
    }
  } else if(input.type === "checkbox") {
    _.set(updatedSpec, input.name, input.checked);
  } else {
    _.set(updatedSpec, input.name, input.value);
  }
  return updatedSpec;
}
