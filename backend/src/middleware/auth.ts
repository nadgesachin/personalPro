import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';

declare global {
  namespace Express {
    interface Request {
      user?: { id: string };
    }
  }
}

export const auth = (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'Token not provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    req.user = decoded as { id: string, _id: mongoose.Types.ObjectId};
    next();
  } catch (error) {
    res.status(401).json({ error: 'Please authenticate' });
  }
};