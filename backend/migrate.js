// Script de migration: adapte la BD à la nouvelle structure relationnelle
import pool from './src/db.js';

const migration = `
BEGIN;

-- 1. Migrer parent1 vers la table parents (si les données existent)
INSERT INTO parents (enfant_id, nom, prenom, lien)
SELECT id, parent1_nom, parent1_prenom, parent1_lien
FROM enfants
WHERE parent1_nom IS NOT NULL AND parent1_nom <> ''
  AND NOT EXISTS (
    SELECT 1 FROM parents p WHERE p.enfant_id = enfants.id AND p.nom = parent1_nom
  );

-- 2. Migrer parent2 vers la table parents
INSERT INTO parents (enfant_id, nom, prenom, lien)
SELECT id, parent2_nom, parent2_prenom, parent2_lien
FROM enfants
WHERE parent2_nom IS NOT NULL AND parent2_nom <> ''
  AND NOT EXISTS (
    SELECT 1 FROM parents p WHERE p.enfant_id = enfants.id AND p.nom = parent2_nom
  );

-- 3. Ajouter les nouvelles colonnes médicales
ALTER TABLE enfants ADD COLUMN IF NOT EXISTS allergies       TEXT;
ALTER TABLE enfants ADD COLUMN IF NOT EXISTS notes_medicales TEXT;

-- 4. Supprimer les colonnes parent* devenues obsolètes
ALTER TABLE enfants DROP COLUMN IF EXISTS parent1_nom;
ALTER TABLE enfants DROP COLUMN IF EXISTS parent1_prenom;
ALTER TABLE enfants DROP COLUMN IF EXISTS parent1_lien;
ALTER TABLE enfants DROP COLUMN IF EXISTS parent2_nom;
ALTER TABLE enfants DROP COLUMN IF EXISTS parent2_prenom;
ALTER TABLE enfants DROP COLUMN IF EXISTS parent2_lien;

COMMIT;
`;

async function run() {
  const client = await pool.connect();
  try {
    console.log('🔄 Migration en cours…');
    await client.query(migration);
    console.log('✅ Migration réussie.');

    // Vérification
    const cols = await client.query(`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'enfants'
      ORDER BY ordinal_position
    `);
    console.log('\nColonnes de la table enfants :');
    cols.rows.forEach(r => console.log(` · ${r.column_name} (${r.data_type})`));
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ Erreur de migration :', err.message);
    process.exit(1);
  } finally {
    client.release();
    process.exit(0);
  }
}

run();
