import { StrictMode, useState } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import Login from './Login.jsx'

function Root() {
  const [authed, setAuthed] = useState(
    () => localStorage.getItem('abgym_auth') === 'true'
  );

  const handleLogin  = () => setAuthed(true);
  const handleLogout = () => {
    localStorage.removeItem('abgym_auth');
    setAuthed(false);
  };

  return authed
    ? <App onLogout={handleLogout} />
    : <Login onLogin={handleLogin} />;
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Root />
  </StrictMode>,
)
