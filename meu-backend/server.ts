import 'dotenv/config';
import app from './src/app';

const configuredPort = Number(process.env.PORT);
const port = Number.isInteger(configuredPort) && configuredPort > 0 ? configuredPort : 3001;

const server = app.listen(port, () => {
  console.log(`Backend rodando na porta ${port}`);
});

function shutdown(signal: string) {
  console.log(`${signal} recebido; encerrando conexões.`);
  server.close(() => process.exit(0));
  setTimeout(() => process.exit(1), 10_000).unref();
}

process.once('SIGTERM', () => shutdown('SIGTERM'));
process.once('SIGINT', () => shutdown('SIGINT'));
