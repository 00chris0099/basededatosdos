import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { isConnected } from './config/database';
import authRoutes from './routes/auth.routes';
import productsRoutes from './routes/products.routes';
import ordersRoutes from './routes/orders.routes';
import inventoryRoutes from './routes/inventory.routes';

dotenv.config();

const app = express();
const PORT = parseInt(process.env.PORT || '80');

console.log('Iniciando servidor WMS...');
console.log('DB_SERVER:', process.env.DB_SERVER);
console.log('DB_PORT:', process.env.DB_PORT);
console.log('DB_DATABASE:', process.env.DB_DATABASE);

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/products', productsRoutes);
app.use('/api/orders', ordersRoutes);
app.use('/api/inventory', inventoryRoutes);

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', db: isConnected(), timestamp: new Date().toISOString() });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor WMS corriendo en puerto ${PORT}`);
});
