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
