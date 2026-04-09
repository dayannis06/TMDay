import { useEffect, useState } from 'react'
import {
  getTestCaseById,
  getEnums,
  updateTestCase,
  deleteTestCase,
  createTestScenario,
  updateTestScenario,
  deleteTestScenario,
} from '../api/testCasesApi'

const emptyScenarioForm = {
  name: '',
  preRequisites: '',
  data: '',
  steps: '',
  expectedResult: '',
  actualResult: '',
  status: '',
  type: '',
}

const mapScenarioToForm = (selectedScenario, statuses, types) => ({
  name: selectedScenario?.name || '',
  preRequisites: selectedScenario?.preRequisites || '',
  data: selectedScenario?.data || '',
  steps: selectedScenario?.steps || '',
  expectedResult: selectedScenario?.expectedResult || '',
  actualResult: selectedScenario?.actualResult || '',
  status: selectedScenario?.status || statuses[0] || '',
  type: selectedScenario?.type || types[0] || '',
})

export default function TestCasePage({ testCaseId, onGoHome }) {
  const [form, setForm] = useState(null)
  const [statusOptions, setStatusOptions] = useState([])
  const [typeOptions, setTypeOptions] = useState([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [deletingTestCase, setDeletingTestCase] = useState(false)
  const [addingScenario, setAddingScenario] = useState(false)
  const [editingScenario, setEditingScenario] = useState(false)
  const [deletingScenarioId, setDeletingScenarioId] = useState(null)
  const [showScenarioForm, setShowScenarioForm] = useState(false)
  const [selectedScenarioId, setSelectedScenarioId] = useState(null)
  const [scenarioEdit, setScenarioEdit] = useState(emptyScenarioForm)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [scenario, setScenario] = useState({
    name: '',
    preRequisites: '',
    data: '',
    steps: '',
    expectedResult: '',
    actualResult: '',
    status: '',
    type: '',
  })

  useEffect(() => {
    if (!testCaseId) return

    setForm(null)
    setMessage('')
    setError('')
    setLoading(true)

    Promise.all([getTestCaseById(testCaseId), getEnums()])
      .then(([tc, enums]) => {
        setForm(tc)
        const statuses = Array.isArray(enums?.testScenarioStatuses) ? enums.testScenarioStatuses : []
        const types = Array.isArray(enums?.testScenarioTypes) ? enums.testScenarioTypes : []
        setStatusOptions(statuses)
        setTypeOptions(types)
        setScenario((prev) => ({ ...prev, status: statuses[0] ?? '', type: types[0] ?? '' }))
        setSelectedScenarioId(null)
        setScenarioEdit(emptyScenarioForm)
      })
      .catch((err) => setError(`Unable to load test case: ${err.message}`))
      .finally(() => setLoading(false))
  }, [testCaseId])

  const resetMessages = () => {
    setMessage('')
    setError('')
  }

  const handleSaveGeneral = async (event) => {
    event.preventDefault()
    resetMessages()
    setSaving(true)
    try {
      await updateTestCase(testCaseId, form)
      setMessage('General information saved.')
    } catch (err) {
      setError(`Unable to save: ${err.message}`)
    } finally {
      setSaving(false)
    }
  }

  const handleAddScenario = async (event) => {
    event.preventDefault()
    resetMessages()

    const requiredFields = [
      scenario.name,
      scenario.preRequisites,
      scenario.data,
      scenario.steps,
      scenario.expectedResult,
      scenario.actualResult,
    ]

    if (requiredFields.some((f) => !f.trim())) {
      setError('Please complete all scenario fields.')
      return
    }

    setAddingScenario(true)
    try {
      await createTestScenario(testCaseId, scenario)
      const updated = await getTestCaseById(testCaseId)
      setForm(updated)
      setMessage('Scenario added.')
      setScenario({
        name: '',
        preRequisites: '',
        data: '',
        steps: '',
        expectedResult: '',
        actualResult: '',
        status: statusOptions[0] ?? '',
        type: typeOptions[0] ?? '',
      })
      setShowScenarioForm(false)
    } catch (err) {
      setError(`Unable to add scenario: ${err.message}`)
    } finally {
      setAddingScenario(false)
    }
  }

  const handleDeleteTestCase = async () => {
    resetMessages()

    const shouldDelete = window.confirm('Are you sure you want to delete this test case?')
    if (!shouldDelete) {
      return
    }

    setDeletingTestCase(true)
    try {
      await deleteTestCase(testCaseId)
      onGoHome()
    } catch (err) {
      setError(`Unable to delete test case: ${err.message}`)
    } finally {
      setDeletingTestCase(false)
    }
  }

  const handleSelectScenario = (selectedScenario) => {
    resetMessages()
    setSelectedScenarioId(selectedScenario.id)
    setScenarioEdit(mapScenarioToForm(selectedScenario, statusOptions, typeOptions))
    setShowScenarioForm(false)
  }

  const handleSaveScenarioEdit = async (event) => {
    event.preventDefault()
    if (!selectedScenarioId) return

    resetMessages()

    const requiredFields = [
      scenarioEdit.name,
      scenarioEdit.preRequisites,
      scenarioEdit.data,
      scenarioEdit.steps,
      scenarioEdit.expectedResult,
      scenarioEdit.actualResult,
    ]

    if (requiredFields.some((field) => !field.trim())) {
      setError('Please complete all scenario fields.')
      return
    }

    setEditingScenario(true)
    try {
      await updateTestScenario(testCaseId, selectedScenarioId, scenarioEdit)
      const updated = await getTestCaseById(testCaseId)
      setForm(updated)
      setMessage('Scenario updated.')
      setSelectedScenarioId(null)
      setScenarioEdit(emptyScenarioForm)
    } catch (err) {
      setError(`Unable to update scenario: ${err.message}`)
    } finally {
      setEditingScenario(false)
    }
  }

  const handleCancelScenarioEdit = () => {
    setSelectedScenarioId(null)
    setScenarioEdit(emptyScenarioForm)
  }

  const handleDeleteScenario = async (event, scenarioId) => {
    event.stopPropagation()
    resetMessages()

    const shouldDelete = window.confirm('Are you sure you want to delete this scenario?')
    if (!shouldDelete) {
      return
    }

    setDeletingScenarioId(scenarioId)
    try {
      await deleteTestScenario(testCaseId, scenarioId)
      const updated = await getTestCaseById(testCaseId)
      setForm(updated)

      if (selectedScenarioId === scenarioId) {
        setSelectedScenarioId(null)
        setScenarioEdit(emptyScenarioForm)
      }

      setMessage('Scenario deleted.')
    } catch (err) {
      setError(`Unable to delete scenario: ${err.message}`)
    } finally {
      setDeletingScenarioId(null)
    }
  }

  return (
    <>
        {loading && <p className="status">Loading...</p>}
        {!loading && error && !form && <p className="status status-error">{error}</p>}

        {!loading && form && (
          <>
            <section className="form-section" aria-label="General information">
              <h2>Test Case #{testCaseId}</h2>
              <h3 className="section-subtitle">General Information</h3>
              <form className="form-grid" onSubmit={handleSaveGeneral}>
                <label>
                  Name
                  <input
                    type="text"
                    value={form.tcName || ''}
                    onChange={(e) => setForm({ ...form, tcName: e.target.value })}
                  />
                </label>
                <label>
                  Epic
                  <input
                    type="text"
                    value={form.tcEpic || ''}
                    onChange={(e) => setForm({ ...form, tcEpic: e.target.value })}
                  />
                </label>
                <label>
                  App
                  <input
                    type="text"
                    value={form.tcApp || ''}
                    onChange={(e) => setForm({ ...form, tcApp: e.target.value })}
                  />
                </label>
                <label>
                  Component
                  <input
                    type="text"
                    value={form.tcComponent || ''}
                    onChange={(e) => setForm({ ...form, tcComponent: e.target.value })}
                  />
                </label>
                <label>
                  Story
                  <textarea
                    value={form.tcStory || ''}
                    onChange={(e) => setForm({ ...form, tcStory: e.target.value })}
                  />
                </label>
                <label>
                  Assigned
                  <input
                    type="text"
                    value={form.tcAssigned || ''}
                    onChange={(e) => setForm({ ...form, tcAssigned: e.target.value })}
                  />
                </label>
                <div className="form-actions">
                  <button type="submit" disabled={saving}>
                    <span className="button-icon" aria-hidden="true">💾</span>
                    {saving ? 'Saving...' : 'Save General Information'}
                  </button>
                  <button type="button" className="danger-btn" onClick={handleDeleteTestCase} disabled={deletingTestCase}>
                    <span className="button-icon" aria-hidden="true">✖</span>
                    {deletingTestCase ? 'Deleting...' : 'Delete Test Case'}
                  </button>
                  <button type="button" onClick={onGoHome}>
                    <span className="button-icon" aria-hidden="true">←</span>
                    Back to Home
                  </button>
                </div>
              </form>
            </section>

            <section className="form-section" aria-label="Test scenarios">
              <div className="section-toggle-header">
                <h3>
                  Test Scenarios ({(form.testScenarios || []).length})
                </h3>
                <button
                  type="button"
                  className="toggle-btn"
                  onClick={() => setShowScenarioForm((v) => !v)}
                >
                  <span className="button-icon" aria-hidden="true">{showScenarioForm ? '▲' : '▼'}</span>
                  {showScenarioForm ? 'Cancel' : 'New Scenario'}
                </button>
              </div>
              {(form.testScenarios || []).length === 0 ? (
                <p className="status">No scenarios yet.</p>
              ) : (
                <div className="table-wrapper">
                  <table>
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Status</th>
                        <th>Type</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {form.testScenarios.map((s) => (
                        <tr
                          key={s.id}
                          className={`clickable-row ${selectedScenarioId === s.id ? 'selected-row' : ''}`}
                          onClick={() => handleSelectScenario(s)}
                        >
                          <td>{s.name}</td>
                          <td>{s.status}</td>
                          <td>{s.type}</td>
                          <td>
                            <button
                              type="button"
                              className="icon-action-btn danger"
                              aria-label={`Delete scenario ${s.name}`}
                              title="Delete scenario"
                              onClick={(event) => handleDeleteScenario(event, s.id)}
                              disabled={deletingScenarioId === s.id}
                            >
                              {deletingScenarioId === s.id ? '…' : '✖'}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {selectedScenarioId && (
                <form className="form-grid" onSubmit={handleSaveScenarioEdit}>
                  <h4 className="section-subtitle">Edit Scenario #{selectedScenarioId}</h4>
                  <label>
                    Name
                    <input
                      type="text"
                      value={scenarioEdit.name}
                      onChange={(e) => setScenarioEdit({ ...scenarioEdit, name: e.target.value })}
                    />
                  </label>
                  <label>
                    Pre-requisites
                    <textarea
                      value={scenarioEdit.preRequisites}
                      onChange={(e) => setScenarioEdit({ ...scenarioEdit, preRequisites: e.target.value })}
                    />
                  </label>
                  <label>
                    Data
                    <textarea
                      value={scenarioEdit.data}
                      onChange={(e) => setScenarioEdit({ ...scenarioEdit, data: e.target.value })}
                    />
                  </label>
                  <label>
                    Steps
                    <textarea
                      value={scenarioEdit.steps}
                      onChange={(e) => setScenarioEdit({ ...scenarioEdit, steps: e.target.value })}
                    />
                  </label>
                  <label>
                    Expected Result
                    <textarea
                      value={scenarioEdit.expectedResult}
                      onChange={(e) => setScenarioEdit({ ...scenarioEdit, expectedResult: e.target.value })}
                    />
                  </label>
                  <label>
                    Actual Result
                    <textarea
                      value={scenarioEdit.actualResult}
                      onChange={(e) => setScenarioEdit({ ...scenarioEdit, actualResult: e.target.value })}
                    />
                  </label>
                  <label>
                    Status
                    <select
                      value={scenarioEdit.status}
                      onChange={(e) => setScenarioEdit({ ...scenarioEdit, status: e.target.value })}
                      disabled={statusOptions.length === 0}
                    >
                      {statusOptions.length === 0 && <option value="">No options</option>}
                      {statusOptions.map((status) => (
                        <option key={status} value={status}>{status}</option>
                      ))}
                    </select>
                  </label>
                  <label>
                    Type
                    <select
                      value={scenarioEdit.type}
                      onChange={(e) => setScenarioEdit({ ...scenarioEdit, type: e.target.value })}
                      disabled={typeOptions.length === 0}
                    >
                      {typeOptions.length === 0 && <option value="">No options</option>}
                      {typeOptions.map((type) => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </label>
                  <div className="form-actions">
                    <button type="submit" disabled={editingScenario}>
                      <span className="button-icon" aria-hidden="true">✏️</span>
                      {editingScenario ? 'Saving...' : 'Save Scenario Changes'}
                    </button>
                    <button type="button" onClick={handleCancelScenarioEdit}>
                      <span className="button-icon" aria-hidden="true">✖</span>
                      Cancel Edit
                    </button>
                  </div>
                </form>
              )}

              {showScenarioForm && (
              <form className="form-grid" onSubmit={handleAddScenario}>
                <label>
                  Name
                  <input
                    type="text"
                    value={scenario.name}
                    onChange={(e) => setScenario({ ...scenario, name: e.target.value })}
                  />
                </label>
                <label>
                  Pre-requisites
                  <textarea
                    value={scenario.preRequisites}
                    onChange={(e) => setScenario({ ...scenario, preRequisites: e.target.value })}
                  />
                </label>
                <label>
                  Data
                  <textarea
                    value={scenario.data}
                    onChange={(e) => setScenario({ ...scenario, data: e.target.value })}
                  />
                </label>
                <label>
                  Steps
                  <textarea
                    value={scenario.steps}
                    onChange={(e) => setScenario({ ...scenario, steps: e.target.value })}
                  />
                </label>
                <label>
                  Expected Result
                  <textarea
                    value={scenario.expectedResult}
                    onChange={(e) => setScenario({ ...scenario, expectedResult: e.target.value })}
                  />
                </label>
                <label>
                  Actual Result
                  <textarea
                    value={scenario.actualResult}
                    onChange={(e) => setScenario({ ...scenario, actualResult: e.target.value })}
                  />
                </label>
                <label>
                  Status
                  <select
                    value={scenario.status}
                    onChange={(e) => setScenario({ ...scenario, status: e.target.value })}
                    disabled={statusOptions.length === 0}
                  >
                    {statusOptions.length === 0 && <option value="">No options</option>}
                    {statusOptions.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </label>
                <label>
                  Type
                  <select
                    value={scenario.type}
                    onChange={(e) => setScenario({ ...scenario, type: e.target.value })}
                    disabled={typeOptions.length === 0}
                  >
                    {typeOptions.length === 0 && <option value="">No options</option>}
                    {typeOptions.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </label>
                <div className="form-actions">
                  <button type="submit" disabled={addingScenario}>
                    <span className="button-icon" aria-hidden="true">🧩</span>
                    {addingScenario ? 'Adding...' : 'Add Scenario'}
                  </button>
                </div>
              </form>
              )}
            </section>
          </>
        )}

        {message && <p className="status status-success">{message}</p>}
        {error && form && <p className="status status-error">{error}</p>}
    </>
  )
}