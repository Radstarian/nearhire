import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth';
import jobRoutes from './routes/jobs';
import employerRoutes from './routes/employer';
import adminRoutes from './routes/admin';
import aiRoutes from './routes/ai';
import whatsappRoutes from './routes/whatsapp';
import uploadRoutes from './routes/upload';
import candidatesRoutes from './routes/candidates';

dotenv.config();

const app = express();
const port = process.env.PORT ?? 4000;

app.use(cors({ origin: true }));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use('/api/auth', authRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/employer', employerRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/whatsapp', whatsappRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/candidates', candidatesRoutes);

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', service: 'nearhire-backend' });
});

app.listen(port, () => {
  console.log(`NearHire backend listening on http://localhost:${port}`);
});
