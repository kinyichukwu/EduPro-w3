import { useState, useEffect } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

function App() {
  const [count, setCount] = useState(0)
  const [backendStatus, setBackendStatus] = useState('Checking...')
  const [backendMessage, setBackendMessage] = useState('')

  useEffect(() => {
    // Test backend connection
    fetch('http://localhost:8080/api/health')
      .then(response => response.json())
      .then(data => {
        setBackendStatus('Connected ✅')
        setBackendMessage(data.message)
      })
      .catch(error => {
        setBackendStatus('Disconnected ❌')
        setBackendMessage('Backend not running')
        console.error('Backend connection error:', error)
      })
  }, [])

  const testBackendHello = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/hello')
      const data = await response.json()
      alert(`Backend says: ${data.message}`)
    } catch (error) {
      alert('Failed to connect to backend')
    }
  }

  return (
    <>
      <div>
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>EduPro - Vite + React + Go</h1>
      
      <div className="card">
        <h3>Backend Status: {backendStatus}</h3>
        <p>{backendMessage}</p>
        <button onClick={testBackendHello} style={{marginBottom: '1rem'}}>
          Test Backend Hello
        </button>
      </div>

      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <p>
          Edit <code>src/App.jsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </>
  )
}

export default App
