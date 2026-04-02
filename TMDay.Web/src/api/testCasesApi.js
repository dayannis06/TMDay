const API_BASE_URL = 'http://localhost:5206'

const request = async (path, options = {}) => {
  const response = await fetch(`${API_BASE_URL}${path}`, options)
  if (!response.ok) {
    throw new Error(`HTTP error: ${response.status}`)
  }

  if (response.status === 204) {
    return null
  }

  return response.json()
}

export const getTestCases = () => request('/testcase')

export const searchTestCasesByName = (filter = '') => {
  const term = filter.trim()
  if (!term) {
    return request('/testcase/search-by-name')
  }

  return request(`/testcase/search-by-name?filter=${encodeURIComponent(term)}`)
}

export const getEnums = () => request('/testcase/enums')

export const createTestCase = (payload) =>
  request('/testcase', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })

export const createTestScenario = (testCaseId, payload) =>
  request(`/testcase/${testCaseId}/scenario`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })