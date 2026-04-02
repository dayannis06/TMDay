import { useEffect, useState } from 'react'
import {
  createTestCase,
  createTestScenario,
  getEnums,
} from '../api/testCasesApi'

function CreateTestCasePage({ onGoHome }) {
  const [statusOptions, setStatusOptions] = useState([])
  const [typeOptions, setTypeOptions] = useState([])
  const [formMessage, setFormMessage] = useState('')
  const [formError, setFormError] = useState('')
  const [creatingTestCase, setCreatingTestCase] = useState(false)
  const [creatingScenario, setCreatingScenario] = useState(false)
  const [createdTestCaseId, setCreatedTestCaseId] = useState(null)
  const [newTestCase, setNewTestCase] = useState({
    tcName: '',
    tcEpic: '',
    tcApp: '',
    tcComponent: '',
    tcStory: '',
    tcAssigned: '',
  })
  const [newScenario, setNewScenario] = useState({
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
    const fetchEnums = async () => {
      setFormError('')

      try {
        const result = await getEnums()
        const fetchedStatuses = Array.isArray(result?.testScenarioStatuses)
          ? result.testScenarioStatuses
          : []
        const fetchedTypes = Array.isArray(result?.testScenarioTypes)
          ? result.testScenarioTypes
          : []

        setStatusOptions(fetchedStatuses)
        setTypeOptions(fetchedTypes)
        setNewScenario((prev) => ({
          ...prev,
          status: fetchedStatuses[0] ?? '',
          type: fetchedTypes[0] ?? '',
        }))
      } catch (requestError) {
        setStatusOptions([])
        setTypeOptions([])
        setFormError(`Unable to load enums: ${requestError.message}`)
      }
    }

    fetchEnums()
  }, [])

  const handleTestCaseFieldChange = (field, value) => {
    setNewTestCase((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleScenarioFieldChange = (field, value) => {
    setNewScenario((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const resetMessages = () => {
    setFormError('')
    setFormMessage('')
  }

  const handleCreateTestCase = async (event) => {
    event.preventDefault()
    resetMessages()

    const requiredFields = [
      newTestCase.tcName,
      newTestCase.tcEpic,
      newTestCase.tcApp,
      newTestCase.tcComponent,
      newTestCase.tcStory,
      newTestCase.tcAssigned,
    ]

    if (requiredFields.some((field) => !field.trim())) {
      setFormError('Please complete all test case fields.')
      return
    }

    setCreatingTestCase(true)

    try {
      const createdTestCase = await createTestCase({
        ...newTestCase,
        testScenarios: [],
      })
      const newId = createdTestCase?.tcId

      if (!newId) {
        throw new Error('Invalid API response for test case creation.')
      }

      setCreatedTestCaseId(newId)
      setFormMessage(
        `Test case #${newId} created. You can now add scenarios below.`,
      )
    } catch (requestError) {
      setFormError(`Unable to create test case: ${requestError.message}`)
    } finally {
      setCreatingTestCase(false)
    }
  }

  const handleCreateScenario = async (event) => {
    event.preventDefault()
    resetMessages()

    if (!createdTestCaseId) {
      setFormError('Create a test case first before adding a scenario.')
      return
    }

    const requiredFields = [
      newScenario.name,
      newScenario.preRequisites,
      newScenario.data,
      newScenario.steps,
      newScenario.expectedResult,
      newScenario.actualResult,
      newScenario.status,
      newScenario.type,
    ]

    if (requiredFields.some((field) => !String(field).trim())) {
      setFormError('Please complete all scenario fields.')
      return
    }

    setCreatingScenario(true)

    try {
      await createTestScenario(createdTestCaseId, newScenario)
      setFormMessage(`Scenario created for test case #${createdTestCaseId}.`)
      setNewScenario({
        name: '',
        preRequisites: '',
        data: '',
        steps: '',
        expectedResult: '',
        actualResult: '',
        status: statusOptions[0] ?? '',
        type: typeOptions[0] ?? '',
      })
    } catch (requestError) {
      setFormError(`Unable to create scenario: ${requestError.message}`)
    } finally {
      setCreatingScenario(false)
    }
  }

  return (
    <>
      <section className="form-section" aria-label="Create test case">
        <h2>Create New Test Case</h2>
        <form className="form-grid" onSubmit={handleCreateTestCase}>
          <label>
            Name
            <input
              type="text"
              value={newTestCase.tcName}
              onChange={(event) =>
                handleTestCaseFieldChange('tcName', event.target.value)
              }
            />
          </label>
          <label>
            Epic
            <input
              type="text"
              value={newTestCase.tcEpic}
              onChange={(event) =>
                handleTestCaseFieldChange('tcEpic', event.target.value)
              }
            />
          </label>
          <label>
            App
            <input
              type="text"
              value={newTestCase.tcApp}
              onChange={(event) =>
                handleTestCaseFieldChange('tcApp', event.target.value)
              }
            />
          </label>
          <label>
            Component
            <input
              type="text"
              value={newTestCase.tcComponent}
              onChange={(event) =>
                handleTestCaseFieldChange('tcComponent', event.target.value)
              }
            />
          </label>
          <label>
            Story
            <textarea
              value={newTestCase.tcStory}
              onChange={(event) =>
                handleTestCaseFieldChange('tcStory', event.target.value)
              }
            />
          </label>
          <label>
            Assigned
            <input
              type="text"
              value={newTestCase.tcAssigned}
              onChange={(event) =>
                handleTestCaseFieldChange('tcAssigned', event.target.value)
              }
            />
          </label>
          <div className="form-actions">
            <button type="submit" disabled={creatingTestCase}>
              <span className="button-icon" aria-hidden="true">➕</span>
              {creatingTestCase ? 'Creating...' : 'Create Test Case'}
            </button>
            <button type="button" onClick={onGoHome}>
              <span className="button-icon" aria-hidden="true">←</span>
              Back to Home
            </button>
          </div>
        </form>
      </section>

      {createdTestCaseId && (
        <section className="form-section" aria-label="Create scenario">
          <h2>Add Scenario to Test Case #{createdTestCaseId}</h2>
          <form className="form-grid" onSubmit={handleCreateScenario}>
            <label>
              Name
              <input
                type="text"
                value={newScenario.name}
                onChange={(event) =>
                  handleScenarioFieldChange('name', event.target.value)
                }
              />
            </label>
            <label>
              Pre-requisites
              <textarea
                value={newScenario.preRequisites}
                onChange={(event) =>
                  handleScenarioFieldChange('preRequisites', event.target.value)
                }
              />
            </label>
            <label>
              Data
              <textarea
                value={newScenario.data}
                onChange={(event) =>
                  handleScenarioFieldChange('data', event.target.value)
                }
              />
            </label>
            <label>
              Steps
              <textarea
                value={newScenario.steps}
                onChange={(event) =>
                  handleScenarioFieldChange('steps', event.target.value)
                }
              />
            </label>
            <label>
              Expected Result
              <textarea
                value={newScenario.expectedResult}
                onChange={(event) =>
                  handleScenarioFieldChange('expectedResult', event.target.value)
                }
              />
            </label>
            <label>
              Actual Result
              <textarea
                value={newScenario.actualResult}
                onChange={(event) =>
                  handleScenarioFieldChange('actualResult', event.target.value)
                }
              />
            </label>
            <label>
              Status
              <select
                value={newScenario.status}
                onChange={(event) =>
                  handleScenarioFieldChange('status', event.target.value)
                }
                disabled={statusOptions.length === 0}
              >
                {statusOptions.length === 0 && <option value="">No options</option>}
                {statusOptions.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Type
              <select
                value={newScenario.type}
                onChange={(event) =>
                  handleScenarioFieldChange('type', event.target.value)
                }
                disabled={typeOptions.length === 0}
              >
                {typeOptions.length === 0 && <option value="">No options</option>}
                {typeOptions.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </label>
            <div className="form-actions">
              <button type="submit" disabled={creatingScenario}>
                <span className="button-icon" aria-hidden="true">🧩</span>
                {creatingScenario ? 'Creating...' : 'Add Scenario'}
              </button>
            </div>
          </form>
        </section>
      )}

      {formMessage && <p className="status status-success">{formMessage}</p>}
      {formError && <p className="status status-error">{formError}</p>}
    </>
  )
}

export default CreateTestCasePage