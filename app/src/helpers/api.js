function objectToParams (object) {
  const urlParams = new URLSearchParams()
  for (const [key, value] of Object.entries(object)) {
    urlParams.append(key, value)
  }
  return urlParams
}

function handleResponse (response, type = 'json') {
  return response.ok ? response[type]() : handleErrors(response)
}

async function handleErrors (response) {
  if (response.status === 401) {
    throw new Error('Unauthorized')
  } else if (response.status === 400) {
    const message = await response.text()
    throw new Error(message)
  }
}

export default {
  options: {
    credentials: 'include',
    mode: 'cors',
    headers: {
      // FIXME is it important to keep this previous `Accept` header ?
      // 'Accept': 'application/json, text/javascript, */*; q=0.01',
      // Auto header is :
      // "Accept": "*/*",

      // Also is this still important ? (needed by back-end)
      'X-Requested-With': 'XMLHttpRequest'
    }
  },

  get (uri) {
    return fetch('/api/' + uri, this.options)
      .then(response => handleResponse(response))
      .catch(err => {
        console.log(err)
      })
  },

  post (uri, data) {
    return fetch('/api/' + uri, {
      ...this.options,
      method: 'POST',
      body: objectToParams(data)
    }).then(response => handleResponse(response))
  },

  put (uri, data) {
    return fetch('/api/' + uri, {
      ...this.options,
      method: 'PUT',
      body: objectToParams(data)
    }).then(response => handleResponse(response))
  },

  login (password) {
    return fetch('/api/login', {
      ...this.options,
      method: 'POST',
      body: objectToParams({ password })
    }).then(response => (response.ok))
  },

  logout () {
    return fetch('/api/logout', this.options).then(response => (response.ok))
  },

  getVersion () {
    return fetch('/api/versions', this.options).then(response => handleResponse(response))
  }
}
