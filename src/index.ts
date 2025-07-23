import express from 'express';
import cors from 'cors';
import loginRouter from './routes/auth';
import usersRouter from './routes/users';
import ordersRouter from './routes/orders';
import productsRouter from './routes/products';

const app = express();
const port = 3001;

app.use(cors({ origin: 'http://localhost:3000', credentials: true }));
app.use(express.json());

app.use('/api/login', loginRouter);
app.use('/api/users', usersRouter);
app.use('/api/orders', ordersRouter);
app.use('/api/products', productsRouter);

app.listen(port, () => {
  console.log(`API server running on http://localhost:${port}`);
});
