import { v2 as cloudinary } from "cloudinary";
import productModel from "../models/productModel.js";

/* ================= ADD PRODUCT ================= */

const addProduct = async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      category,
      subCategory,
      sizes,
      bestseller,
    } = req.body;

    // Validation
    if (!name || !price || !category) {
      return res.json({
        success: false,
        message: "Please fill all required fields",
      });
    }

    // Safe file access
    const image1 = req.files?.image1?.[0];
    const image2 = req.files?.image2?.[0];
    const image3 = req.files?.image3?.[0];
    const image4 = req.files?.image4?.[0];

    const images = [image1, image2, image3, image4].filter(
      (item) => item !== undefined
    );

    // Upload to Cloudinary
    const imagesUrl = await Promise.all(
      images.map(async (item) => {
        const result = await cloudinary.uploader.upload(item.path, {
          resource_type: "image",
        });

        return result.secure_url;
      })
    );

    // Product Object
    const productData = {
      name,
      description,
      category,
      price: Number(price),
      subCategory,

      bestseller: bestseller === "true" || bestseller === true,

      sizes: sizes ? JSON.parse(sizes) : [],

      image: imagesUrl,

      date: Date.now(),
    };

    console.log(productData);

    const product = new productModel(productData);
    await product.save();

    res.json({
      success: true,
      message: "Product Added Successfully",
    });
  } catch (error) {
    console.log(error);

    res.json({
      success: false,
      message: error.message,
    });
  }
};

/* ================= LIST PRODUCTS ================= */

const listProducts = async (req, res) => {
  try {
    const products = await productModel.find({});

    res.json({
      success: true,
      products,
    });
  } catch (error) {
    console.log(error);

    res.json({
      success: false,
      message: error.message,
    });
  }
};

/* ================= REMOVE PRODUCT ================= */

const removeProduct = async (req, res) => {
  try {
    const { id } = req.body;

    await productModel.findByIdAndDelete(id);

    res.json({
      success: true,
      message: "Product Removed Successfully",
    });
  } catch (error) {
    console.log(error);

    res.json({
      success: false,
      message: error.message,
    });
  }
};

/* ================= SINGLE PRODUCT ================= */

const singleProduct = async (req, res) => {
  try {
    const { productId } = req.body;

    const product = await productModel.findById(productId);

    if (!product) {
      return res.json({
        success: false,
        message: "Product not found",
      });
    }

    res.json({
      success: true,
      product,
    });
  } catch (error) {
    console.log(error);

    res.json({
      success: false,
      message: error.message,
    });
  }
};

export {
  listProducts,
  addProduct,
  removeProduct,
  singleProduct,
};
