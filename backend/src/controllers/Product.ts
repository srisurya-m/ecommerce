import { Request } from "express";
import { TryCatch } from "../middlewares/error.js";
import {
  SearchRequestQuery,
  baseQuery,
  newProductRequestBody,
} from "../types/types.js";
import { Product } from "../modals/Product.js";
import ErrorHandler from "../utils/utility-class.js";
import { rm } from "fs";
import { myCache } from "../app.js";
import { deleteFromCloudinary, invalidatesCache, uploadToCloudinary } from "../utils/features.js";

export const newProduct = TryCatch(
  async (req: Request<{}, {}, newProductRequestBody>, res, next) => {
    const { name, category, price, stock,description } = req.body;
    const photos = req.files as Express.Multer.File[] | undefined;

    if (!photos) {
      return next(new ErrorHandler("Please add a Photo", 400));
    }
    if (photos.length < 1) {
      return next(new ErrorHandler("Please add at least one Photo", 400));
    }
    if (photos.length > 5) {
      return next(new ErrorHandler("You can only add 5 photos", 400));
    }

    if (!name || !price || !stock || !category || !description) {

      return next(new ErrorHandler("Please enter All Fields", 400));
    }

    // upload on the cloudinary
    const photosURL =  await uploadToCloudinary(photos)

    await Product.create({
      name,
      category: category.toLowerCase(),
      description,
      price,
      stock,
      photos: photosURL,
    });

    invalidatesCache({ product: true, admin: true });
    return res.status(201).json({
      success: true,
      message: `${name} created successfully under category ${category}`,
    });
  }
);

export const updateProduct = TryCatch(async (req, res, next) => {
  const { id } = req.params;
  const { name, price, stock, category, description } = req.body;
  const photos = req.files as Express.Multer.File[] | undefined;

  const product = await Product.findById(id);

  if (!product) return next(new ErrorHandler("Product Not Found", 404));

  if (photos && photos.length > 0) {
    const photosURL = await uploadToCloudinary(photos);

    const ids = product.photos.map((photo) => photo.public_id);

    await deleteFromCloudinary(ids);

    product.photos.splice(0, product.photos.length);  // Clear the existing photos array

    // Add the new photos to the Mongoose DocumentArray
    photosURL.forEach((photoData) => {
      product.photos.push({
        public_id: photoData.public_id,
        url: photoData.url,
      });
    });
  }

  if (name) product.name = name;
  if (price) product.price = price;
  if (stock) product.stock = stock;
  if (category) product.category = category;
  if (description) product.description = description;

  await product.save();

  await invalidatesCache({
    product: true,
    productId: String(product._id),
    admin: true,
  });

  return res.status(200).json({
    success: true,
    message: "Product Updated Successfully",
  });
});

//revalidate the cache on new,update,delete operations on product and also on new order
export const getLatestProducts = TryCatch(async (req, res, next) => {
  let products;
  if (myCache.has("latest-products")) {
    products = JSON.parse(myCache.get("latest-products") as string);
  }
  products = await Product.find({}).sort({ createdAt: -1 }).limit(5); //-1 means descending and limit to fetch latest 5 products
  myCache.set("latest-products", JSON.stringify(products));

  return res.status(200).json({
    success: true,
    products,
  });
});

// searching controller
export const getAllProducts = TryCatch(
  async (req: Request<{}, {}, {}, SearchRequestQuery>, res, next) => {
    const { search, sort, price, category } = req.query;
    const page = Number(req.query.page) || 1;
    const limit = Number(process.env.PRODUCT_PER_PAGE) || 8;
    const skip = limit * (page - 1);

    const baseQuery: baseQuery = {};

    if (search) {
      baseQuery.name = {
        $regex: search,
        $options: "i",
      };
    }
    if (price) {
      baseQuery.price = {
        $lte: Number(price),
      };
    }
    if (category) {
      baseQuery.category = category;
    }

    const productPromise = Product.find(baseQuery)
      .sort(sort && { price: sort === "asc" ? 1 : -1 })
      .limit(limit)
      .skip(skip);

    const [products, filteredOnlyProducts] = await Promise.all([
      // basically executing both the awaits simultaneously in one go for optimization
      productPromise,
      Product.find(baseQuery),
    ]);

    const totalPages = Math.ceil(filteredOnlyProducts.length / limit);

    return res.status(200).json({
      success: true,
      products,
      totalPages,
    });
  }
);

//revalidate the cache on new,update,delete operations on product and also on new order
export const getAdminProducts = TryCatch(async (req, res, next) => {
  let products;
  if (myCache.has("all-products")) {
    products = JSON.parse(myCache.get("all-products") as string);
  }
  products = await Product.find({});
  myCache.set("all-products", JSON.stringify(products));

  return res.status(200).json({
    success: true,
    products,
  });
});

export const getSingleProduct = TryCatch(async (req, res, next) => {
  const id = req.params.id;
  let product;
  if (myCache.has(`product-${id}`)) {
    product = JSON.parse(myCache.get(`product-${id}`) as string);
  }
  product = await Product.findById(id);
  if (!product) return next(new ErrorHandler("Product Not Found", 404));
  myCache.set(`product-${id}`, JSON.stringify(product));

  return res.status(200).json({
    success: true,
    product,
  });
});

export const deleteProduct = TryCatch(async (req, res, next) => {
  const id = req.params.id;
  const product = await Product.findById(id);
  if (!product) return next(new ErrorHandler("Product Not Found", 404));

  const ids = product.photos.map((photo)=> photo.public_id);
  await deleteFromCloudinary(ids);
  await product.deleteOne();
  invalidatesCache({
    product: true,
    productId: String(product._id),
    admin: true,
  });

  return res.status(200).json({
    success: true,
    message: `Product deleted Successfully `,
  });
});

//revalidate the cache on new,update,delete operations on product and also on new order
export const getAllCategories = TryCatch(async (req, res, next) => {
  let categories;
  if (myCache.has("categories")) {
    categories = JSON.parse(myCache.get("categories") as string);
  }
  categories = await Product.distinct("category");
  myCache.set("categories", JSON.stringify(categories));
  return res.status(200).json({
    success: true,
    categories,
  });
});
