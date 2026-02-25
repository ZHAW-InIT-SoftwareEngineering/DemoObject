import express from 'express';
import swaggerUi from "swagger-ui-express";
import { mazeRouter } from './api/routes/mazes.routes';
import { sessionRouter } from './api/routes/sessions.routes';
import { infraRouter } from './api/routes/infra.routes';
import { openApiDocument } from './openapi/openapiDocument';

const app = express();

app.use(express.json());
app.use(infraRouter);
app.get("/openapi.json", (_req, res) => res.json(openApiDocument));
app.use("/docs", swaggerUi.serve, swaggerUi.setup(openApiDocument));

app.use("/mazes", mazeRouter);
app.use("/sessions", sessionRouter);

export default app;
