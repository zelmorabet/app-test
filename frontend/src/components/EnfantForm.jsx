import { useState } from 'react';

const VIDE = {
  nom: '', prenom: '', date_naissance: '', genre: '',
  allergies: '', notes_medicales: '',
  parent1_nom: '', parent1_prenom: '', parent1_lien: '',
  parent1_telephone: '', parent1_courriel: '', parent1_adresse: '',
  parent2_nom: '', parent2_prenom: '', parent2_lien: '',
  parent2_telephone: '', parent2_courriel: '', parent2_adresse: '',
};

const LIENS = ['Père', 'Mère', 'Tuteur légal', 'Grand-père', 'Grand-mère', 'Autre'];

export default function EnfantForm({ onSaved, onCancel }) {
  const [form, setForm]       = useState(VIDE);
  const [errors, setErrors]   = useState({});
  const [message, setMessage] = useState(null); // { type, text }
  const [loading, setLoading] = useState(false);

  const change = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    setErrors((er) => ({ ...er, [name]: '' }));
  };

  const valider = () => {
    const er = {};
    if (!form.nom.trim())           er.nom = 'Le nom est obligatoire.';
    if (!form.prenom.trim())        er.prenom = 'Le prénom est obligatoire.';
    if (!form.date_naissance)       er.date_naissance = 'La date de naissance est obligatoire.';
    if (!form.genre)                er.genre = 'Le genre est obligatoire.';
    return er;
  };

  const enregistrer = async (e) => {
    e.preventDefault();
    setMessage(null);

    const er = valider();
    if (Object.keys(er).length) { setErrors(er); return; }

    setLoading(true);
    try {
      // 1. Enregistrer l'enfant
      const resp = await fetch('/api/enfants', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nom: form.nom,
          prenom: form.prenom,
          date_naissance: form.date_naissance,
          genre: form.genre,
          allergies: form.allergies,
          notes_medicales: form.notes_medicales,
        }),
      });
      const data = await resp.json();

      if (!resp.ok) {
        setMessage({ type: 'error', text: data.error || 'Erreur lors de l\'enregistrement.' });
        return;
      }

      const enfantId = data.id;

      // 2. Enregistrer les parents si les champs minimaux sont remplis
      const parentsData = [
        { nom: form.parent1_nom, prenom: form.parent1_prenom, lien: form.parent1_lien, telephone: form.parent1_telephone, courriel: form.parent1_courriel, adresse: form.parent1_adresse },
        { nom: form.parent2_nom, prenom: form.parent2_prenom, lien: form.parent2_lien, telephone: form.parent2_telephone, courriel: form.parent2_courriel, adresse: form.parent2_adresse },
      ];
      await Promise.all(
        parentsData
          .filter((p) => p.nom.trim() && p.prenom.trim() && p.lien)
          .map((p) =>
            fetch('/api/parents', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ enfant_id: enfantId, ...p }),
            })
          )
      );

      setMessage({ type: 'success', text: `✅ Dossier enregistré avec succès (ID: ${enfantId}).` });
      setForm(VIDE);
      onSaved?.();
    } catch {
      setMessage({ type: 'error', text: 'Impossible de contacter le serveur.' });
    } finally {
      setLoading(false);
    }
  };

  const reinitialiser = () => {
    setForm(VIDE);
    setErrors({});
    setMessage(null);
  };

  const field = (name) => ({
    name,
    value: form[name],
    onChange: change,
    className: errors[name] ? 'error' : '',
  });

  return (
    <div className="card">
      <h2>Nouveau dossier enfant</h2>

      {message && (
        <div className={`alert alert-${message.type}`}>{message.text}</div>
      )}

      <form onSubmit={enregistrer} noValidate>

        {/* ── Informations enfant ── */}
        <p className="section-title">Informations de l'enfant</p>
        <div className="form-grid">
          <div className="form-group">
            <label htmlFor="nom">Nom *</label>
            <input id="nom" {...field('nom')} placeholder="Dupont" />
            {errors.nom && <span className="field-error">{errors.nom}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="prenom">Prénom *</label>
            <input id="prenom" {...field('prenom')} placeholder="Marie" />
            {errors.prenom && <span className="field-error">{errors.prenom}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="date_naissance">Date de naissance *</label>
            <input id="date_naissance" type="date" {...field('date_naissance')} />
            {errors.date_naissance && (
              <span className="field-error">{errors.date_naissance}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="genre">Genre *</label>
            <select id="genre" {...field('genre')}>
              <option value="">-- Choisir --</option>
              <option value="Masculin">Masculin</option>
              <option value="Feminin">Féminin</option>
              <option value="Autre">Autre</option>
            </select>
            {errors.genre && <span className="field-error">{errors.genre}</span>}
          </div>
        </div>

        {/* ── Informations médicales ── */}
        <p className="section-title">Informations médicales</p>
        <div className="form-grid">
          <div className="form-group">
            <label htmlFor="allergies">Allergies</label>
            <textarea id="allergies" {...field('allergies')} rows={2} placeholder="Ex : arachides, lactose…" />
          </div>
          <div className="form-group">
            <label htmlFor="notes_medicales">Notes médicales</label>
            <textarea id="notes_medicales" {...field('notes_medicales')} rows={2} placeholder="Ex : asthme, épilepsie…" />
          </div>
        </div>

        {/* ── Parent 1 ── */}
        <p className="section-title">Parent / Responsable 1</p>
        <div className="form-grid cols-3">
          <div className="form-group">
            <label htmlFor="parent1_nom">Nom</label>
            <input id="parent1_nom" {...field('parent1_nom')} placeholder="Dupont" />
          </div>
          <div className="form-group">
            <label htmlFor="parent1_prenom">Prénom</label>
            <input id="parent1_prenom" {...field('parent1_prenom')} placeholder="Jean" />
          </div>
          <div className="form-group">
            <label htmlFor="parent1_lien">Lien avec l'enfant</label>
            <select id="parent1_lien" {...field('parent1_lien')}>
              <option value="">-- Choisir --</option>
              {LIENS.map((l) => <option key={l} value={l}>{l}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="parent1_telephone">Téléphone</label>
            <input id="parent1_telephone" {...field('parent1_telephone')} placeholder="514 000-0000" />
          </div>
          <div className="form-group">
            <label htmlFor="parent1_courriel">Courriel</label>
            <input id="parent1_courriel" type="email" {...field('parent1_courriel')} placeholder="jean@exemple.com" />
          </div>
          <div className="form-group">
            <label htmlFor="parent1_adresse">Adresse</label>
            <input id="parent1_adresse" {...field('parent1_adresse')} placeholder="123 rue des Érables" />
          </div>
        </div>

        {/* ── Parent 2 ── */}
        <p className="section-title">Parent / Responsable 2</p>
        <div className="form-grid cols-3">
          <div className="form-group">
            <label htmlFor="parent2_nom">Nom</label>
            <input id="parent2_nom" {...field('parent2_nom')} placeholder="Martin" />
          </div>
          <div className="form-group">
            <label htmlFor="parent2_prenom">Prénom</label>
            <input id="parent2_prenom" {...field('parent2_prenom')} placeholder="Sophie" />
          </div>
          <div className="form-group">
            <label htmlFor="parent2_lien">Lien avec l'enfant</label>
            <select id="parent2_lien" {...field('parent2_lien')}>
              <option value="">-- Choisir --</option>
              {LIENS.map((l) => <option key={l} value={l}>{l}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="parent2_telephone">Téléphone</label>
            <input id="parent2_telephone" {...field('parent2_telephone')} placeholder="514 000-0000" />
          </div>
          <div className="form-group">
            <label htmlFor="parent2_courriel">Courriel</label>
            <input id="parent2_courriel" type="email" {...field('parent2_courriel')} placeholder="sophie@exemple.com" />
          </div>
          <div className="form-group">
            <label htmlFor="parent2_adresse">Adresse</label>
            <input id="parent2_adresse" {...field('parent2_adresse')} placeholder="123 rue des Érables" />
          </div>
        </div>

        {/* ── Boutons ── */}
        <div className="form-actions">
          {onCancel && (
            <button type="button" className="btn btn-secondary" onClick={onCancel} disabled={loading}>
              Annuler
            </button>
          )}
          <button
            type="button"
            className="btn btn-secondary"
            onClick={reinitialiser}
            disabled={loading}
          >
            Réinitialiser
          </button>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Enregistrement…' : 'Enregistrer'}
          </button>
        </div>
      </form>
    </div>
  );
}
