# JAPICAM
> JSON API Caller And Middleware.

JAPICAM is a tool for simplifying connections to JSON APIs. It works really well as Redux Middleware, but it's also helpful in any setting.

<br>

## The Gist
```js
import japicam from 'japicam'

//...applyMiddleware( /* Whatever method you are using for adding middleware in redux */
japicam({ // You can configure as many APIs as you want
  name: 'MAIN-API',
  root: 'https://aniceapi.com/api',
  method: 'POST', // Optional, defaults to 'GET'
  headers: {}, // Optional, defaults to { 'Content-Type': 'application/json' }
  timeout: 1000, // Optional, defaults to 5000
  body: {}, // Optional, won't be used in 'GET' requests
  params: {}, // Optional, extra properties to assign to the request object
  onSuccess: json => {/* ... */} || 'FETCHED_DATA', // Optional, action creator or action name to dispatch when the request is succesful
  onTimeout: error => {/* ... */} || 'TIMED_OUT', // Optional, action creator or action name to dispatch when the request times out
  onError: (error || json) => {/* ... */} || 'REQUEST_ERROR', // Optional, action creator or action name to dispatch when the request throws an error or the response is not in the range 200-299
}, 'https://anotherniceapi.com/api') // You can also pass a string and the name will default to `API-${paramIndex}`
// )

// Somewhere else in your code:
dispatch({
  type: 'MAIN-API',
  endpoint: '/posts/1',
  onSuccess: 'POSTS-FETCHED',
  headers: { 'Content-Type': 'application/json', /* More properties... */ },
})
```

When the value of onSuccess, onTimeout, or onError is a string. JAPICAM will dispatch an action with `type: thatString` and `json: responseJson` or `error: responseError`. This way you don't have to create an action creator function to handle request responses in your reducers.

Any property on the action object will overwrite those that initialized JAPICAM. Think of the initial configuration object as specifying defaults that you can later overwrite in specific actions.

Dispatch will return a promise that resolves to json or an error object so you can wait for it to resolve in your code.
`dispatch({ type: 'MAIN-API', endpoint: '/posts/1' }).then(result => console.log(result))`

<br>

## Example: Retrying Requests
You could retry a timed out request like this:

```js
dispatch({
  type: 'MAIN-API',
  endpoint: '/posts/1',
  onTimeout: (error) => { dispatch({ type: 'MAIN-API', endpoint: '/posts/1' }) },
})
```

<br>

# Usage Outside of Redux
```js
import { japicamNoMiddleware as japicam } from 'japicam'

const apiCaller = japicam({
  name: 'MAIN-API',
  root: 'https://aniceapi.com/api',
  timeout: 1000,
  body: {},
  params: {},
  onSuccess: json => console.log(json),
  onTimeout: error => console.error(error),
  onError: (error || json) => {/* ... */},
}, 'https://anotherniceapi.com/api')

apiCaller({
  type: 'API-2' // We are using the second one this time
  onSuccess: json => console.log(json),
}).then(result => console.log(result)) // You can also attach to the promise chain
```
