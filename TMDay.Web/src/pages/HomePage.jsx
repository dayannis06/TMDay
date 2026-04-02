import { useEffect, useState } from 'react'
import { searchTestCasesByName } from '../api/testCasesApi'

function HomePage() {
  const [testCases, setTestCases] = useState([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  const fetchTestCases = async (filter = '') => {
    setLoading(true)
    setError('')

    try {
      const result = await searchTestCasesByName(filter)
      setTestCases(Array.isArray(result) ? result : [])
    } catch (requestError) {
      setError(requestError.message)
      setTestCases([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const debounce = setTimeout(() => {
      fetchTestCases(search)
    }, 300)

    return () => clearTimeout(debounce)
  }, [search])

  const formatDate = (value) => {
    if (!value) {
      return '-'
    }

    const date = new Date(value)
    if (Number.isNaN(date.getTime())) {
      return '-'
    }

    return date.toLocaleString()
  }

  return (
    <>
      <section className="home-actions" aria-label="List actions">
        <div className="search-input-wrapper">
          <span className="search-input-icon" aria-hidden="true">
            🔍
          </span>
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by test case name"
            aria-label="Search by test case name"
          />
        </div>
        <button type="button" onClick={() => fetchTestCases(search)}>
          <span className="button-icon" aria-hidden="true">🔄</span>
          Refresh
        </button>
      </section>

      {loading && <p className="status">Loading test cases...</p>}

      {!loading && error && (
        <p className="status status-error">Error loading data: {error}</p>
      )}

      {!loading && !error && testCases.length === 0 && (
        <p className="status">No test cases to display.</p>
      )}

      {!loading && !error && testCases.length > 0 && (
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Epic</th>
                <th>App</th>
                <th>Component</th>
                <th>Assigned</th>
                <th>Created</th>
                <th># Scenarios</th>
              </tr>
            </thead>
            <tbody>
              {testCases.map((testCase) => (
                <tr key={testCase.tcId}>
                  <td>{testCase.tcId}</td>
                  <td>{testCase.tcName || '-'}</td>
                  <td>{testCase.tcEpic || '-'}</td>
                  <td>{testCase.tcApp || '-'}</td>
                  <td>{testCase.tcComponent || '-'}</td>
                  <td>{testCase.tcAssigned || '-'}</td>
                  <td>{formatDate(testCase.createdAt)}</td>
                  <td>
                    {Array.isArray(testCase.testScenarios)
                      ? testCase.testScenarios.length
                      : 0}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  )
}

export default HomePage