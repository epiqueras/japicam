import fetch from 'isomorphic-fetch'

function dispatcher(result, dispatch, handler, type) {
  if (!handler) return result
  if (typeof handler === 'function') {
    const ret = handler(result)
    if (ret && ret.type) dispatch(ret)
    return result
  }

  let actionObj
  switch (type) {
    case 'onRequest':
      actionObj = { type: handler, action: result }
      break
    case 'onSuccess':
      actionObj = { type: handler, json: result }
      break
    case 'onError':
      actionObj = { type: handler, error: result }
      break
    default:
      break
  }
  dispatch(actionObj)
  return result
}

export default function japicam(...apis) {
  apis = apis.map((api, i) => typeof api === 'object' ? api : { name: `API-${i + 1}`, root: api })

  return ({ dispatch }) => next => action => {
    const api = apis.find(api => api.name === action.type)
    if (api) {
      dispatcher(action, dispatch, action.onRequest || api.onRequest, 'onRequest')

      const method = action.method || api.method || 'GET'
      const headers = action.headers || api.headers || { 'Content-Type': 'application/json' }
      const timeout = action.timeout || api.timeout || 5000
      const body = method === 'GET' ? null : JSON.stringify(action.body || api.body)
      const params = action.params || api.params

      return fetch(api.root + (action.endpoint || ''), Object.assign({}, {
        method,
        headers,
        timeout,
        body,
      }, params))
      .then(res => res.json().then(json => res.ok ? dispatcher(json, dispatch, action.onSuccess || api.onSuccess, 'onSuccess') : dispatcher(json, dispatch, action.onError || api.onError, 'onError')))
      .catch(err => {
        if (err.type === 'request-timeout') dispatcher(err, dispatch, action.onTimeout || api.onTimeout, 'onError')
        return dispatcher(err, dispatch, action.onError || api.onError, 'onError')
      })
    }

    return next(action)
  }
}

export function japicamNoMiddleware(...apis) {
  return japicam(...apis)({ dispatch: a => a })(() => {
    throw new Error('Invalid API')
  })
}
