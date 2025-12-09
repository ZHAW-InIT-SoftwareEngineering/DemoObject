import http from 'http';
import app from '../app';
import { PORT } from '../config/config';

app.set('port', PORT);

const server = http.createServer(app);

server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
