import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import { errorMiddleware } from './shared/middleware/error.middleware';
import userRoutes from './modules/users/user.routes';
import authRoutes from './modules/auth/auth.routes';
import { swaggerSpec } from './shared/swagger/swagger.config';

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.get('/api-docs.json', (_req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);

app.use(errorMiddleware);

export default app;
