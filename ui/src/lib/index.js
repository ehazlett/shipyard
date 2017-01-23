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
  var splitImage = image.split('@');
  if(splitImage.length > 1) {
  	var splitSha = splitImage[1].split(':');
    return `${splitImage[0]}@${splitSha[0]}:${splitSha[1].substring(0, 12)}`;
  } else {
  	return image;
  }
}
