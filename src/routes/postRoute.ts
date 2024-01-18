import express, { Router } from 'express';
import { createPostController, upadtePostController } from '../controller/postController';
import { authenticateToken } from '../middleware/authMiddleware';

const postRoute: Router = express.Router();

postRoute.post('/post', authenticateToken, createPostController);

postRoute.post('/put', authenticateToken, upadtePostController);

export default postRoute;