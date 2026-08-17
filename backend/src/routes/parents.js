import { Router } from 'express';
import pool from '../db.js';

const router = Router();

// ── GET /api/parents?enfant_id=X  ────────────────────────
router.get('/', async (req, res) => {
  try {
    const { enfant_id } = req.query;
    if (enfant_id) {
      const id = parseInt(enfant_id, 10);
      if (isNaN(id)) return res.status(400).json({ error: 'enfant_id invalide.' });
      const result = await pool.query('SELECT * FROM parents WHERE enfant_id=$1 ORDER BY id', [id]);
      return res.json(result.rows);
    }
    const result = await pool.query('SELECT * FROM parents ORDER BY id');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
});

// ── POST /api/parents  ────────────────────────────────────
router.post('/', async (req, res) => {
  const { enfant_id, nom, prenom, lien, telephone, courriel, adresse } = req.body;
  if (!enfant_id || !nom?.trim() || !prenom?.trim() || !lien?.trim()) {
    return res.status(400).json({ error: 'enfant_id, nom, prénom et lien sont obligatoires.' });
  }
  try {
    const result = await pool.query(
      `INSERT INTO parents (enfant_id, nom, prenom, lien, telephone, courriel, adresse)
       VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
      [enfant_id, nom.trim(), prenom.trim(), lien.trim(),
       telephone?.trim() || null, courriel?.trim() || null, adresse?.trim() || null]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
});

// ── PUT /api/parents/:id  ─────────────────────────────────
router.put('/:id', async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) return res.status(400).json({ error: 'ID invalide.' });
  const { enfant_id, nom, prenom, lien, telephone, courriel, adresse } = req.body;
  try {
    const result = await pool.query(
      `UPDATE parents
       SET enfant_id=$1, nom=$2, prenom=$3, lien=$4, telephone=$5, courriel=$6, adresse=$7
       WHERE id=$8 RETURNING *`,
      [enfant_id, nom, prenom, lien, telephone || null, courriel || null, adresse || null, id]
    );
    if (result.rowCount === 0) return res.status(404).json({ error: 'Parent introuvable.' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
});

// ── DELETE /api/parents/:id  ──────────────────────────────
router.delete('/:id', async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) return res.status(400).json({ error: 'ID invalide.' });
  try {
    const result = await pool.query('DELETE FROM parents WHERE id=$1 RETURNING id', [id]);
    if (result.rowCount === 0) return res.status(404).json({ error: 'Parent introuvable.' });
    res.json({ message: 'Supprimé.', id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
});

export default router;
