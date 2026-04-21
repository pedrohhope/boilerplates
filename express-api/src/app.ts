import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { errorMiddleware } from './shared/middleware/error.middleware';
import userRoutes from './modules/users/user.routes';
import authRoutes from './modules/auth/auth.routes';

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);

app.use(errorMiddleware);

export default app;
