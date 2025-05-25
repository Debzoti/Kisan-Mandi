import express from 'express';
import rateLimit from 'express-rate-limit';
import { getQuestions, createQuestion, postComment, getForumPostByid } from './forumController.js';
import authenticate from '../middlewares/auth.js';
const forumRouter = express.Router();

// Define a general rate limiter for all routes in this router
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again after 15 minutes',
});

// Apply the general limiter to all routes
forumRouter.use(generalLimiter);

forumRouter.get('/', authenticate, getQuestions);
forumRouter.post('/', authenticate, createQuestion);
forumRouter.post('/comment/:id', authenticate, postComment);
forumRouter.get('/:id', authenticate, getForumPostByid);

export default forumRouter;