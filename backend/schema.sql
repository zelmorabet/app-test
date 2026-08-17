-- ============================================================
-- Script PostgreSQL : RSGE — Gestion de service de garde
-- Exécuter : psql -U postgres -d votre_base -f schema.sql
-- ============================================================

-- Fonction partagée pour updated_at
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- ── Onglet : Service de garde ─────────────────────────────

CREATE TABLE IF NOT EXISTS identification_rsge (
  id             SERIAL       PRIMARY KEY,
  nom            VARCHAR(100) NOT NULL,
  prenom         VARCHAR(100) NOT NULL,
  nom_service    VARCHAR(200) NOT NULL,
  adresse        VARCHAR(255) NOT NULL,
  ville          VARCHAR(100) NOT NULL,
  province       VARCHAR(100) NOT NULL DEFAULT 'Québec',
  code_postal    VARCHAR(10)  NOT NULL,
  telephone      VARCHAR(20)  NOT NULL,
  courriel       VARCHAR(150) NOT NULL,
  date_naissance DATE         NOT NULL,
  created_at     TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

DROP TRIGGER IF EXISTS trg_rsge_updated_at ON identification_rsge;
CREATE TRIGGER trg_rsge_updated_at
  BEFORE UPDATE ON identification_rsge
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();


CREATE TABLE IF NOT EXISTS services (
  id               SERIAL      PRIMARY KEY,
  rsge_id          INTEGER     REFERENCES identification_rsge(id) ON DELETE SET NULL,
  nombre_enfants   INTEGER     NOT NULL DEFAULT 0 CHECK (nombre_enfants >= 0),
  jours_prestation TEXT[]      NOT NULL DEFAULT '{}',
  heure_debut      TIME,
  heure_fin        TIME,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP TRIGGER IF EXISTS trg_services_updated_at ON services;
CREATE TRIGGER trg_services_updated_at
  BEFORE UPDATE ON services
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();


-- ── Onglet : Dossiers enfants ─────────────────────────────

CREATE TABLE IF NOT EXISTS enfants (
  id              SERIAL       PRIMARY KEY,
  nom             VARCHAR(100) NOT NULL,
  prenom          VARCHAR(100) NOT NULL,
  date_naissance  DATE         NOT NULL,
  genre           VARCHAR(20)  NOT NULL CHECK (genre IN ('Masculin','Feminin','Autre')),
  allergies       TEXT,
  notes_medicales TEXT,
  created_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_enfants_nom    ON enfants (LOWER(nom));
CREATE INDEX IF NOT EXISTS idx_enfants_prenom ON enfants (LOWER(prenom));

DROP TRIGGER IF EXISTS trg_enfants_updated_at ON enfants;
CREATE TRIGGER trg_enfants_updated_at
  BEFORE UPDATE ON enfants
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();


CREATE TABLE IF NOT EXISTS parents (
  id          SERIAL       PRIMARY KEY,
  enfant_id   INTEGER      NOT NULL REFERENCES enfants(id) ON DELETE CASCADE,
  nom         VARCHAR(100) NOT NULL,
  prenom      VARCHAR(100) NOT NULL,
  lien        VARCHAR(50)  NOT NULL,  -- Père, Mère, Tuteur, Autre
  telephone   VARCHAR(20),
  courriel    VARCHAR(150),
  adresse     VARCHAR(255),
  created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_parents_enfant ON parents (enfant_id);

DROP TRIGGER IF EXISTS trg_parents_updated_at ON parents;
CREATE TRIGGER trg_parents_updated_at
  BEFORE UPDATE ON parents
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();


CREATE TABLE IF NOT EXISTS contacts_urgence (
  id          SERIAL       PRIMARY KEY,
  enfant_id   INTEGER      NOT NULL REFERENCES enfants(id) ON DELETE CASCADE,
  nom         VARCHAR(100) NOT NULL,
  prenom      VARCHAR(100) NOT NULL,
  lien        VARCHAR(50),
  telephone   VARCHAR(20)  NOT NULL,
  created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_contacts_enfant ON contacts_urgence (enfant_id);

DROP TRIGGER IF EXISTS trg_contacts_updated_at ON contacts_urgence;
CREATE TRIGGER trg_contacts_updated_at
  BEFORE UPDATE ON contacts_urgence
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();


CREATE TABLE IF NOT EXISTS ententes_services (
  id               SERIAL      PRIMARY KEY,
  enfant_id        INTEGER     NOT NULL REFERENCES enfants(id) ON DELETE CASCADE,
  date_debut       DATE        NOT NULL,
  date_fin         DATE,
  jours_semaine    TEXT[]      NOT NULL DEFAULT '{}',
  heure_debut      TIME,
  heure_fin        TIME,
  -- Signature électronique : data-URL base64 (canvas PNG)
  signature_parent TEXT,
  date_signature   TIMESTAMPTZ,
  statut           VARCHAR(20) NOT NULL DEFAULT 'actif'
                     CHECK (statut IN ('actif','inactif','terminé')),
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ententes_enfant ON ententes_services (enfant_id);

DROP TRIGGER IF EXISTS trg_ententes_updated_at ON ententes_services;
CREATE TRIGGER trg_ententes_updated_at
  BEFORE UPDATE ON ententes_services
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
