import { useState } from 'react';

export default function LoginPage({ onLogin }) {
  const [form, setForm] = useState({ courriel: '', date_naissance: '' });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const change = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
    setError(null);
  };

  const connexion = async (e) => {
    e.preventDefault();
    if (!form.courriel.trim() || !form.date_naissance) {
      setError('Veuillez remplir tous les champs.');
      return;
    }
    setLoading(true);
    try {
      const resp = await fetch('/api/rsge');
      if (!resp.ok) throw new Error();
      const records = await resp.json();
      const match = records.find(
        (r) =>
          r.courriel.toLowerCase() === form.courriel.trim().toLowerCase() &&
          r.date_naissance?.slice(0, 10) === form.date_naissance
      );
      if (!match) {
        setError('Identifiants invalides. Vérifiez votre courriel et date de naissance.');
      } else {
        onLogin(match);
      }
    } catch {
      setError('Impossible de contacter le serveur.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-bg">
      <div className="login-card">
        <div className="login-logo">🏠</div>
        <h1>RSGE</h1>
        <p className="login-subtitle">Responsable d'un service de garde éducatif</p>

        <form onSubmit={connexion} noValidate>
          {error && <div className="alert alert-error">{error}</div>}

          <div className="form-group">
            <label htmlFor="courriel">Courriel</label>
            <input
              id="courriel"
              name="courriel"
              type="email"
              value={form.courriel}
              onChange={change}
              placeholder="vous@exemple.com"
              autoFocus
            />
          </div>

          <div className="form-group" style={{ marginTop: '14px' }}>
            <label htmlFor="date_naissance">Date de naissance</label>
            <input
              id="date_naissance"
              name="date_naissance"
              type="date"
              value={form.date_naissance}
              onChange={change}
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', marginTop: '22px' }}
            disabled={loading}
          >
            {loading ? 'Connexion…' : 'Se connecter'}
          </button>
        </form>
      </div>
    </div>
  );
}
