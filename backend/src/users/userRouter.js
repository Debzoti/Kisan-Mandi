import express from "express";
import rateLimit from 'express-rate-limit';
import { createUser,loginUser,farmerInfo, vendorInfo, editUserById,acceptOrder } from "./userController.js";
import authenticate from "../middlewares/auth.js"
const userRouter = express.Router();

// Define a general rate limiter for all routes in this router
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again after 15 minutes',
});

// Apply the general limiter to all routes
userRouter.use(generalLimiter);

userRouter.post("/register", createUser )
userRouter.post("/login", loginUser )
userRouter.get('/farmers/:userId', authenticate, farmerInfo)
userRouter.get('/vendors/:userId', authenticate, vendorInfo)
userRouter.put('/update/:userId', authenticate, editUserById)
// The generalLimiter is already applied to all routes, including this one.
// If you want a *stricter* or *different* limit for this specific route,
// you can apply acceptOrderLimiter *in addition* or *instead*.
// For now, relying on generalLimiter.
userRouter.post('/acceptOrder', authenticate, acceptOrder)
export default userRouter