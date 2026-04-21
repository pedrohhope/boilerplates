import app from './app';
import { connectDatabase } from './shared/database/connection';

const PORT = process.env.PORT || 3000;

const start = async (): Promise<void> => {
  await connectDatabase();
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV}`);
  });
};

start().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});
