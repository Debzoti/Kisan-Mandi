import express from "express";
import rateLimit from "express-rate-limit";
import { createAuction,
    getAuctions,
    isOwner,
    updateAuction,
    getAuctionById,
    getMyAuctions,
    updateAuctionStatus,
    deleteAuction } from "./auctionController.js";

import authenticate from "../middlewares/auth.js";

const auctionRouter =  express.Router();

// Define rate limiter: maximum of 100 requests per 15 minutes
const auctionRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
});

// Define a general rate limiter for all routes in this router
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again after 15 minutes',
});

// Apply the general limiter to all routes
auctionRouter.use(generalLimiter);

auctionRouter.post("/create",authenticate, createAuction)
auctionRouter.get("/",authenticate, getAuctions)
auctionRouter.put("/update/:id",authenticate,isOwner, updateAuction)
auctionRouter.get('/:id',authenticate, getAuctionById)
auctionRouter.put('/updatestatus/:id',authenticate, updateAuctionStatus)
auctionRouter.get('/myauctions/:id',auctionRateLimiter, authenticate, getMyAuctions)
auctionRouter.delete('/delete/:id',authenticate, deleteAuction)
export default auctionRouter