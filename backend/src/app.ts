import express from 'express';
import swaggerUi from "swagger-ui-express";
import { chatRouter } from './api/chat/chat.routes';
import { infraRouter } from './api/infra/infra.routes';
import { mazeRouter } from './api/mazes/mazes.routes';
import { sessionRouter } from './api/sessions/sessions.routes';
import { openApiDocument } from './openapi/openapiDocument';

const app = express();

app.use(express.json());
app.use(infraRouter);
app.get("/openapi.json", (_req, res) => res.json(openApiDocument));
app.use("/docs", swaggerUi.serve, swaggerUi.setup(openApiDocument));

app.use("/mazes", mazeRouter);
app.use("/sessions", sessionRouter);
app.use("/chat", chatRouter);

export default app;
