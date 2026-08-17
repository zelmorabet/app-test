import { Router } from 'express';
import pool from '../db.js';

const router = Router();

// ── GET /api/enfants?q=terme  ──────────────────────────────
router.get('/', async (req, res) => {
  try {
    const { q } = req.query;
    let result;
    if (q && q.trim()) {
      const terme = `%${q.trim().toLowerCase()}%`;
      result = await pool.query(
        `SELECT * FROM enfants
         WHERE LOWER(nom) LIKE $1 OR LOWER(prenom) LIKE $1
         ORDER BY nom, prenom`,
        [terme]
      );
    } else {
      result = await pool.query('SELECT * FROM enfants ORDER BY nom, prenom');
    }
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur lors de la recherche.' });
  }
});

// ── GET /api/enfants/:id  — dossier complet ───────────────
router.get('/:id', async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) return res.status(400).json({ error: 'ID invalide.' });
  try {
    const [enfant, parents, contacts, ententes] = await Promise.all([
      pool.query('SELECT * FROM enfants WHERE id=$1', [id]),
      pool.query('SELECT * FROM parents WHERE enfant_id=$1 ORDER BY id', [id]),
      pool.query('SELECT * FROM contacts_urgence WHERE enfant_id=$1 ORDER BY id', [id]),
      pool.query('SELECT * FROM ententes_services WHERE enfant_id=$1 ORDER BY date_debut DESC', [id]),
    ]);
    if (enfant.rowCount === 0) return res.status(404).json({ error: 'Enfant introuvable.' });
    res.json({ ...enfant.rows[0], parents: parents.rows, contacts: contacts.rows, ententes: ententes.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
});

// ── POST /api/enfants  ────────────────────────────────────
router.post('/', async (req, res) => {
  const { nom, prenom, date_naissance, genre, allergies, notes_medicales } = req.body;
  if (!nom?.trim() || !prenom?.trim() || !date_naissance || !genre) {
    return res.status(400).json({
      error: 'Les champs nom, prénom, date de naissance et genre sont obligatoires.',
    });
  }
  try {
    const result = await pool.query(
      `INSERT INTO enfants (nom, prenom, date_naissance, genre, allergies, notes_medicales)
       VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
      [nom.trim(), prenom.trim(), date_naissance, genre, allergies?.trim() || null, notes_medicales?.trim() || null]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur lors de l\'enregistrement.' });
  }
});

// ── PUT /api/enfants/:id  ─────────────────────────────────
router.put('/:id', async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) return res.status(400).json({ error: 'ID invalide.' });
  const { nom, prenom, date_naissance, genre, allergies, notes_medicales } = req.body;
  if (!nom?.trim() || !prenom?.trim() || !date_naissance || !genre) {
    return res.status(400).json({
      error: 'Les champs nom, prénom, date de naissance et genre sont obligatoires.',
    });
  }
  try {
    const result = await pool.query(
      `UPDATE enfants
       SET nom=$1, prenom=$2, date_naissance=$3, genre=$4, allergies=$5, notes_medicales=$6
       WHERE id=$7 RETURNING *`,
      [nom.trim(), prenom.trim(), date_naissance, genre, allergies?.trim() || null, notes_medicales?.trim() || null, id]
    );
    if (result.rowCount === 0) return res.status(404).json({ error: 'Enfant introuvable.' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
});

// ── DELETE /api/enfants/:id  ──────────────────────────────
router.delete('/:id', async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) return res.status(400).json({ error: 'ID invalide.' });
  try {
    const result = await pool.query('DELETE FROM enfants WHERE id=$1 RETURNING id', [id]);
    if (result.rowCount === 0) return res.status(404).json({ error: 'Enfant introuvable.' });
    res.json({ message: 'Enfant supprimé.', id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur lors de la suppression.' });
  }
});

export default router;
