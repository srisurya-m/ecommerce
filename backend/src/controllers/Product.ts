import { Request } from "express";
import { redis, redisTTL } from "../app.js";
import { TryCatch } from "../middlewares/error.js";
import { Product } from "../modals/Product.js";
import { Review } from "../modals/Review.js";
import { User } from "../modals/User.js";
import {
  SearchRequestQuery,
  baseQuery,
  newProductRequestBody,
} from "../types/types.js";
import {
  deleteFromCloudinary,
  findAverageRatings,
  invalidatesCache,
  uploadToCloudinary,
} from "../utils/features.js";
import ErrorHandler from "../utils/utility-class.js";

export const newProduct = TryCatch(
  async (req: Request<{}, {}, newProductRequestBody>, res, next) => {
    const { name, category, price, stock, description } = req.body;
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
    const photosURL = await uploadToCloudinary(photos);

    await Product.create({
      name,
      category: category.toLowerCase(),
      description,
      price,
      stock,
      photos: photosURL,
    });

    await invalidatesCache({ product: true, admin: true });
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

    product.photos.splice(0, product.photos.length); // Clear the existing photos array

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
  products = await redis.get("latest-products");
  if (products) {
    products = JSON.parse(products);
  }
  products = await Product.find({}).sort({ createdAt: -1 }).limit(5); //-1 means descending and limit to fetch latest 5 products
  await redis.setex("latest-products", redisTTL, JSON.stringify(products));

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

    const key = `products-${search}-${sort}-${category}-${price}-${page}`;

    let products;
    let totalPages;
    const cachedData = await redis.get(key);

    if (cachedData) {
      const data = JSON.parse(cachedData);
      totalPages = data.totalPages;
      products = data.products;
    } else {
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

      const [productsFetched, filteredOnlyProducts] = await Promise.all([
        // basically executing both the awaits simultaneously in one go for optimization
        productPromise,
        Product.find(baseQuery),
      ]);

      products = productsFetched;
      totalPages = Math.ceil(filteredOnlyProducts.length / limit);

      await redis.setex(key, 20, JSON.stringify({ products, totalPages }));
    }

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
  products = await redis.get("all-products");
  if (products) {
    products = JSON.parse(products);
  }
  products = await Product.find({});
  await redis.setex("all-products", redisTTL, JSON.stringify(products));

  return res.status(200).json({
    success: true,
    products,
  });
});

export const getSingleProduct = TryCatch(async (req, res, next) => {
  const id = req.params.id;
  let product;
  product = await redis.get(`product-${id}`);
  if (product) {
    product = JSON.parse(product);
  } else {
    product = await Product.findById(id);
    if (!product) return next(new ErrorHandler("Product Not Found", 404));
    await redis.setex(`product-${id}`, redisTTL, JSON.stringify(product));
  }

  return res.status(200).json({
    success: true,
    product,
  });
});

export const deleteProduct = TryCatch(async (req, res, next) => {
  const id = req.params.id;
  const product = await Product.findById(id);
  if (!product) return next(new ErrorHandler("Product Not Found", 404));

  const ids = product.photos.map((photo) => photo.public_id);
  await deleteFromCloudinary(ids);
  await product.deleteOne();
  await invalidatesCache({
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
  categories = await redis.get("categories");
  if (categories) {
    categories = JSON.parse(categories);
  }
  categories = await Product.distinct("category");
  await redis.setex("categories", redisTTL, JSON.stringify(categories));
  return res.status(200).json({
    success: true,
    categories,
  });
});

export const newReview = TryCatch(async (req, res, next) => {
  const user = await User.findById(req.query.id);
  if (!user) return next(new ErrorHandler("User Not Found", 404));
  const id = req.params.id;
  const product = await Product.findById(id);
  if (!product) return next(new ErrorHandler("Product Not Found", 404));

  const { comment, rating } = req.body;

  const alreadyReviewed = await Review.findOne({
    user: user._id,
    product: product._id,
  });

  if (alreadyReviewed) {
    alreadyReviewed.comment = comment;
    alreadyReviewed.rating = rating;

    await alreadyReviewed.save();
  } else {
    await Review.create({
      comment,
      rating,
      user: user?._id,
      product: product?._id,
    });
  }

  const { ratings, numOfReviews } = await findAverageRatings(product._id);

  product.ratings = ratings;
  product.numOfReviews = numOfReviews;

  await product.save();

  await invalidatesCache({
    product: true,
    productId: String(product._id),
    admin: true,
    review: true,
  });

  return res.status(alreadyReviewed ? 200 : 201).json({
    success: true,
    message: alreadyReviewed ? "Review updated" : `Review added Successfully `,
  });
});

export const deleteReview = TryCatch(async (req, res, next) => {
  const user = await User.findById(req.query.id);
  if (!user) return next(new ErrorHandler("User Not Found", 404));
  const id = req.params.id;
  const review = await Review.findById(id);
  if (!review) return next(new ErrorHandler("Review Not Found", 404));

  const isAuthenticUser = review.user.toString() === user._id.toString();

  if (!isAuthenticUser) {
    return next(new ErrorHandler("Not Authorized", 401));
  }

  await review.deleteOne();

  const product = await Product.findById(review.product);
  if (!product) return next(new ErrorHandler("Product Not Found", 404));
  const { ratings, numOfReviews } = await findAverageRatings(product._id);

  product.ratings = ratings;
  product.numOfReviews = numOfReviews;

  await product.save();

  await invalidatesCache({
    product: true,
    productId: String(product._id),
    admin: true,
  });

  return res.status(200).json({
    success: true,
    message: "Review deleted",
  });
});

export const allReviewsOfProduct = TryCatch(async (req, res, next) => {
  const id = req.params.id;
  let reviews;
  reviews = await redis.get(`reviews-${id}`);
  if (reviews) reviews = JSON.parse(reviews);
  else {
    reviews = await Review.find({
      product: id,
    })
      .populate("user", "name photo")
      .sort({ updatedAt: -1 });

    await redis.setex(`reviews-${id}`, redisTTL, JSON.stringify(reviews));
  }

  return res.status(200).json({
    success: true,
    reviews,
  });
});
