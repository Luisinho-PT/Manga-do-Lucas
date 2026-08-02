import cors from 'cors';
import express, { type ErrorRequestHandler } from 'express';
import helmet from 'helmet';
import characterRoutes from './routes/characterRoutes';
import systemRoutes from './routes/systemRoutes';
import botProtectionMiddleware from './middleware/botProtectionMiddleware';

const app = express();
app.set('trust proxy', 1);
const allowedOrigins = (process.env.FRONTEND_URL || 'http://localhost:3000')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
      return;
    }
    callback(new Error('Origem bloqueada pelo CORS.'));
  },
  credentials: true,
}));
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginResourcePolicy: false,
}));
app.use(express.json({ limit: '32kb' }));
app.use(botProtectionMiddleware);

app.get('/api/health', (_request, response) => {
  response.status(200).json({ status: 'ok' });
});

app.get('/api/teste', (_request, response) => {
  response.status(200).json({
    mensagem: 'Sucesso! O Backend Express está conectado.',
    data: new Date().toISOString(),
  });
});

app.use('/api/system', systemRoutes);
app.use('/api/characters', characterRoutes);

app.use((_request, response) => {
  response.status(404).json({ error: 'Rota não encontrada.' });
});

const errorHandler: ErrorRequestHandler = (error, _request, response, _next) => {
  console.error('Erro não tratado na API:', error instanceof Error ? error.message : 'erro desconhecido');
  response.status(500).json({ error: 'Erro interno do servidor.' });
};
app.use(errorHandler);

export default app;
