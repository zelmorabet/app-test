import { Router } from 'express';
import pool from '../db.js';

const router = Router();

// ── GET /api/contacts?enfant_id=X  ───────────────────────
router.get('/', async (req, res) => {
  try {
    const { enfant_id } = req.query;
    if (enfant_id) {
      const id = parseInt(enfant_id, 10);
      if (isNaN(id)) return res.status(400).json({ error: 'enfant_id invalide.' });
      const result = await pool.query(
        'SELECT * FROM contacts_urgence WHERE enfant_id=$1 ORDER BY id', [id]
      );
      return res.json(result.rows);
    }
    const result = await pool.query('SELECT * FROM contacts_urgence ORDER BY id');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
});

// ── POST /api/contacts  ───────────────────────────────────
router.post('/', async (req, res) => {
  const { enfant_id, nom, prenom, lien, telephone } = req.body;
  if (!enfant_id || !nom?.trim() || !prenom?.trim() || !telephone?.trim()) {
    return res.status(400).json({ error: 'enfant_id, nom, prénom et téléphone sont obligatoires.' });
  }
  try {
    const result = await pool.query(
      `INSERT INTO contacts_urgence (enfant_id, nom, prenom, lien, telephone)
       VALUES ($1,$2,$3,$4,$5) RETURNING *`,
      [enfant_id, nom.trim(), prenom.trim(), lien?.trim() || null, telephone.trim()]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
});

// ── PUT /api/contacts/:id  ────────────────────────────────
router.put('/:id', async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) return res.status(400).json({ error: 'ID invalide.' });
  const { enfant_id, nom, prenom, lien, telephone } = req.body;
  try {
    const result = await pool.query(
      `UPDATE contacts_urgence
       SET enfant_id=$1, nom=$2, prenom=$3, lien=$4, telephone=$5
       WHERE id=$6 RETURNING *`,
      [enfant_id, nom, prenom, lien || null, telephone, id]
    );
    if (result.rowCount === 0) return res.status(404).json({ error: 'Contact introuvable.' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
});

// ── DELETE /api/contacts/:id  ─────────────────────────────
router.delete('/:id', async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) return res.status(400).json({ error: 'ID invalide.' });
  try {
    const result = await pool.query('DELETE FROM contacts_urgence WHERE id=$1 RETURNING id', [id]);
    if (result.rowCount === 0) return res.status(404).json({ error: 'Contact introuvable.' });
    res.json({ message: 'Supprimé.', id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
});

export default router;
