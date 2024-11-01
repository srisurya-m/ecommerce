import { v2 as cloudinary } from "cloudinary";
import { Redis } from "ioredis";
import mongoose, { Document } from "mongoose";
import { redis } from "../app.js";
import { Product } from "../modals/Product.js";
import { Review } from "../modals/Review.js";
import {
  CloudinaryResponse,
  InvalidateCacheProps,
  OrderItemType,
} from "../types/types.js";

export const connectDB = (uri: string) => {
  mongoose
    .connect(uri)
    .then((c) => console.log(`DB connected to ${c.connection.host}`))
    .catch((e) => console.log(e));
};

export const connectRedis = (redisUri: string) => {
  const redis = new Redis(redisUri);
  redis.on("connect", () => console.log("Redis Connected"));
  redis.on("error", (e) => console.log(e));

  return redis;
};

export const getBase64 = (file: Express.Multer.File) => {
  return `data:${file.mimetype};base64,${file.buffer.toString("base64")}`;
};

export const uploadToCloudinary = async (files: Express.Multer.File[]) => {
  const promises = files.map(async (file) => {
    return new Promise<CloudinaryResponse>((resolve, reject) => {
      cloudinary.uploader.upload(getBase64(file), (error, result) => {
        if (error) return reject(error);
        resolve(result!);
      });
    });
  });
  const result = await Promise.all(promises);
  return result.map((i) => ({
    public_id: i.public_id,
    url: i.secure_url,
  }));
};

export const deleteFromCloudinary = async (publicIds: string[]) => {
  const promises = publicIds.map((id) => {
    return new Promise<void>((resolve, reject) => {
      cloudinary.uploader.destroy(id, (error, result) => {
        if (error) return reject(error);
        resolve();
      });
    });
  });

  await Promise.all(promises);
};

export const invalidatesCache = async ({
  product,
  order,
  admin,
  review,
  userId,
  orderId,
  productId,
}: InvalidateCacheProps) => {

  if(review){
    await redis.del(`reviews-${productId}`)
  }

  if (product) {
    let productKeys: string[] = [
      "latest-products",
      "categories",
      "all-products",
    ];

    if (typeof productId === "string") productKeys.push(`product-${productId}`);

    if (typeof productId === "object")
      // mostly in js everything is object so array over here is substituted as object
      productId.forEach((i) => productKeys.push(`product-${i}`));

    await redis.del(productKeys);
  }
  if (order) {
    const orderKeys: string[] = [
      "all-orders",
      `my-orders-${userId}`,
      `order-${orderId}`,
    ];
    await redis.del(orderKeys);
  }
  if (admin) {
    await redis.del([
      "admin-stats",
      "admin-pie-charts",
      "admin-bar-charts",
      "admin-line-charts",
    ]);
  }
};

export const reduceStock = async (orderItems: OrderItemType[]) => {
  for (let i = 0; i < orderItems.length; i++) {
    const order = orderItems[i];
    const product = await Product.findById(order.productId);
    if (!product) throw new Error("Product Not Found");
    product.stock -= order.quantity;
    await product.save();
  }
};

export const calculatePercentage = (
  currentMonth: number,
  lastMonth: number
) => {
  if (lastMonth == 0) return currentMonth * 100;
  const percent = (currentMonth / lastMonth) * 100;
  return Number(percent.toFixed(0));
};

interface myDocument extends Document {
  createdAt: Date;
  discount?: number;
  total?: number;
}

type funcProps = {
  length: number;
  docArr: myDocument[];
  today: Date;
  property?: "total" | "discount";
};

export const getChartData = ({
  length,
  docArr,
  today,
  property,
}: funcProps) => {
  const data: number[] = new Array(length).fill(0);

  docArr.forEach((i) => {
    const creationDate = i.createdAt;
    const monthDiff = (today.getMonth() - creationDate.getMonth() + 12) % 12;
    if (monthDiff < length) {
      if (property) {
        data[length - monthDiff - 1] += i[property]!;
      } else {
        data[length - monthDiff - 1] += 1;
      }
    }
  });
  return data;
};

export const findAverageRatings = async (
  productId: mongoose.Types.ObjectId
) => {
  let totalRating = 0;

  const reviews = await Review.find({ product: productId });
  reviews.forEach((review) => {
    totalRating += review.rating;
  });

  const averageRating = Math.floor(totalRating / reviews.length) || 0;

  return {
    numOfReviews: reviews.length,
    ratings: averageRating,
  };
};
