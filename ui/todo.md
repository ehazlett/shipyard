#TODO

* Merge `actions/`, `reducers/`, `sagas/` directory structure under
	`redux/` and name files with `<area>.<type>.js`.  This should help improve
	efficiency when working on a particular area of state
	e.g.
		actions/containers.js -> redux/containers.actions.js

* Sort direction icon isn't showing on tables

* Is there a better table component we can use than Reactable now?

* Table pagination

* Separate out "top level" view components into a `views/` directory

* Update to latest react-router and use new routes format

* Auto-expire success messages, this can probably be done by adding a
	"display until" timestamp to each message added that is used to check
	whether the message should be visible

* Form validation

* BUG: Create service doesn't show error message if create fails

* Update to latest redux

* On page load, check if user is logged in by requesting their account
	details, if not, remove login token and redirect to `/login`. This is
	probably a change that needs to happen in `sagas/user.js`, `authFlowSaga`

* Extract Breadcrumbs out into a common component that can be configured
	as a custom react-router route matcher

* Internationalization: https://github.com/yahoo/react-intl

* Forms: http://redux-form.com/6.2.0/
