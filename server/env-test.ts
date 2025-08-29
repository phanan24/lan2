import { Router } from 'express';

const router = Router();

router.get('/env-test', (req, res) => {
  res.json({
    DATABASE_URL: process.env.DATABASE_URL,
    PGHOST: process.env.PGHOST,
    PGDATABASE: process.env.PGDATABASE,
    PGUSER: process.env.PGUSER,
    PGPASSWORD: process.env.PGPASSWORD ? '***' : undefined,
    PGSSLMODE: process.env.PGSSLMODE,
    PGCHANNELBINDING: process.env.PGCHANNELBINDING,
    PORT: process.env.PORT
  });
});

export default router;