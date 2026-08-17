import { Router } from 'express';
import pool from '../db.js';

const router = Router();

// ── GET /api/rsge  ────────────────────────────────────────
router.get('/', async (_req, res) => {
  try {
    const result = await pool.query('SELECT * FROM identification_rsge ORDER BY id');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
});

// ── POST /api/rsge  ───────────────────────────────────────
router.post('/', async (req, res) => {
  const { nom, prenom, nom_service, adresse, ville, province, code_postal, telephone, courriel, date_naissance } = req.body;
  if (!nom?.trim() || !prenom?.trim() || !nom_service?.trim() || !adresse?.trim() ||
      !ville?.trim() || !code_postal?.trim() || !telephone?.trim() || !courriel?.trim() || !date_naissance) {
    return res.status(400).json({ error: 'Tous les champs d\'identification sont obligatoires.' });
  }
  try {
    const result = await pool.query(
      `INSERT INTO identification_rsge
         (nom, prenom, nom_service, adresse, ville, province, code_postal, telephone, courriel, date_naissance)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *`,
      [nom.trim(), prenom.trim(), nom_service.trim(), adresse.trim(), ville.trim(),
       province?.trim() || 'Québec', code_postal.trim(), telephone.trim(), courriel.trim(), date_naissance]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
});

// ── PUT /api/rsge/:id  ────────────────────────────────────
router.put('/:id', async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) return res.status(400).json({ error: 'ID invalide.' });
  const { nom, prenom, nom_service, adresse, ville, province, code_postal, telephone, courriel, date_naissance } = req.body;
  try {
    const result = await pool.query(
      `UPDATE identification_rsge
       SET nom=$1, prenom=$2, nom_service=$3, adresse=$4, ville=$5,
           province=$6, code_postal=$7, telephone=$8, courriel=$9, date_naissance=$10
       WHERE id=$11 RETURNING *`,
      [nom, prenom, nom_service, adresse, ville, province || 'Québec', code_postal, telephone, courriel, date_naissance, id]
    );
    if (result.rowCount === 0) return res.status(404).json({ error: 'Identification introuvable.' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
});

// ── DELETE /api/rsge/:id  ─────────────────────────────────
router.delete('/:id', async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) return res.status(400).json({ error: 'ID invalide.' });
  try {
    const result = await pool.query('DELETE FROM identification_rsge WHERE id=$1 RETURNING id', [id]);
    if (result.rowCount === 0) return res.status(404).json({ error: 'Identification introuvable.' });
    res.json({ message: 'Supprimé.', id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
});

export default router;
