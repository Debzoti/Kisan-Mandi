import express from "express";
import rateLimit from "express-rate-limit";
import { createOrder, status } from "./paymentController.js";

const paymentRouter = express.Router();

// Define a general rate limiter for all routes in this router
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message:
    "Too many requests from this IP, please try again after 15 minutes",
});

// Apply the general limiter to all routes
paymentRouter.use(generalLimiter);

paymentRouter.post("/create-order", createOrder);
paymentRouter.post("/status", status);

export default paymentRouter;