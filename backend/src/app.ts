import express, { Request, Response } from 'express';
import swaggerUi from "swagger-ui-express";
import { mazePathRouter } from './routes/mazePathRoutes';
import { findPathRouter } from './routes/findPathRoutes';
import { mazeRouter } from './routes/mazeRoutes';
import { sessionRouter } from './routes/sessionCreateRoutes';
import { sessionPathRouter } from './routes/sessionPathRoutes';
import { openApiDocument } from './openapi/openapiDocument';

const app = express();

app.use(express.json());
app.get("/openapi.json", (_req, res) => res.json(openApiDocument));
app.use("/docs", swaggerUi.serve, swaggerUi.setup(openApiDocument));

app.use("/maze", mazePathRouter);
app.use("/maze", findPathRouter);
app.use("/maze", mazeRouter);

app.use("/session", sessionRouter);
app.use("/session", sessionPathRouter);

export default app;
