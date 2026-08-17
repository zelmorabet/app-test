const jours = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];

export const swaggerSpec = {
  openapi: '3.0.0',
  info: {
    title: 'RSGE — API Gestion de service de garde',
    version: '1.0.0',
    description: 'API REST pour la gestion RSGE : identification, services, dossiers enfants, parents, contacts d\'urgence et ententes de services.',
  },
  servers: [{ url: 'http://localhost:3001/api', description: 'Serveur local' }],
  tags: [
    { name: 'Service de garde', description: 'Identification RSGE et services' },
    { name: 'Dossiers enfants', description: 'Enfants, parents, contacts et ententes' },
  ],
  paths: {

    // ── identification_rsge ───────────────────────────────
    '/rsge': {
      get: {
        tags: ['Service de garde'],
        summary: 'Lister les identifications RSGE',
        responses: { 200: { description: 'Liste retournée', content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/IdentificationRSGE' } } } } } },
      },
      post: {
        tags: ['Service de garde'],
        summary: 'Créer une identification RSGE',
        requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/IdentificationRSGEInput' } } } },
        responses: {
          201: { description: 'Créé', content: { 'application/json': { schema: { $ref: '#/components/schemas/IdentificationRSGE' } } } },
          400: { $ref: '#/components/responses/BadRequest' },
        },
      },
    },
    '/rsge/{id}': {
      parameters: [{ $ref: '#/components/parameters/id' }],
      put: {
        tags: ['Service de garde'],
        summary: 'Modifier une identification RSGE',
        requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/IdentificationRSGEInput' } } } },
        responses: {
          200: { description: 'Modifié', content: { 'application/json': { schema: { $ref: '#/components/schemas/IdentificationRSGE' } } } },
          404: { $ref: '#/components/responses/NotFound' },
        },
      },
      delete: {
        tags: ['Service de garde'],
        summary: 'Supprimer une identification RSGE',
        responses: { 200: { $ref: '#/components/responses/Deleted' }, 404: { $ref: '#/components/responses/NotFound' } },
      },
    },

    // ── services ──────────────────────────────────────────
    '/services': {
      get: {
        tags: ['Service de garde'],
        summary: 'Lister les services',
        responses: { 200: { description: 'Liste retournée', content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/Service' } } } } } },
      },
      post: {
        tags: ['Service de garde'],
        summary: 'Créer un service',
        requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/ServiceInput' } } } },
        responses: {
          201: { description: 'Créé', content: { 'application/json': { schema: { $ref: '#/components/schemas/Service' } } } },
          400: { $ref: '#/components/responses/BadRequest' },
        },
      },
    },
    '/services/{id}': {
      parameters: [{ $ref: '#/components/parameters/id' }],
      put: {
        tags: ['Service de garde'],
        summary: 'Modifier un service',
        requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/ServiceInput' } } } },
        responses: { 200: { description: 'Modifié', content: { 'application/json': { schema: { $ref: '#/components/schemas/Service' } } } }, 404: { $ref: '#/components/responses/NotFound' } },
      },
      delete: {
        tags: ['Service de garde'],
        summary: 'Supprimer un service',
        responses: { 200: { $ref: '#/components/responses/Deleted' }, 404: { $ref: '#/components/responses/NotFound' } },
      },
    },

    // ── enfants ───────────────────────────────────────────
    '/enfants': {
      get: {
        tags: ['Dossiers enfants'],
        summary: 'Lister / rechercher les enfants',
        parameters: [{ name: 'q', in: 'query', description: 'Recherche par nom ou prénom', schema: { type: 'string' } }],
        responses: { 200: { description: 'Liste retournée', content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/Enfant' } } } } } },
      },
      post: {
        tags: ['Dossiers enfants'],
        summary: 'Créer un dossier enfant',
        requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/EnfantInput' } } } },
        responses: {
          201: { description: 'Créé', content: { 'application/json': { schema: { $ref: '#/components/schemas/Enfant' } } } },
          400: { $ref: '#/components/responses/BadRequest' },
        },
      },
    },
    '/enfants/{id}': {
      parameters: [{ $ref: '#/components/parameters/id' }],
      get: {
        tags: ['Dossiers enfants'],
        summary: 'Dossier complet (enfant + parents + contacts + ententes)',
        responses: {
          200: { description: 'Dossier complet', content: { 'application/json': { schema: { $ref: '#/components/schemas/DossierComplet' } } } },
          404: { $ref: '#/components/responses/NotFound' },
        },
      },
      put: {
        tags: ['Dossiers enfants'],
        summary: 'Modifier un dossier enfant',
        requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/EnfantInput' } } } },
        responses: { 200: { description: 'Modifié', content: { 'application/json': { schema: { $ref: '#/components/schemas/Enfant' } } } }, 404: { $ref: '#/components/responses/NotFound' } },
      },
      delete: {
        tags: ['Dossiers enfants'],
        summary: 'Supprimer un dossier enfant (cascade sur parents/contacts/ententes)',
        responses: { 200: { $ref: '#/components/responses/Deleted' }, 404: { $ref: '#/components/responses/NotFound' } },
      },
    },

    // ── parents ───────────────────────────────────────────
    '/parents': {
      get: {
        tags: ['Dossiers enfants'],
        summary: 'Lister les parents',
        parameters: [{ name: 'enfant_id', in: 'query', schema: { type: 'integer' } }],
        responses: { 200: { description: 'Liste retournée', content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/Parent' } } } } } },
      },
      post: {
        tags: ['Dossiers enfants'],
        summary: 'Ajouter un parent',
        requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/ParentInput' } } } },
        responses: { 201: { description: 'Créé', content: { 'application/json': { schema: { $ref: '#/components/schemas/Parent' } } } }, 400: { $ref: '#/components/responses/BadRequest' } },
      },
    },
    '/parents/{id}': {
      parameters: [{ $ref: '#/components/parameters/id' }],
      put: {
        tags: ['Dossiers enfants'],
        summary: 'Modifier un parent',
        requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/ParentInput' } } } },
        responses: { 200: { description: 'Modifié', content: { 'application/json': { schema: { $ref: '#/components/schemas/Parent' } } } }, 404: { $ref: '#/components/responses/NotFound' } },
      },
      delete: {
        tags: ['Dossiers enfants'],
        summary: 'Supprimer un parent',
        responses: { 200: { $ref: '#/components/responses/Deleted' }, 404: { $ref: '#/components/responses/NotFound' } },
      },
    },

    // ── contacts_urgence ──────────────────────────────────
    '/contacts': {
      get: {
        tags: ['Dossiers enfants'],
        summary: 'Lister les contacts d\'urgence',
        parameters: [{ name: 'enfant_id', in: 'query', schema: { type: 'integer' } }],
        responses: { 200: { description: 'Liste retournée', content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/Contact' } } } } } },
      },
      post: {
        tags: ['Dossiers enfants'],
        summary: 'Ajouter un contact d\'urgence',
        requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/ContactInput' } } } },
        responses: { 201: { description: 'Créé', content: { 'application/json': { schema: { $ref: '#/components/schemas/Contact' } } } }, 400: { $ref: '#/components/responses/BadRequest' } },
      },
    },
    '/contacts/{id}': {
      parameters: [{ $ref: '#/components/parameters/id' }],
      put: {
        tags: ['Dossiers enfants'],
        summary: 'Modifier un contact d\'urgence',
        requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/ContactInput' } } } },
        responses: { 200: { description: 'Modifié', content: { 'application/json': { schema: { $ref: '#/components/schemas/Contact' } } } }, 404: { $ref: '#/components/responses/NotFound' } },
      },
      delete: {
        tags: ['Dossiers enfants'],
        summary: 'Supprimer un contact d\'urgence',
        responses: { 200: { $ref: '#/components/responses/Deleted' }, 404: { $ref: '#/components/responses/NotFound' } },
      },
    },

    // ── ententes_services ─────────────────────────────────
    '/ententes': {
      get: {
        tags: ['Dossiers enfants'],
        summary: 'Lister les ententes de services',
        parameters: [{ name: 'enfant_id', in: 'query', schema: { type: 'integer' } }],
        responses: { 200: { description: 'Liste retournée', content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/Entente' } } } } } },
      },
      post: {
        tags: ['Dossiers enfants'],
        summary: 'Créer une entente de services',
        requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/EntenteInput' } } } },
        responses: { 201: { description: 'Créée', content: { 'application/json': { schema: { $ref: '#/components/schemas/Entente' } } } }, 400: { $ref: '#/components/responses/BadRequest' } },
      },
    },
    '/ententes/{id}': {
      parameters: [{ $ref: '#/components/parameters/id' }],
      put: {
        tags: ['Dossiers enfants'],
        summary: 'Modifier une entente (inclut la signature électronique)',
        requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/EntenteInput' } } } },
        responses: { 200: { description: 'Modifiée', content: { 'application/json': { schema: { $ref: '#/components/schemas/Entente' } } } }, 404: { $ref: '#/components/responses/NotFound' } },
      },
      delete: {
        tags: ['Dossiers enfants'],
        summary: 'Supprimer une entente',
        responses: { 200: { $ref: '#/components/responses/Deleted' }, 404: { $ref: '#/components/responses/NotFound' } },
      },
    },
  },

  components: {
    parameters: {
      id: { name: 'id', in: 'path', required: true, schema: { type: 'integer' } },
    },
    responses: {
      BadRequest: { description: 'Données invalides', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
      NotFound:   { description: 'Ressource introuvable', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
      Deleted:    { description: 'Supprimé', content: { 'application/json': { schema: { type: 'object', properties: { message: { type: 'string' }, id: { type: 'integer' } } } } } },
    },
    schemas: {
      Error: { type: 'object', properties: { error: { type: 'string' } } },

      IdentificationRSGEInput: {
        type: 'object', required: ['nom','prenom','nom_service','adresse','ville','code_postal','telephone','courriel','date_naissance'],
        properties: {
          nom:            { type: 'string', example: 'Tremblay' },
          prenom:         { type: 'string', example: 'Marie' },
          nom_service:    { type: 'string', example: 'Garderie Les Petits Soleils' },
          adresse:        { type: 'string', example: '123 rue des Érables' },
          ville:          { type: 'string', example: 'Québec' },
          province:       { type: 'string', example: 'Québec', default: 'Québec' },
          code_postal:    { type: 'string', example: 'G1R 2B5' },
          telephone:      { type: 'string', example: '418-555-0100' },
          courriel:       { type: 'string', format: 'email', example: 'marie@garderie.ca' },
          date_naissance: { type: 'string', format: 'date', example: '1985-03-15' },
        },
      },
      IdentificationRSGE: {
        allOf: [{ $ref: '#/components/schemas/IdentificationRSGEInput' }],
        properties: { id: { type: 'integer' }, created_at: { type: 'string', format: 'date-time' }, updated_at: { type: 'string', format: 'date-time' } },
      },

      ServiceInput: {
        type: 'object', required: ['nombre_enfants'],
        properties: {
          rsge_id:          { type: 'integer', nullable: true },
          nombre_enfants:   { type: 'integer', minimum: 0, example: 6 },
          jours_prestation: { type: 'array', items: { type: 'string', enum: jours }, example: ['Lundi','Mardi','Mercredi'] },
          heure_debut:      { type: 'string', example: '07:30' },
          heure_fin:        { type: 'string', example: '17:30' },
        },
      },
      Service: {
        allOf: [{ $ref: '#/components/schemas/ServiceInput' }],
        properties: { id: { type: 'integer' }, nom_service: { type: 'string' }, created_at: { type: 'string', format: 'date-time' }, updated_at: { type: 'string', format: 'date-time' } },
      },

      EnfantInput: {
        type: 'object', required: ['nom','prenom','date_naissance','genre'],
        properties: {
          nom:             { type: 'string', example: 'Gagnon' },
          prenom:          { type: 'string', example: 'Lucas' },
          date_naissance:  { type: 'string', format: 'date', example: '2020-06-10' },
          genre:           { type: 'string', enum: ['Masculin','Feminin','Autre'] },
          allergies:       { type: 'string', nullable: true, example: 'Arachides' },
          notes_medicales: { type: 'string', nullable: true },
        },
      },
      Enfant: {
        allOf: [{ $ref: '#/components/schemas/EnfantInput' }],
        properties: { id: { type: 'integer' }, created_at: { type: 'string', format: 'date-time' }, updated_at: { type: 'string', format: 'date-time' } },
      },
      DossierComplet: {
        allOf: [{ $ref: '#/components/schemas/Enfant' }],
        properties: {
          parents:  { type: 'array', items: { $ref: '#/components/schemas/Parent' } },
          contacts: { type: 'array', items: { $ref: '#/components/schemas/Contact' } },
          ententes: { type: 'array', items: { $ref: '#/components/schemas/Entente' } },
        },
      },

      ParentInput: {
        type: 'object', required: ['enfant_id','nom','prenom','lien'],
        properties: {
          enfant_id: { type: 'integer' },
          nom:       { type: 'string', example: 'Gagnon' },
          prenom:    { type: 'string', example: 'Pierre' },
          lien:      { type: 'string', enum: ['Père','Mère','Tuteur','Autre'] },
          telephone: { type: 'string', nullable: true, example: '418-555-0200' },
          courriel:  { type: 'string', nullable: true, format: 'email' },
          adresse:   { type: 'string', nullable: true },
        },
      },
      Parent: {
        allOf: [{ $ref: '#/components/schemas/ParentInput' }],
        properties: { id: { type: 'integer' }, created_at: { type: 'string', format: 'date-time' }, updated_at: { type: 'string', format: 'date-time' } },
      },

      ContactInput: {
        type: 'object', required: ['enfant_id','nom','prenom','telephone'],
        properties: {
          enfant_id: { type: 'integer' },
          nom:       { type: 'string', example: 'Bouchard' },
          prenom:    { type: 'string', example: 'Sophie' },
          lien:      { type: 'string', nullable: true, example: 'Grand-mère' },
          telephone: { type: 'string', example: '418-555-0303' },
        },
      },
      Contact: {
        allOf: [{ $ref: '#/components/schemas/ContactInput' }],
        properties: { id: { type: 'integer' }, created_at: { type: 'string', format: 'date-time' }, updated_at: { type: 'string', format: 'date-time' } },
      },

      EntenteInput: {
        type: 'object', required: ['enfant_id','date_debut'],
        properties: {
          enfant_id:        { type: 'integer' },
          date_debut:       { type: 'string', format: 'date', example: '2026-09-01' },
          date_fin:         { type: 'string', format: 'date', nullable: true },
          jours_semaine:    { type: 'array', items: { type: 'string', enum: jours }, example: ['Lundi','Mardi','Jeudi'] },
          heure_debut:      { type: 'string', example: '07:30' },
          heure_fin:        { type: 'string', example: '17:00' },
          signature_parent: { type: 'string', nullable: true, description: 'Data-URL base64 PNG (canvas signature)' },
          statut:           { type: 'string', enum: ['actif','inactif','terminé'], default: 'actif' },
        },
      },
      Entente: {
        allOf: [{ $ref: '#/components/schemas/EntenteInput' }],
        properties: {
          id:             { type: 'integer' },
          date_signature: { type: 'string', format: 'date-time', nullable: true },
          created_at:     { type: 'string', format: 'date-time' },
          updated_at:     { type: 'string', format: 'date-time' },
        },
      },
    },
  },
};
