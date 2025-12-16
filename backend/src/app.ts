import express, { Request, Response } from 'express';
import swaggerUi from "swagger-ui-express";
import { mazePathRouter } from './routes/mazePathRoutes';
import { openApiDocument } from './openapi/openapiDocument';

const app = express();

app.use(express.json());

app.use("/maze-paths", mazePathRouter);

app.get("/openapi.json", (_req, res) => res.json(openApiDocument));
app.use("/docs", swaggerUi.serve, swaggerUi.setup(openApiDocument));

export default app;
