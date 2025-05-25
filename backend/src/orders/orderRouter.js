import express from "express";
import rateLimit from 'express-rate-limit';
import { createOrder, getOrderById, updateOrderStatus, getAllOrders, getOrdersByUserId} from "./orderController.js";
import authenticate from "../middlewares/auth.js";


const orderRouter = express.Router();

// Define a general rate limiter for all routes in this router
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again after 15 minutes',
});

// Apply the general limiter to all routes
orderRouter.use(generalLimiter);

orderRouter.post("/", authenticate, createOrder);
orderRouter.get("/", authenticate, getOrdersByUserId); // Added authenticate
orderRouter.get("/all", authenticate, getAllOrders); // Added route for getAllOrders
orderRouter.get("/:id", authenticate, getOrderById); // Added route for getOrderById
orderRouter.put("/:id", authenticate, updateOrderStatus); // Added route for updateOrderStatus

export default orderRouter;