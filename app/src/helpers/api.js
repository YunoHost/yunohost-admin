function objectToParams (object) {
  const urlParams = new URLSearchParams()
  for (const [key, value] of Object.entries(object)) {
    urlParams.append(key, value)
  }
  return urlParams
}

async function handleResponse (response) {
  if (!response.ok) return handleErrors(response)
  // FIXME the api should always return json objects
  const responseText = await response.text()
  try {
    return JSON.parse(responseText)
  } catch {
    return responseText
  }
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
    return fetch(
      '/api/' + uri, this.options
    ).then(handleResponse)
  },

  getAll (uris) {
    return Promise.all(uris.map((uri) => this.get(uri)))
  },

  post (uri, data = {}) {
    return fetch('/api/' + uri, {
      ...this.options,
      method: 'POST',
      body: objectToParams(data)
    }).then(handleResponse)
  },

  put (uri, data = {}) {
    return fetch('/api/' + uri, {
      ...this.options,
      method: 'PUT',
      body: objectToParams(data)
    }).then(handleResponse)
  },

  delete (uri, data = {}) {
    return fetch('/api/' + uri, {
      ...this.options,
      method: 'DELETE',
      body: objectToParams(data)
    }).then(response => response.ok ? 'ok' : handleErrors(response))
  }
}
