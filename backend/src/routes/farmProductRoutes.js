import express from 'express';
import { getAllProducts, createProduct } from '../controllers/farmProductController.js';
import rateLimit from 'express-rate-limit';

const router = express.Router();

// Configure rate limiter: maximum of 100 requests per 15 minutes
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  handler: (req, res) => {
    res.status(429).json({
      error: "Too many requests. Please try again after 15 minutes.",
    });
  },
});

// Apply rate limiter to the `/` route
router
  .route('/')
  .get(limiter, getAllProducts)
  .post(limiter, createProduct);

export default router;
