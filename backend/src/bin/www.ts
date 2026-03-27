import http from 'http';
import app from '../app';
import { PORT } from '../config/config';
import { connectToDb } from '../db/mongo';

app.set('port', PORT);

const server = http.createServer(app);


async function start() {
  await connectToDb();
  server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

start().catch((err) => {
  console.error("Failed to start application:", err);
  process.exit(1);
});
