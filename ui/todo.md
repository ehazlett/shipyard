#TODO

* Clear console of warnings/errors

* Invert `actions/`, `reducers/`, `sagas/` directory structure to bring
	business areas to the top level.  This should help improve efficiency
	when working on a particular area of state
	e.g.
		actions/containers.js -> containers/actions.js

* Separate out "top level" view components into a `views/` directory

* Auto-expire success messages, this can probably be done by adding a
	"display until" timestamp to each message added that is used to check
	whether the message should be visible

* Form validation

* BUG: Create service doesn't show error message if create fails

* BUG: Task filtering doesn't work on service inspect view

* Update to latest redux

* Update to latest react-router and use new routes format

* Table pagination

* On page load, check if user is logged in by requesting their account
	details, if not, remove login token and redirect to `/login`

* Extract Breadcrumbs out into a common component that can be configured
	as a custom react-router route matcher

* Internationalization: https://github.com/yahoo/react-intl

* Forms: http://redux-form.com/6.2.0/

* Sagas bring too much complexity and boilerplate? redux-promise-middleware?

