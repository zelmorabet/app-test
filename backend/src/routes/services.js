import { Router } from 'express';
import pool from '../db.js';

const router = Router();

// ── GET /api/services  ────────────────────────────────────
router.get('/', async (_req, res) => {
  try {
    const result = await pool.query(
      `SELECT s.*, r.nom_service
       FROM services s
       LEFT JOIN identification_rsge r ON r.id = s.rsge_id
       ORDER BY s.id`
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
});

// ── POST /api/services  ───────────────────────────────────
router.post('/', async (req, res) => {
  const { rsge_id, nombre_enfants, jours_prestation, heure_debut, heure_fin } = req.body;
  if (nombre_enfants === undefined || nombre_enfants === null) {
    return res.status(400).json({ error: 'Le nombre d\'enfants est obligatoire.' });
  }
  try {
    const result = await pool.query(
      `INSERT INTO services (rsge_id, nombre_enfants, jours_prestation, heure_debut, heure_fin)
       VALUES ($1,$2,$3,$4,$5) RETURNING *`,
      [rsge_id || null, nombre_enfants, jours_prestation || [], heure_debut || null, heure_fin || null]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
});

// ── PUT /api/services/:id  ────────────────────────────────
router.put('/:id', async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) return res.status(400).json({ error: 'ID invalide.' });
  const { rsge_id, nombre_enfants, jours_prestation, heure_debut, heure_fin } = req.body;
  try {
    const result = await pool.query(
      `UPDATE services
       SET rsge_id=$1, nombre_enfants=$2, jours_prestation=$3, heure_debut=$4, heure_fin=$5
       WHERE id=$6 RETURNING *`,
      [rsge_id || null, nombre_enfants, jours_prestation || [], heure_debut || null, heure_fin || null, id]
    );
    if (result.rowCount === 0) return res.status(404).json({ error: 'Service introuvable.' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
});

// ── DELETE /api/services/:id  ─────────────────────────────
router.delete('/:id', async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) return res.status(400).json({ error: 'ID invalide.' });
  try {
    const result = await pool.query('DELETE FROM services WHERE id=$1 RETURNING id', [id]);
    if (result.rowCount === 0) return res.status(404).json({ error: 'Service introuvable.' });
    res.json({ message: 'Supprimé.', id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
});

export default router;
