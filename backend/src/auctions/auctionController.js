import createHttpError from "http-errors";
import auctionModel from "../models/auctionModel.js";
import userModel from "../models/userModel.js";
import sendSMS from "../middlewares/twilioService.js";
import mongoose from "mongoose";
async function createAuction(req, res, next) {
  const {
    product,
    startingBid,
    unit,
    harverstDate,
    minBidIncrement,
    duration,
    pickupLocation,
    quantity,
    quality,
    description,
    category,
    images,
    certifications,
  } = req.body;

  if (!product || !startingBid || !quantity) {
    return next(
      createHttpError(
        400,
        "Product name, quantity, and starting price are required"
      )
    );
  }
  console.log(req.body);
  try {
    // Explicitly construct the object to prevent overposting
    const newAuctionData = {
      product,
      startingBid,
      unit,
      harverstDate,
      minBidIncrement,
      duration,
      pickupLocation,
      quantity,
      quality,
      description,
      category,
      images,
      certifications,
      farmerId: req.userId, // Assuming req.userId is set by authentication middleware
      currentBid: startingBid, // currentBid should be initialized, typically to startingBid
    };

    const newAuction = await auctionModel.create(newAuctionData);
    res.status(201).json(newAuction);
  } catch (error) {
    if (error.code === 11000) {
      return next(createHttpError(409, "Auction already exists"));
    }
    if (error.name === "ValidationError") {
      return next(createHttpError(400, error.message));
    }
    next(error);
  }
}

async function getAuctions(req, res, next) {
  try {
    const auctions = await auctionModel.find().populate({path: 'farmerId', select: 'name'});
    console.log(auctions);
    res.json(auctions);
  } catch (error) {
    next(error);
  }
}

async function updateAuction(req, res, next) {
  try {
    const { id } = req.params;
    const allowedUpdates = [
      "product",
      "startingBid",
      "unit",
      "harverstDate", // Consider standardizing to 'harvestDate' if it's a typo
      "minBidIncrement",
      "duration",
      "pickupLocation",
      "quantity",
      "quality",
      "description",
      "category",
      "images",
      "certifications",
    ];
    const updateData = {};

    for (const key of allowedUpdates) {
      if (Object.prototype.hasOwnProperty.call(req.body, key)) {
        updateData[key] = req.body[key];
      }
    }

    if (Object.keys(updateData).length === 0) {
      return next(createHttpError(400, "No valid fields to update"));
    }

    const updatedAuction = await auctionModel.findByIdAndUpdate(
      id,
      { $set: updateData }, // Use $set to prevent operator injection
      { new: true, runValidators: true } // Return the updated document and run schema validators
    );

    if (!updatedAuction) {
      return res.status(404).json({ message: "Auction not found" });
    }

    res.status(200).json(updatedAuction);
  } catch (error) {
    next(error);
  }
}

const isOwner = async (req, res, next) => {
  try {
    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return next(createHttpError(400, "Invalid auction ID format"));
    }

    const auction = await auctionModel.findById(req.params.id);
    if (!auction) {
      return next(createHttpError(404, "Auction not found"));
    }
    if (auction.farmerId.toString() !== req.userId) {
      return next(
        createHttpError(403, "You are not the owner of this auction")
      );
    }
    next();
  } catch (error) {
    next(error);
  }
};

const getAuctionById = async (req, res, next) => {
  try {
    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return next(createHttpError(400, "Invalid auction ID format"));
    }

    console.log("Fetching auction details... of", req.params.id);
    const auction = await auctionModel.findById(req.params.id);
    if (!auction) {
      return next(createHttpError(404, "Auction not found"));
    }
    res.json(auction);
  } catch (error) {
    next(error);
  }
};

const updateAuctionStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return next(createHttpError(400, "Invalid auction ID format"));
    }

    // Validate the status against a list of allowed statuses
    const allowedStatuses = ["open", "closed", "pending", "sold", "cancelled"]; // Example statuses
    if (!status || !allowedStatuses.includes(status)) {
      return next(createHttpError(400, "Invalid or missing status"));
    }

    const auction = await auctionModel.findById(id);

    if (!auction) {
      return next(createHttpError(404, "Auction not found"));
    }
    auction.status = status; // Assign validated status

    await auction.save();
    console.log("Fetching farmer details...");
    const user = await userModel.findById(auction.farmerId);

    if (user) {
      try {
        await sendSMS("+91" + user.phone, "Your auction status has been updated to " + status);
        console.log("SMS sent successfully!");
      } catch (smsError) {
        console.error("Error sending SMS:", smsError); 
        // Decide if this error should be sent to the client or just logged
      }
    } else {
      console.log("User not found, SMS not sent.");
    }

    res.json(auction);
  } catch (error) {
    console.error("Error in updateAuctionStatus:", error);
    next(error);
  }
};


const getMyAuctions = async (req, res, next) => {
  try {
    // const auctions = await auctionModel.find({ farmerId: req.userId });
    const auctions = await auctionModel.find({ farmerId: req.userId }).populate({path: 'farmerId', select: 'name'});
    res.json(auctions);
  } catch (error) {
    next(error);
  }
}



async function deleteAuction(req, res, next) {
  try {
    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return next(createHttpError(400, "Invalid auction ID format"));
    }

    const deletedAuction = await auctionModel.findByIdAndDelete(req.params.id);
    if (!deletedAuction) {
      return res.status(404).json({ message: "Auction not found" });
    }
    res.status(200).json({ message: "Auction deleted successfully" });
  } catch (error) {
    next(error);
  }
}


export { createAuction, updateAuction, getAuctions, isOwner, getAuctionById, updateAuctionStatus, getMyAuctions, deleteAuction };
