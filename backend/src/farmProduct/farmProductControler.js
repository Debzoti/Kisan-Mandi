import createHttpError from "http-errors"
import farmProductModel from "./farmProductModel.js"

const postFarmProduct = async (req, res, next) => {
    const { id, title, price, description, rating, imageUrl, link  } = req.body;
    
    // Validate required fields
    if(!id || !title || !price || !description || !rating || !imageUrl || !link){
        return next(createHttpError(400,"missing farm product data"))
    }
    
    // Validate data types
    if (typeof price !== 'number' || price <= 0) {
        return next(createHttpError(400, "Invalid price value"));
    }
    
    if (typeof rating !== 'number' || rating < 0 || rating > 5) {
        return next(createHttpError(400, "Rating must be between 0 and 5"));
    }
    
    try{
        const existing = await farmProductModel.findOne({ id: id })
        if(existing){
            return next(createHttpError(202, "Already exists"));
        }
        
        const newFarmProductData = {
            id, title, price, description, rating, imageUrl, link
        };
        
        const newFarmProduct = await farmProductModel.create(newFarmProductData)
        res.status(201).json(newFarmProduct)
    }catch(error){
        console.error("Error in postFarmProduct:", error);
        return next(createHttpError(500,"error while creating farm product"))
    }
}

const getFarmProduct = async (req, res, next) => { // Added next
    try {
        // If you intend to get a specific product by an ID from params or query:
        // const { productId } = req.params; // or req.query
        // const farmProduct = await farmProductModel.findById(productId);
        // Or if you mean to get all products (as the original model method might imply):
        const farmProducts = await farmProductModel.find({}); // Assuming getFarmProduct was meant to be find all
        
        if (!farmProducts || farmProducts.length === 0) { // Adjusted for multiple products
            return next(createHttpError(404, "Farm products not found")); // Added next
        }
        res.status(200).json(farmProducts);
    } catch (error) {
        console.error("Database Error:", error);
        return next(createHttpError(500, "Error while fetching farm products")); // Added next and changed message
    }
}
export default {postFarmProduct, getFarmProduct}