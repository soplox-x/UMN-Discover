import { useState, useEffect } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

function App() {
  const [serverMessage, setServerMessage] = useState('');
  const [connected, setConnected] = useState(false);

  const testConnection = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/test');
      const data = await response.json();
      setServerMessage(data.message);
      setConnected(true);
    } catch (error) {
      setServerMessage('Failed to connect to server');
      setConnected(false);
    }
  };

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
      <h1>UMN Discover</h1>
      <div className="card">
        <button onClick={testConnection}>
          Test Server Connection
        </button>
        <p>
          {serverMessage && (
            <span style={{ color: connected ? 'green' : 'red' }}>
              {serverMessage}
            </span>
          )}
        </p>
      </div>
      <p className="read-the-docs">
        Click the button to test if client can connect to server
      </p>
    </>
  )
}

export default App
