import dotenv from 'dotenv';
dotenv.config();

async function main() {
  const express = (await import('express')).default;
  const cors = (await import('cors')).default;
  const authRoutes = (await import('./routes/auth')).default;

  const app = express();
  const PORT = process.env.PORT || 3001;

  // Middleware
  app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
  }));
  app.use(express.json());

  // Routes
  app.use('/api/auth', authRoutes);

  // Health check
  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok' });
  });

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

main();
