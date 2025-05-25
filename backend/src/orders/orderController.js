import createHttpError from "http-errors"
import orderModel from "./orderModel.js"
import mongoose from "mongoose"


const  getOrdersByUserId = async (req, res, next) => {
    try {
        const { userId } = req.params;
        
        // Validate userId format
        if (!mongoose.Types.ObjectId.isValid(userId)) {
           return next(createHttpError(400, "Invalid user ID format"));
        }

        const orders = await orderModel.find({userId: userId})
        
        res.json(orders)
    } catch (error) {
       console.error("Error in getOrdersByUserId:", error);
       return next(createHttpError(500,"error while getting orders"))
    }
}



export default {getOrdersByUserId}