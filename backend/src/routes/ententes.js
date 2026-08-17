import { Router } from 'express';
import pool from '../db.js';

const router = Router();

// ── GET /api/ententes?enfant_id=X  ───────────────────────
router.get('/', async (req, res) => {
  try {
    const { enfant_id } = req.query;
    if (enfant_id) {
      const id = parseInt(enfant_id, 10);
      if (isNaN(id)) return res.status(400).json({ error: 'enfant_id invalide.' });
      const result = await pool.query(
        'SELECT * FROM ententes_services WHERE enfant_id=$1 ORDER BY date_debut DESC', [id]
      );
      return res.json(result.rows);
    }
    const result = await pool.query('SELECT * FROM ententes_services ORDER BY date_debut DESC');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
});

// ── POST /api/ententes  ───────────────────────────────────
router.post('/', async (req, res) => {
  const { enfant_id, date_debut, date_fin, jours_semaine, heure_debut, heure_fin, signature_parent, statut } = req.body;
  if (!enfant_id || !date_debut) {
    return res.status(400).json({ error: 'enfant_id et date_debut sont obligatoires.' });
  }
  // Signature limitée à 2 Mo (base64 ~2,7 Mo de données binaires)
  if (signature_parent && signature_parent.length > 2_800_000) {
    return res.status(400).json({ error: 'La signature dépasse la taille maximale autorisée.' });
  }
  try {
    const date_signature = signature_parent ? new Date() : null;
    const result = await pool.query(
      `INSERT INTO ententes_services
         (enfant_id, date_debut, date_fin, jours_semaine, heure_debut, heure_fin,
          signature_parent, date_signature, statut)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`,
      [enfant_id, date_debut, date_fin || null, jours_semaine || [],
       heure_debut || null, heure_fin || null,
       signature_parent || null, date_signature, statut || 'actif']
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
});

// ── PUT /api/ententes/:id  ────────────────────────────────
router.put('/:id', async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) return res.status(400).json({ error: 'ID invalide.' });
  const { enfant_id, date_debut, date_fin, jours_semaine, heure_debut, heure_fin, signature_parent, statut } = req.body;
  if (signature_parent && signature_parent.length > 2_800_000) {
    return res.status(400).json({ error: 'La signature dépasse la taille maximale autorisée.' });
  }
  try {
    // Conserve la signature existante si aucune nouvelle n'est fournie
    const result = await pool.query(
      `UPDATE ententes_services
       SET enfant_id=$1, date_debut=$2, date_fin=$3, jours_semaine=$4,
           heure_debut=$5, heure_fin=$6, statut=$7,
           signature_parent = COALESCE($8, signature_parent),
           date_signature   = CASE WHEN $8 IS NOT NULL THEN NOW() ELSE date_signature END
       WHERE id=$9 RETURNING *`,
      [enfant_id, date_debut, date_fin || null, jours_semaine || [],
       heure_debut || null, heure_fin || null, statut || 'actif',
       signature_parent || null, id]
    );
    if (result.rowCount === 0) return res.status(404).json({ error: 'Entente introuvable.' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
});

// ── DELETE /api/ententes/:id  ─────────────────────────────
router.delete('/:id', async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) return res.status(400).json({ error: 'ID invalide.' });
  try {
    const result = await pool.query('DELETE FROM ententes_services WHERE id=$1 RETURNING id', [id]);
    if (result.rowCount === 0) return res.status(404).json({ error: 'Entente introuvable.' });
    res.json({ message: 'Supprimé.', id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
});

export default router;
