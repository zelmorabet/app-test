import { useState, useEffect, useCallback } from 'react';

export default function EnfantSearch({ refreshKey }) {
  const [terme, setTerme]       = useState('');
  const [resultats, setResultats] = useState([]);
  const [loading, setLoading]   = useState(false);
  const [message, setMessage]   = useState(null);
  const [searched, setSearched] = useState(false);

  const chercher = useCallback(async (q = terme) => {
    setLoading(true);
    setMessage(null);
    try {
      const url = q.trim() ? `/api/enfants?q=${encodeURIComponent(q)}` : '/api/enfants';
      const resp = await fetch(url);
      if (!resp.ok) throw new Error('Erreur serveur');
      const data = await resp.json();
      setResultats(data);
      setSearched(true);
    } catch {
      setMessage('Impossible de contacter le serveur.');
    } finally {
      setLoading(false);
    }
  }, [terme]);

  // Rafraîchir si un enregistrement vient d'être fait
  useEffect(() => {
    if (refreshKey > 0) chercher('');
  }, [refreshKey]); // eslint-disable-line react-hooks/exhaustive-deps

  const supprimerEnfant = async (id, nom, prenom) => {
    if (!confirm(`Supprimer le dossier de ${prenom} ${nom} ?`)) return;
    try {
      const resp = await fetch(`/api/enfants/${id}`, { method: 'DELETE' });
      if (!resp.ok) throw new Error();
      setResultats((r) => r.filter((e) => e.id !== id));
    } catch {
      alert('Erreur lors de la suppression.');
    }
  };

  const formatDate = (d) =>
    d ? new Date(d).toLocaleDateString('fr-FR') : '–';

  return (
    <div className="card">
      <h2>Rechercher un enfant</h2>

      <div className="search-bar">
        <input
          type="text"
          placeholder="Rechercher par nom ou prénom…"
          value={terme}
          onChange={(e) => setTerme(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && chercher()}
        />
        <button
          className="btn btn-primary"
          onClick={() => chercher()}
          disabled={loading}
        >
          {loading ? '…' : '🔍 Rechercher'}
        </button>
        <button
          className="btn btn-secondary"
          onClick={() => { setTerme(''); chercher(''); }}
          disabled={loading}
        >
          Tout afficher
        </button>
      </div>

      {message && <div className="alert alert-error">{message}</div>}

      {searched && (
        resultats.length === 0 ? (
          <p className="no-results">Aucun résultat trouvé.</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="results-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Nom</th>
                  <th>Prénom</th>
                  <th>Naissance</th>
                  <th>Genre</th>
                  <th>Allergies</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {resultats.map((e) => (
                  <tr key={e.id}>
                    <td>{e.id}</td>
                    <td>{e.nom}</td>
                    <td>{e.prenom}</td>
                    <td>{formatDate(e.date_naissance)}</td>
                    <td>{e.genre}</td>
                    <td>{e.allergies || '–'}</td>
                    <td>
                      <button
                        className="btn btn-danger"
                        onClick={() => supprimerEnfant(e.id, e.nom, e.prenom)}
                      >
                        Supprimer
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p style={{ fontSize: '0.82rem', color: '#718096', marginTop: '10px' }}>
              {resultats.length} résultat{resultats.length > 1 ? 's' : ''}
            </p>
          </div>
        )
      )}
    </div>
  );
}
