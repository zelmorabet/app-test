import { useState, useEffect } from 'react';

function formatDate(d) {
  return d ? new Date(d).toLocaleDateString('fr-FR') : '–';
}

const LIENS = ['Père', 'Mère', 'Tuteur légal', 'Grand-père', 'Grand-mère', 'Autre'];

const VIDE_PARENT = { nom: '', prenom: '', lien: '', telephone: '', courriel: '', adresse: '' };
const VIDE_CONTACT = { nom: '', prenom: '', lien: '', telephone: '' };

// ── Formulaire d'édition inline ───────────────────────────
function EditForm({ enfant, onSaved, onCancel }) {
  const [form, setForm] = useState({
    nom:              enfant.nom,
    prenom:           enfant.prenom,
    date_naissance:   enfant.date_naissance?.slice(0, 10) || '',
    genre:            enfant.genre,
    allergies:        enfant.allergies        || '',
    notes_medicales:  enfant.notes_medicales  || '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);

  const change = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const sauvegarder = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const resp = await fetch(`/api/enfants/${enfant.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await resp.json();
      if (!resp.ok) { setError(data.error || 'Erreur.'); return; }
      onSaved(data);
    } catch {
      setError('Impossible de contacter le serveur.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={sauvegarder} className="edit-form">
      {error && <div className="alert alert-error">{error}</div>}
      <div className="form-grid">
        <div className="form-group">
          <label>Nom *</label>
          <input name="nom" value={form.nom} onChange={change} required />
        </div>
        <div className="form-group">
          <label>Prénom *</label>
          <input name="prenom" value={form.prenom} onChange={change} required />
        </div>
        <div className="form-group">
          <label>Date de naissance *</label>
          <input type="date" name="date_naissance" value={form.date_naissance} onChange={change} required />
        </div>
        <div className="form-group">
          <label>Genre *</label>
          <select name="genre" value={form.genre} onChange={change}>
            <option value="Masculin">Masculin</option>
            <option value="Feminin">Féminin</option>
            <option value="Autre">Autre</option>
          </select>
        </div>
        <div className="form-group">
          <label>Allergies</label>
          <textarea name="allergies" value={form.allergies} onChange={change} rows={2} />
        </div>
        <div className="form-group">
          <label>Notes médicales</label>
          <textarea name="notes_medicales" value={form.notes_medicales} onChange={change} rows={2} />
        </div>
      </div>
      <div className="form-actions">
        <button type="button" className="btn btn-secondary" onClick={onCancel} disabled={loading}>
          Annuler
        </button>
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? 'Enregistrement…' : 'Enregistrer'}
        </button>
      </div>
    </form>
  );
}

// ── Onglet : Dossier enfant ───────────────────────────────
function OngletDossier({ enfant, onEdit, onDelete, onNouveau }) {
  return (
    <div className="dossier-layout">
      <div className="dossier-info">
        <p className="section-title">Informations de l'enfant</p>
        <dl className="info-grid">
          <dt>Nom</dt>           <dd>{enfant.nom}</dd>
          <dt>Prénom</dt>        <dd>{enfant.prenom}</dd>
          <dt>Naissance</dt>     <dd>{formatDate(enfant.date_naissance)}</dd>
          <dt>Genre</dt>         <dd>{enfant.genre}</dd>
          <dt>Allergies</dt>     <dd>{enfant.allergies        || '–'}</dd>
          <dt>Notes médicales</dt><dd>{enfant.notes_medicales || '–'}</dd>
        </dl>

        {enfant.parents?.length > 0 && (
          <>
            <p className="section-title">Parents / Responsables ({enfant.parents.length})</p>
            <p style={{ fontSize: '0.82rem', color: '#718096' }}>
              Voir l'onglet <strong>Parents</strong> pour gérer.
            </p>
          </>
        )}

        {enfant.contacts?.length > 0 && (
          <>
            <p className="section-title">Contacts d'urgence ({enfant.contacts.length})</p>
            <p style={{ fontSize: '0.82rem', color: '#718096' }}>
              Voir l'onglet <strong>Contacts</strong> pour gérer.
            </p>
          </>
        )}
      </div>

      <div className="dossier-actions">
        <button className="btn btn-primary"    onClick={onNouveau}>+ Créer</button>
        <button className="btn btn-primary"    onClick={onEdit}>✏️ Modifier</button>
        <button className="btn btn-danger"     onClick={onDelete}>🗑 Supprimer</button>
      </div>
    </div>
  );
}

// ── Onglet : Parents ─────────────────────────────────────
function OngletParents({ enfantId }) {
  const [parents, setParents]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const [editItem, setEditItem] = useState(null); // null | { ...parent } | VIDE_PARENT (nouveau)
  const [saving, setSaving]     = useState(false);
  const [error, setError]       = useState(null);

  const charger = () => {
    setLoading(true);
    fetch(`/api/parents?enfant_id=${enfantId}`)
      .then((r) => r.json()).then(setParents).catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(charger, [enfantId]);

  const change = (e) =>
    setEditItem((p) => ({ ...p, [e.target.name]: e.target.value }));

  const sauvegarder = async (e) => {
    e.preventDefault();
    setSaving(true); setError(null);
    try {
      const isNew = !editItem.id;
      const url    = isNew ? '/api/parents' : `/api/parents/${editItem.id}`;
      const method = isNew ? 'POST' : 'PUT';
      const resp = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enfant_id: enfantId, ...editItem }),
      });
      const data = await resp.json();
      if (!resp.ok) { setError(data.error || 'Erreur.'); return; }
      setEditItem(null);
      charger();
    } catch { setError('Impossible de contacter le serveur.'); }
    finally { setSaving(false); }
  };

  const supprimer = async (id, nom, prenom) => {
    if (!confirm(`Supprimer ${prenom} ${nom} ?`)) return;
    await fetch(`/api/parents/${id}`, { method: 'DELETE' });
    charger();
  };

  return (
    <div className="crud-section">
      <div className="crud-header">
        <span>{parents.length} parent{parents.length !== 1 ? 's' : ''}</span>
        <button className="btn btn-primary btn-sm" onClick={() => setEditItem({ ...VIDE_PARENT })}>
          + Ajouter
        </button>
      </div>

      {editItem && (
        <form onSubmit={sauvegarder} className="crud-form">
          <p className="section-title">{editItem.id ? 'Modifier le parent' : 'Nouveau parent'}</p>
          {error && <div className="alert alert-error">{error}</div>}
          <div className="form-grid cols-3">
            <div className="form-group">
              <label>Nom *</label>
              <input name="nom" value={editItem.nom} onChange={change} required />
            </div>
            <div className="form-group">
              <label>Prénom *</label>
              <input name="prenom" value={editItem.prenom} onChange={change} required />
            </div>
            <div className="form-group">
              <label>Lien *</label>
              <select name="lien" value={editItem.lien} onChange={change} required>
                <option value="">-- Choisir --</option>
                {LIENS.map((l) => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Téléphone</label>
              <input name="telephone" value={editItem.telephone} onChange={change} placeholder="514 000-0000" />
            </div>
            <div className="form-group">
              <label>Courriel</label>
              <input name="courriel" type="email" value={editItem.courriel} onChange={change} />
            </div>
            <div className="form-group">
              <label>Adresse</label>
              <input name="adresse" value={editItem.adresse} onChange={change} />
            </div>
          </div>
          <div className="form-actions">
            <button type="button" className="btn btn-secondary" onClick={() => { setEditItem(null); setError(null); }} disabled={saving}>Annuler</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Enregistrement…' : 'Enregistrer'}</button>
          </div>
        </form>
      )}

      {loading ? <p className="sidebar-empty">Chargement…</p> : parents.length === 0 && !editItem ? (
        <p className="no-results">Aucun parent enregistré.</p>
      ) : (
        <table className="results-table">
          <thead>
            <tr><th>Identité</th><th>Lien</th><th>Téléphone</th><th>Courriel</th><th></th></tr>
          </thead>
          <tbody>
            {parents.map((p) => (
              <tr key={p.id}>
                <td>{p.prenom} {p.nom}</td>
                <td>{p.lien}</td>
                <td>{p.telephone || '–'}</td>
                <td>{p.courriel  || '–'}</td>
                <td className="td-actions">
                  <button className="btn btn-secondary btn-sm" onClick={() => setEditItem({ ...p })}>✏️</button>
                  <button className="btn btn-danger btn-sm"    onClick={() => supprimer(p.id, p.nom, p.prenom)}>🗑</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

// ── Onglet : Contacts d'urgence ───────────────────────────
function OngletContacts({ enfantId }) {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [editItem, setEditItem] = useState(null);
  const [saving, setSaving]     = useState(false);
  const [error, setError]       = useState(null);

  const charger = () => {
    setLoading(true);
    fetch(`/api/contacts?enfant_id=${enfantId}`)
      .then((r) => r.json()).then(setContacts).catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(charger, [enfantId]);

  const change = (e) =>
    setEditItem((c) => ({ ...c, [e.target.name]: e.target.value }));

  const sauvegarder = async (e) => {
    e.preventDefault();
    setSaving(true); setError(null);
    try {
      const isNew = !editItem.id;
      const url    = isNew ? '/api/contacts' : `/api/contacts/${editItem.id}`;
      const method = isNew ? 'POST' : 'PUT';
      const resp = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enfant_id: enfantId, ...editItem }),
      });
      const data = await resp.json();
      if (!resp.ok) { setError(data.error || 'Erreur.'); return; }
      setEditItem(null);
      charger();
    } catch { setError('Impossible de contacter le serveur.'); }
    finally { setSaving(false); }
  };

  const supprimer = async (id, nom, prenom) => {
    if (!confirm(`Supprimer ${prenom} ${nom} ?`)) return;
    await fetch(`/api/contacts/${id}`, { method: 'DELETE' });
    charger();
  };

  return (
    <div className="crud-section">
      <div className="crud-header">
        <span>{contacts.length} contact{contacts.length !== 1 ? 's' : ''}</span>
        <button className="btn btn-primary btn-sm" onClick={() => setEditItem({ ...VIDE_CONTACT })}>
          + Ajouter
        </button>
      </div>

      {editItem && (
        <form onSubmit={sauvegarder} className="crud-form">
          <p className="section-title">{editItem.id ? 'Modifier le contact' : 'Nouveau contact d\'urgence'}</p>
          {error && <div className="alert alert-error">{error}</div>}
          <div className="form-grid cols-3">
            <div className="form-group">
              <label>Nom *</label>
              <input name="nom" value={editItem.nom} onChange={change} required />
            </div>
            <div className="form-group">
              <label>Prénom *</label>
              <input name="prenom" value={editItem.prenom} onChange={change} required />
            </div>
            <div className="form-group">
              <label>Lien</label>
              <select name="lien" value={editItem.lien} onChange={change}>
                <option value="">-- Choisir --</option>
                {LIENS.map((l) => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Téléphone *</label>
              <input name="telephone" value={editItem.telephone} onChange={change} required placeholder="514 000-0000" />
            </div>
          </div>
          <div className="form-actions">
            <button type="button" className="btn btn-secondary" onClick={() => { setEditItem(null); setError(null); }} disabled={saving}>Annuler</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Enregistrement…' : 'Enregistrer'}</button>
          </div>
        </form>
      )}

      {loading ? <p className="sidebar-empty">Chargement…</p> : contacts.length === 0 && !editItem ? (
        <p className="no-results">Aucun contact d'urgence enregistré.</p>
      ) : (
        <table className="results-table">
          <thead>
            <tr><th>Identité</th><th>Lien</th><th>Téléphone</th><th></th></tr>
          </thead>
          <tbody>
            {contacts.map((c) => (
              <tr key={c.id}>
                <td>{c.prenom} {c.nom}</td>
                <td>{c.lien || '–'}</td>
                <td>{c.telephone}</td>
                <td className="td-actions">
                  <button className="btn btn-secondary btn-sm" onClick={() => setEditItem({ ...c })}>✏️</button>
                  <button className="btn btn-danger btn-sm"    onClick={() => supprimer(c.id, c.nom, c.prenom)}>🗑</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

// ── Onglet : Ententes ─────────────────────────────────────
function OngletEntentes({ enfantId }) {
  const [ententes, setEntentes] = useState([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    fetch(`/api/ententes?enfant_id=${enfantId}`)
      .then((r) => r.json())
      .then(setEntentes)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [enfantId]);

  if (loading) return <p className="sidebar-empty">Chargement…</p>;
  if (ententes.length === 0) return <p className="no-results">Aucune entente enregistrée.</p>;

  return (
    <div style={{ overflowX: 'auto' }}>
      <table className="results-table">
        <thead>
          <tr>
            <th>Début</th>
            <th>Fin</th>
            <th>Jours</th>
            <th>Heures</th>
            <th>Statut</th>
            <th>Signature</th>
          </tr>
        </thead>
        <tbody>
          {ententes.map((ent) => (
            <tr key={ent.id}>
              <td>{formatDate(ent.date_debut)}</td>
              <td>{ent.date_fin ? formatDate(ent.date_fin) : '–'}</td>
              <td>{ent.jours_semaine?.join(', ') || '–'}</td>
              <td>
                {ent.heure_debut && ent.heure_fin
                  ? `${ent.heure_debut} – ${ent.heure_fin}`
                  : '–'}
              </td>
              <td>
                <span className={`badge badge-${ent.statut}`}>{ent.statut}</span>
              </td>
              <td>{ent.signature_parent ? '✅ Signée' : '–'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ── Composant principal ───────────────────────────────────
export default function EnfantDetail({ enfantBase, onDeleted, onUpdated, onNouveau }) {
  const [enfant, setEnfant] = useState(null);
  const [tab, setTab]       = useState('dossier');
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setEditing(false);
    setTab('dossier');
    setLoading(true);
    fetch(`/api/enfants/${enfantBase.id}`)
      .then((r) => r.json())
      .then(setEnfant)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [enfantBase.id]);

  const supprimer = async () => {
    if (!confirm(`Supprimer le dossier de ${enfant.prenom} ${enfant.nom} ?`)) return;
    await fetch(`/api/enfants/${enfant.id}`, { method: 'DELETE' });
    onDeleted();
  };

  const handleSaved = (updated) => {
    const merged = { ...enfant, ...updated };
    setEnfant(merged);
    setEditing(false);
    onUpdated(merged);
  };

  if (loading) return <div className="dash-empty"><p>Chargement…</p></div>;
  if (!enfant)  return null;

  return (
    <div className="card detail-card">

      {/* ── En-tête du dossier ── */}
      <div className="detail-header">
        <div className="detail-title">
          <span className="enfant-avatar lg">{enfant.prenom[0]}{enfant.nom[0]}</span>
          <div>
            <h2>{enfant.prenom} {enfant.nom}</h2>
            <span className="enfant-meta">
              Né(e) le {formatDate(enfant.date_naissance)} · {enfant.genre}
            </span>
          </div>
        </div>
      </div>

      {/* ── Onglets internes ── */}
      <div className="detail-tabs">
        <button
          className={`tab-btn${tab === 'dossier' ? ' active' : ''}`}
          onClick={() => { setTab('dossier'); setEditing(false); }}
        >
          📋 Dossier
        </button>
        <button
          className={`tab-btn${tab === 'parents' ? ' active' : ''}`}
          onClick={() => setTab('parents')}
        >
          👨‍👩‍👧 Parents
        </button>
        <button
          className={`tab-btn${tab === 'contacts' ? ' active' : ''}`}
          onClick={() => setTab('contacts')}
        >
          🚨 Contacts
        </button>
        <button
          className={`tab-btn${tab === 'ententes' ? ' active' : ''}`}
          onClick={() => setTab('ententes')}
        >
          📄 Ententes
        </button>
      </div>

      {tab === 'dossier'  && (
        editing
          ? <EditForm enfant={enfant} onSaved={handleSaved} onCancel={() => setEditing(false)} />
          : <OngletDossier enfant={enfant} onEdit={() => setEditing(true)} onDelete={supprimer} onNouveau={onNouveau} />
      )}
      {tab === 'parents'  && <OngletParents  enfantId={enfant.id} />}
      {tab === 'contacts' && <OngletContacts enfantId={enfant.id} />}
      {tab === 'ententes' && <OngletEntentes enfantId={enfant.id} />}
    </div>
  );
}
