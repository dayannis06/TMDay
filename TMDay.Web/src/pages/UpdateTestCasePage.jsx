import { useCallback, useEffect, useRef, useState } from 'react'
import {
  getTestCaseById,
  getEnums,
  getTestCaseProgress,
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
  const [progress, setProgress] = useState([])
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
  const [toasts, setToasts] = useState([])
  const toastIdRef = useRef(0)
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

  const dismissToast = useCallback((id) => {
    setToasts((prev) =>
      prev.map((t) => (t.id === id ? { ...t, exiting: true } : t)),
    )
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 250)
  }, [])

  const addToast = useCallback((message, type) => {
    const id = ++toastIdRef.current
    setToasts((prev) => [...prev, { id, message, type, exiting: false }])
    setTimeout(() => dismissToast(id), 5000)
  }, [dismissToast])

  useEffect(() => {
    if (!testCaseId) return

    setForm(null)
    setError('')
    setLoading(true)

    Promise.all([getTestCaseById(testCaseId), getEnums(), getTestCaseProgress(testCaseId)])
      .then(([tc, enums, prog]) => {
        setForm(tc)
        setProgress(Array.isArray(prog) ? prog : [])
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

  const handleSaveGeneral = async (event) => {
    event.preventDefault()
    setSaving(true)
    try {
      await updateTestCase(testCaseId, form)
      addToast('General information saved.', 'success')
    } catch (err) {
      addToast(`Unable to save: ${err.message}`, 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleAddScenario = async (event) => {
    event.preventDefault()

    const requiredFields = [
      scenario.name,
      scenario.preRequisites,
      scenario.data,
      scenario.steps,
      scenario.expectedResult,
      scenario.actualResult,
    ]

    if (requiredFields.some((f) => !f.trim())) {
      addToast('Please complete all scenario fields.', 'error')
      return
    }

    setAddingScenario(true)
    try {
      await createTestScenario(testCaseId, scenario)
      const [updated, prog] = await Promise.all([getTestCaseById(testCaseId), getTestCaseProgress(testCaseId)])
      setForm(updated)
      setProgress(Array.isArray(prog) ? prog : [])
      addToast('Scenario added.', 'success')
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
      addToast(`Unable to add scenario: ${err.message}`, 'error')
    } finally {
      setAddingScenario(false)
    }
  }

  const handleDeleteTestCase = async () => {
    const shouldDelete = window.confirm('Are you sure you want to delete this test case?')
    if (!shouldDelete) {
      return
    }

    setDeletingTestCase(true)
    try {
      await deleteTestCase(testCaseId)
      onGoHome()
    } catch (err) {
      addToast(`Unable to delete test case: ${err.message}`, 'error')
    } finally {
      setDeletingTestCase(false)
    }
  }

  const handleSelectScenario = (selectedScenario) => {
    setSelectedScenarioId(selectedScenario.id)
    setScenarioEdit(mapScenarioToForm(selectedScenario, statusOptions, typeOptions))
    setShowScenarioForm(false)
  }

  const handleSaveScenarioEdit = async (event) => {
    event.preventDefault()
    if (!selectedScenarioId) return

    const requiredFields = [
      scenarioEdit.name,
      scenarioEdit.preRequisites,
      scenarioEdit.data,
      scenarioEdit.steps,
      scenarioEdit.expectedResult,
      scenarioEdit.actualResult,
    ]

    if (requiredFields.some((field) => !field.trim())) {
      addToast('Please complete all scenario fields.', 'error')
      return
    }

    setEditingScenario(true)
    try {
      await updateTestScenario(testCaseId, selectedScenarioId, scenarioEdit)
      const [updated, prog] = await Promise.all([getTestCaseById(testCaseId), getTestCaseProgress(testCaseId)])
      setForm(updated)
      setProgress(Array.isArray(prog) ? prog : [])
      addToast('Scenario updated.', 'success')
      setSelectedScenarioId(null)
      setScenarioEdit(emptyScenarioForm)
    } catch (err) {
      addToast(`Unable to update scenario: ${err.message}`, 'error')
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

    const shouldDelete = window.confirm('Are you sure you want to delete this scenario?')
    if (!shouldDelete) {
      return
    }

    setDeletingScenarioId(scenarioId)
    try {
      await deleteTestScenario(testCaseId, scenarioId)
      const [updated, prog] = await Promise.all([getTestCaseById(testCaseId), getTestCaseProgress(testCaseId)])
      setForm(updated)
      setProgress(Array.isArray(prog) ? prog : [])

      if (selectedScenarioId === scenarioId) {
        setSelectedScenarioId(null)
        setScenarioEdit(emptyScenarioForm)
      }

      addToast('Scenario deleted.', 'success')
    } catch (err) {
      addToast(`Unable to delete scenario: ${err.message}`, 'error')
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
              <div className="section-header-row">
                <h2>Test Case #{testCaseId}</h2>
                <div className="metadata-row">
                  <span className="metadata-item">Created: {form.createdAt ? new Date(form.createdAt).toLocaleString() : '-'}</span>
                  <span className="metadata-item">Updated: {form.updatedAt ? new Date(form.updatedAt).toLocaleString() : '-'}</span>
                </div>
              </div>
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
                  <input
                    type="text"
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
              {progress.length > 0 && (
                <div className="progress-badges" style={{ marginTop: '8px', flexWrap: 'wrap' }}>
                  {progress.map((item) => (
                    <span key={item.state} className={`progress-badge progress-badge--${item.state.toLowerCase()}`}>
                      {item.state} {item.count} ({item.percentage}%)
                    </span>
                  ))}
                </div>
              )}
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
                            <div className="action-group">
                              <button
                                type="button"
                                className="icon-action-btn accent"
                                aria-label={`Open scenario ${s.name}`}
                                title="Open scenario"
                                onClick={(event) => { event.stopPropagation(); handleSelectScenario(s) }}
                              >
                                ▶
                              </button>
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
                            </div>
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
                    <span className="button-icon" aria-hidden="true">➕</span>
                    {addingScenario ? 'Adding...' : 'Add Scenario'}
                  </button>
                </div>
              </form>
              )}
            </section>
          </>
        )}

        {toasts.length > 0 && (
          <div className="toast-container">
            {toasts.map((toast) => (
              <div
                key={toast.id}
                className={`toast toast-${toast.type}${toast.exiting ? ' toast-exit' : ''}`}
              >
                <span className="toast-message">{toast.message}</span>
                <button
                  className="toast-close"
                  onClick={() => dismissToast(toast.id)}
                  aria-label="Close notification"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}
    </>
  )
}