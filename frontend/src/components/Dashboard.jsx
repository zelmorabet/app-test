import { useState, useEffect, useCallback } from 'react';
import EnfantForm from './EnfantForm.jsx';
import EnfantDetail from './EnfantDetail.jsx';

export default function Dashboard({ rsge, onLogout }) {
  const [enfants, setEnfants]   = useState([]);
  const [terme, setTerme]       = useState('');
  const [selected, setSelected] = useState(null);
  const [mode, setMode]         = useState('vide'); // 'vide' | 'detail' | 'nouveau'
  const [loading, setLoading]   = useState(false);

  const chargerEnfants = useCallback(async (q = '') => {
    setLoading(true);
    try {
      const url = q.trim() ? `/api/enfants?q=${encodeURIComponent(q)}` : '/api/enfants';
      const resp = await fetch(url);
      if (!resp.ok) throw new Error();
      setEnfants(await resp.json());
    } catch { /* silently fail */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { chargerEnfants(); }, [chargerEnfants]);

  const selectionner = (enfant) => {
    setSelected(enfant);
    setMode('detail');
  };

  const handleSaved = () => {
    chargerEnfants(terme);
    setMode('vide');
  };

  const handleDeleted = () => {
    setSelected(null);
    setMode('vide');
    chargerEnfants(terme);
  };

  const handleUpdated = (updated) => {
    setSelected(updated);
    chargerEnfants(terme);
  };

  const handleSearch = (e) => {
    const q = e.target.value;
    setTerme(q);
    chargerEnfants(q);
  };

  return (
    <div className="dashboard">

      {/* ── En-tête ── */}
      <header className="dash-header">
        <div className="dash-header-title">
          <span className="dash-logo">🏠</span>
          <div>
            <strong>{rsge.nom_service}</strong>
            <span className="dash-user">{rsge.prenom} {rsge.nom}</span>
          </div>
        </div>
        <button className="btn btn-secondary" onClick={onLogout}>Déconnexion</button>
      </header>

      {/* ── Mise en page ── */}
      <div className="dash-layout">

        {/* ── Barre latérale ── */}
        <aside className="dash-sidebar">
          <div className="sidebar-top">
            <h2>Enfants</h2>
            <button
              className="btn btn-primary btn-sm"
              onClick={() => { setSelected(null); setMode('nouveau'); }}
            >
              + Nouveau
            </button>
          </div>
          <input
            className="sidebar-search"
            type="text"
            placeholder="Rechercher…"
            value={terme}
            onChange={handleSearch}
          />
          {loading ? (
            <p className="sidebar-empty">Chargement…</p>
          ) : enfants.length === 0 ? (
            <p className="sidebar-empty">Aucun enfant.</p>
          ) : (
            <ul className="enfant-list">
              {enfants.map((e) => (
                <li
                  key={e.id}
                  className={`enfant-list-item${selected?.id === e.id ? ' active' : ''}`}
                  onClick={() => selectionner(e)}
                >
                  <span className="enfant-avatar">
                    {e.prenom[0]}{e.nom[0]}
                  </span>
                  <div>
                    <div className="enfant-name">{e.prenom} {e.nom}</div>
                    <div className="enfant-meta">{e.genre}</div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </aside>

        {/* ── Zone principale ── */}
        <main className="dash-main">
          {mode === 'nouveau' && (
            <EnfantForm
              onSaved={handleSaved}
              onCancel={() => setMode('vide')}
            />
          )}
          {mode === 'detail' && selected && (
            <EnfantDetail
              enfantBase={selected}
              onDeleted={handleDeleted}
              onUpdated={handleUpdated}
              onNouveau={() => { setSelected(null); setMode('nouveau'); }}
            />
          )}
          {mode === 'vide' && (
            <div className="dash-empty">
              <p>Sélectionnez un enfant dans la liste ou créez un nouveau dossier.</p>
            </div>
          )}
        </main>

      </div>
    </div>
  );
}
