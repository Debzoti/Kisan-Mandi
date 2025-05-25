// serever side socket logic

import Auction from "../models/auctionModel.js";
import userModel from "../models/userModel.js";
import mongoose from "mongoose";

export const setupAuctionHandlers = (io) => {
  io.on("connection", (socket) => {
    socket.on("joinAuction", (auctionId) => {
      socket.join(auctionId);
      console.log(`User ${socket.id} joined auction room: ${auctionId}`);
    });

    // Handle bid placement
    socket.on("placeBid", async ({ auctionId, bidAmount, userId }) => {
      try {
        // 0. Validate inputs
        if (!auctionId || !bidAmount || !userId) {
          return socket.emit("bidError", "Missing auctionId, bidAmount, or userId");
        }
        // Add more specific validation if needed (e.g., bidAmount is a positive number)
        if (typeof bidAmount !== 'number' || bidAmount <= 0) {
          return socket.emit("bidError", "Invalid bid amount.");
        }

        // 1. Fetch auction from MongoDB
        // Validate ObjectId formats before querying
        if (!mongoose.Types.ObjectId.isValid(auctionId) || !mongoose.Types.ObjectId.isValid(userId)) {
          return socket.emit("bidError", "Invalid ID format");
        }
        
        const auction = await Auction.findById(auctionId);
        const user = await userModel.findById(userId);

        if (!auction) {
          return socket.emit("bidError", "Auction not found");
        }
        if (!user) {
          return socket.emit("bidError", "User not found");
        }
        if (user.role === "farmer") {
          return socket.emit("bidError", "Farmer cannot bid");
        }
        // 2. Validate auction status
        if (auction.status !== "open") {
          return socket.emit("bidError", "Auction has closed");
        }

        // 3. Validate bid amount
        if (bidAmount <= auction.currentBid) {
          return socket.emit(
            "bidError",
            `Bid must be higher than current $${auction.currentBid}`
          );
        }

        // 4. Update in MongoDB

        // It's safer to define the update logic within the handler or call a well-defined service function.
        // The nested async function `updateBid` was a bit complex and could be simplified or integrated.

        // Find existing bid by the same user
        const existingBidIndex = auction.highestBidder.findIndex(
          (bid) => bid.user.toString() === userId
        );

        if (existingBidIndex !== -1) {
          // User has an existing bid, update it if the new bid is higher
          if (bidAmount > auction.highestBidder[existingBidIndex].amount) {
            auction.highestBidder[existingBidIndex].amount = bidAmount;
            auction.highestBidder[existingBidIndex].bidTime = new Date();
          } else {
            return socket.emit(
              "bidError",
              "New bid must be higher than your previous bid"
            );
          }
        } else {
          // New bidder, add their bid
          auction.highestBidder.push({
            user: userId,
            userName: user.name, // Ensure user.name is available and correct
            amount: bidAmount,
            bidTime: new Date(),
          });
        }

        // Sort bids in descending order & keep only the top N (e.g., top 3 or more)
        auction.highestBidder.sort((a, b) => b.amount - a.amount);
        const maxBiddersToShow = 3; // Or make this configurable
        if (auction.highestBidder.length > maxBiddersToShow) {
          auction.highestBidder = auction.highestBidder.slice(0, maxBiddersToShow);
        }

        // Update currentBid (highest bid)
        auction.currentBid = auction.highestBidder[0]?.amount || auction.startingBid; // Fallback to startingBid if no bids

        await auction.save(); // Save the updated auction document

        // Emit success event or updated auction details
        io.to(auctionId).emit("bidPlaced", auction); // Emit to a room for this auction
        socket.emit("bidSuccess", auction); // Confirm to the bidder

      } catch (error) { // Catch block for the main try
        console.error("Error placing bid:", error);
        socket.emit("bidError", "An error occurred while placing your bid.");
      }
    });

    socket.on("joinAuctionRoom", (auctionId) => {
      socket.join(auctionId);
      console.log(`User ${socket.id} joined auction room ${auctionId}`);
    });

    socket.on("leaveAuctionRoom", (auctionId) => {
      socket.leave(auctionId);
      console.log(`User ${socket.id} left auction room ${auctionId}`);
    });

  });
};
