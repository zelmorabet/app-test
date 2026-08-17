import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './swagger.js';
import enfantsRouter  from './routes/enfants.js';
import rsgeRouter     from './routes/rsge.js';
import servicesRouter from './routes/services.js';
import parentsRouter  from './routes/parents.js';
import contactsRouter from './routes/contacts.js';
import ententesRouter from './routes/ententes.js';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({ origin: 'http://localhost:5173' }));
app.use(express.json({ limit: '4mb' })); // nécessaire pour les signatures base64

app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.get('/api/docs.json', (_req, res) => res.json(swaggerSpec));

// ── Onglet : Service de garde ─────────────────────────────
app.use('/api/rsge',     rsgeRouter);
app.use('/api/services', servicesRouter);

// ── Onglet : Dossiers enfants ─────────────────────────────
app.use('/api/enfants',  enfantsRouter);
app.use('/api/parents',  parentsRouter);
app.use('/api/contacts', contactsRouter);
app.use('/api/ententes', ententesRouter);

app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));

app.listen(PORT, () => {
  console.log(`✅ Backend RSGE démarré sur http://localhost:${PORT}`);
});
