import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { dbMiddleware } from './middleware/db';
import { globalErrorHandler } from './middleware/error';
import teacherRoutes from './routes/teacherRoutes';

dotenv.config();

const app = express();

// 1. GLOBAL MIDDLEWARES
app.use(cors());
app.use(express.json());

// Apply Database Middleware
app.use(dbMiddleware);

// 2. ROUTES
app.use('/teachers', teacherRoutes);

// Add fallbacks for other routes (to be converted later)
// For now, these will still use the old DB connection logic if called directly
// but since we are running the NEW server, we should eventually convert all.

// 3. ERROR HANDLING
app.use(globalErrorHandler);

export default app;
