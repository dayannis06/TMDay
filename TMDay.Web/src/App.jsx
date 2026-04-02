import { useState } from 'react'
import './App.css'
import HomePage from './pages/HomePage'
import CreateTestCasePage from './pages/CreateTestCasePage'

function App() {
  const [currentPage, setCurrentPage] = useState('home')

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
          <span className="button-icon" aria-hidden="true">🏠</span>
          Home
        </button>
        <button
          type="button"
          onClick={() => setCurrentPage('create')}
          className={currentPage === 'create' ? 'active' : ''}
        >
          <span className="button-icon" aria-hidden="true">🧪</span>
          Create Test Case
        </button>
      </nav>

      {currentPage === 'home' ? (
        <HomePage />
      ) : (
        <CreateTestCasePage onGoHome={() => setCurrentPage('home')} />
      )}
    </main>
  )
}

export default App
