import { Router, Request, Response } from 'express';
import { verifyToken } from '../middleware/auth';
import { IAuthenticatedRequest } from '../Interfaces/authInterface';
import Task from '../models/task';

const router = Router();

router.post('/', verifyToken, async (req: IAuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { title, description, deadline } = req.body;
    const userId = Number(req.userId);
    
    if (isNaN(userId)) {
      res.status(400).json({ message: 'ID do usuario invalido' });
      return;
    }

    const task = await Task.create({ title, description, deadline, userId });
    res.status(201).json(task);
    return; 
  } catch (error) {
    res.status(500).json({ message: 'Erro ao criar tarefa' });
    return;
  }
});

router.get('/', verifyToken, async (req: IAuthenticatedRequest, res: Response): Promise<void> => {
  try {
   
    const userId = Number(req.userId);
    
    if (isNaN(userId)) {
      res.status(400).json({ message: 'ID do usuario invalido' });
      return; 
    }

    const tasks = await Task.findAll({ where: { userId } });
    res.json(tasks);
    return; 
  } catch (error) {
    res.status(500).json({ message: 'Erro ao listar tarefas' });
    return; 
  }
});

export default router;
