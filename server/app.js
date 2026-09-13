import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import cookieParser from 'cookie-parser';

import { connectDB } from './config/db.js';
import cropRoutes from './routes/cropRoutes.js';
import buyerRoutes from './routes/buyerRoutes.js';
import marketRoutes from './routes/marketRoutes.js';
import requirementRoutes from './routes/requirementRoutes.js';
import dealRoutes from './routes/dealRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import offerRoutes from './routes/offerRoutes.js';
import authRoutes from './routes/authRoutes.js';
import marketPriceRoutes from './routes/marketPriceRoutes.js';

dotenv.config();

connectDB();

const app = express();

// ── Middleware ────────────────────────────────────────────────
app.use(
  cors({
    origin(origin, callback) {
      const allowedOrigin = process.env.CLIENT_ORIGIN;
      const localOrigin =
        !origin ||
        /^https?:\/\/(localhost|127\.0\.0\.1):(5173|5174)$/.test(origin);

      if (!allowedOrigin || origin === allowedOrigin || localOrigin) {
        callback(null, true);
        return;
      }

      callback(new Error('Origin is not allowed by CORS.'));
    },
    credentials: true,
  })
);
app.use(cookieParser());
app.use(express.json());

// ── Routes ────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'HaatLink API' });
});

app.use('/api/crops', cropRoutes);
app.use('/api/buyers', buyerRoutes);
app.use('/api/markets', marketRoutes);
app.use('/api/v1/market', marketRoutes);
app.use('/api/requirements', requirementRoutes);
app.use('/api/deals', dealRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/offers', offerRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/market-prices', marketPriceRoutes);

// ── 404 handler ───────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ message: `Route ${req.originalUrl} not found.` });
});

// ── Global error handler ──────────────────────────────────────
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Internal server error.', error: err.message });
});

// ── Start ─────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});