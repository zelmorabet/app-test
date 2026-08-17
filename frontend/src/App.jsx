import { useState } from 'react';
import LoginPage from './components/LoginPage.jsx';
import Dashboard from './components/Dashboard.jsx';

export default function App() {
  const [rsge, setRsge] = useState(null);
  return rsge
    ? <Dashboard rsge={rsge} onLogout={() => setRsge(null)} />
    : <LoginPage onLogin={setRsge} />;
}
