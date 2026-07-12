import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.routes';
import usersRoutes from './routes/users.routes';
import productsRoutes from './routes/products.routes';
import locationsRoutes from './routes/locations.routes';
import ordersRoutes from './routes/orders.routes';
import reportsRoutes from './routes/reports.routes';
import pickingRoutes from './routes/picking.routes';
import packingRoutes from './routes/packing.routes';
import dispatchRoutes from './routes/dispatch.routes';
import incidentsRoutes from './routes/incidents.routes';
import warehouseConfigRoutes from './routes/warehouse-config.routes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/products', productsRoutes);
app.use('/api/locations', locationsRoutes);
app.use('/api/orders', ordersRoutes);
app.use('/api/reports', reportsRoutes);
app.use('/api/picking', pickingRoutes);
app.use('/api/packing', packingRoutes);
app.use('/api/dispatch', dispatchRoutes);
app.use('/api/incidents', incidentsRoutes);
app.use('/api/warehouse-config', warehouseConfigRoutes);

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`Servidor WMS corriendo en puerto ${PORT}`);
});
