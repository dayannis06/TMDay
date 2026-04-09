import { useState } from 'react'
import './App.css'
import HomePage from './pages/HomePage'
import CreateTestCasePage from './pages/CreateTestCasePage'
import TestCasePage from './pages/UpdateTestCasePage'

function App() {
  const [currentPage, setCurrentPage] = useState('home')
  const [selectedTestCaseId, setSelectedTestCaseId] = useState(null)

  const goToTestCase = (id) => {
    setSelectedTestCaseId(id)
    setCurrentPage('view')
  }

  const goHome = () => {
    setCurrentPage('home')
    setSelectedTestCaseId(null)
  }

  return (
    <main className="home-container">
      <header className="home-header">
        <h1>TMDay</h1>
        <p>Manage test cases in your daily basis</p>
      </header>

      <nav className="page-nav" aria-label="Pages">
        <button
          type="button"
          onClick={() => setCurrentPage('home')}
          className={currentPage === 'home' ? 'active' : ''}
        >
          <span className="button-icon" aria-hidden="true"></span>
          Home
        </button>
        <button
          type="button"
          onClick={() => setCurrentPage('create')}
          className={currentPage === 'create' ? 'active' : ''}
        >
          <span className="button-icon" aria-hidden="true"></span>
          Create Test Case
        </button>
      </nav>

      {currentPage === 'home' && <HomePage onSelectTestCase={goToTestCase} />}
      {currentPage === 'create' && <CreateTestCasePage onGoHome={goHome} />}
      {currentPage === 'view' && <TestCasePage testCaseId={selectedTestCaseId} onGoHome={goHome} />}
    </main>
  )
}

export default App
