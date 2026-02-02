import express, { Request, Response } from 'express';
import swaggerUi from "swagger-ui-express";
import { mazeRouter } from './routes/mazes.routes';
import { sessionRouter } from './routes/sessions.routes';
import { openApiDocument } from './openapi/openapiDocument';

const app = express();

app.use(express.json());
app.get("/openapi.json", (_req, res) => res.json(openApiDocument));
app.use("/docs", swaggerUi.serve, swaggerUi.setup(openApiDocument));

app.use("/mazes", mazeRouter);
app.use("/sessions", sessionRouter);

export default app;
