import dotenv from 'dotenv';
import crypto from 'crypto';

dotenv.config();

// Generate a secure random secret if not provided
const JWT_SECRET: string = process.env.JWT_SECRET || crypto.randomBytes(64).toString('hex');

export const jwtConfig = {
  secret: JWT_SECRET,
  expiresIn: '7d', // Token expires in 7 days
};