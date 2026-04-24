import { useEffect, useState } from 'react'
import { searchTestCasesByName, getTestCaseProgress } from '../api/testCasesApi'

function HomePage({ onSelectTestCase }) {
  const [testCases, setTestCases] = useState([])
  const [progressMap, setProgressMap] = useState({})
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  const fetchTestCases = async (filter = '') => {
    setLoading(true)
    setError('')

    try {
      const result = await searchTestCasesByName(filter)
      const list = Array.isArray(result) ? result : []
      setTestCases(list)

      const progressEntries = await Promise.all(
        list.map((tc) =>
          getTestCaseProgress(tc.tcId)
            .then((data) => [tc.tcId, Array.isArray(data) ? data : []])
            .catch(() => [tc.tcId, []])
        )
      )
      setProgressMap(Object.fromEntries(progressEntries))
    } catch (requestError) {
      setError(requestError.message)
      setTestCases([])
      setProgressMap({})
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
                <th>App</th>
                <th>Assigned</th>
                <th>Created</th>
                <th>Updated</th>
                <th>Progress</th>
              </tr>
            </thead>
            <tbody>
              {testCases.map((testCase) => (
                <tr
                  key={testCase.tcId}
                  className="clickable-row"
                  onClick={() => onSelectTestCase(testCase.tcId)}
                >
                  <td>{testCase.tcId}</td>
                  <td>{testCase.tcName || '-'}</td>
                  <td>{testCase.tcApp || '-'}</td>
                  <td>{testCase.tcAssigned || '-'}</td>
                  <td>{formatDate(testCase.createdAt)}</td>
                  <td>{formatDate(testCase.updatedAt)}</td>
                  <td>
                    <div className="progress-badges">
                      {(progressMap[testCase.tcId] ?? []).map((item) => (
                        <span key={item.state} className={`progress-badge progress-badge--${item.state.toLowerCase()}`}>
                          {item.state} {item.count} ({item.percentage}%)
                        </span>
                      ))}
                      {(progressMap[testCase.tcId] ?? []).length === 0 && '-'}
                    </div>
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