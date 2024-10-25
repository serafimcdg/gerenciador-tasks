import express from 'express';
import cors from 'cors';
import sequelize from './config/database';
import taskRoutes from './routes/task';
import userRoutes from './routes/user'; 
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(express.json());

const corsOptions = {
  origin: 'http://localhost:3001', 
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], 
  allowedHeaders: ['Content-Type', 'Authorization'], 
  credentials: true, 
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions)); //  preflight requests OPTIONS

app.use('/api/users', userRoutes);
app.use('/api/tasks', taskRoutes); 

const PORT = process.env.PORT || 3000;

sequelize.sync({ force: false })
  .then(() => {
    app.listen(Number(PORT), () => {
      console.log(`porta ${PORT}`);
    });
  })
  .catch(err => console.error('Erro:', err));

export default app;
