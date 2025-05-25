import FarmProduct from '../models/farmProductModel.js';

// Get all farm products
export const getAllProducts = async (req, res) => {
  try {
    const products = await FarmProduct.find({});
    res.status(200).json({
      status: 'success',
      results: products.length,
      data: {
        products
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// Create a new farm product
export const createProduct = async (req, res) => {
  try {
    const { name, price, quantity, category, description, farmer } = req.body;
    // Add any other fields you expect and want to allow

    if (!name || !price || !quantity) {
      return res.status(400).json({
        status: 'error',
        message: 'Name, price, and quantity are required'
      });
    }

    const newProductData = {
      name,
      price,
      quantity,
      category,
      description,
      farmer
      // Add other validated and sanitized fields here
    };

    const newProduct = await FarmProduct.create(newProductData);
    res.status(201).json({
      status: 'success',
      data: {
        product: newProduct
      }
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};
