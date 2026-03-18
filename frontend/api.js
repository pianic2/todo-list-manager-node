const BASE_URL = resolveBaseUrl();

function resolveBaseUrl() {
  if (window.API_BASE_URL && typeof window.API_BASE_URL === 'string') {
    return window.API_BASE_URL.replace(/\/$/, '');
  }

  const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
  if (isLocalhost || window.location.protocol === 'file:') {
    return 'http://localhost:3000';
  }

  if (window.location.hostname) {
    return `${window.location.protocol}//${window.location.hostname}:3000`;
  }

  return 'http://localhost:3000';
}

async function apiRequest(path, method = 'GET', data = null, headers = {}) {
  const requestPath = /^https?:\/\//i.test(path)
    ? path
    : `${BASE_URL}${path.startsWith('/') ? '' : '/'}${path}`;

  let url = requestPath;
  const options = {
    method,
    mode: 'cors',
    headers: {
      'Content-Type': 'application/json',
      ...headers
    }
  };

  if (method === 'GET' && data) {
    const queryString = new URLSearchParams(data).toString();
    if (queryString) {
      url = `${url}?${queryString}`;
    }
  } else if (data) {
    options.body = JSON.stringify(data);
  }

  try {
    const response = await fetch(url, options);
    const contentType = response.headers.get('content-type') || '';
    const isJsonResponse = contentType.includes('application/json');
    const payload = isJsonResponse ? await response.json() : null;

    if (!response.ok) {
      const message = payload && payload.error
        ? payload.error
        : `Request failed with status ${response.status}`;
      throw new Error(message);
    }

    return payload;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Network request failed';
    throw new Error(message);
  }
}

async function getLists() {
  const response = await apiRequest('/lists');
  return response && response.data ? response.data : [];
}

async function createList(name) {
  const response = await apiRequest('/lists', 'POST', { title: name });
  return response ? response.data : null;
}

async function updateList(listId, title) {
  const response = await apiRequest(`/lists/${listId}`, 'PUT', { title: title });
  return response ? response.data : null;
}

async function deleteList(listId) {
  await apiRequest(`/lists/${listId}`, 'DELETE');
}

async function getItems(listId) {
  const response = await apiRequest(`/lists/${listId}/items`);
  return response && response.data ? response.data : [];
}

async function createItem(listId, text) {
  const response = await apiRequest(`/lists/${listId}/items`, 'POST', { text: text });
  return response ? response.data : null;
}

async function updateItem(listId, itemId, payload) {
  const response = await apiRequest(`/lists/${listId}/items/${itemId}`, 'PUT', payload);
  return response ? response.data : null;
}

async function changeItemStatus(listId, itemId, status) {
  const response = await apiRequest(`/lists/${listId}/items/${itemId}/status`, 'PATCH', { status });
  return response ? response.data : null;
}

async function deleteItem(listId, itemId) {
  await apiRequest(`/lists/${listId}/items/${itemId}`, 'DELETE');
}
