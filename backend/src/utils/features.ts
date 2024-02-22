import mongoose from "mongoose";
import { InvalidateCacheProps } from "../types/types.js";
import { myCache } from "../app.js";
import { Product } from "../modals/Product.js";

export const connectDB = (uri:string) => {
  mongoose
    .connect(uri)
    .then((c) => console.log(`DB connected to ${c.connection.host}`))
    .catch((e) => console.log(e));
};

export const invalidatesCache = async ({
  product,
  order,
  admin,
}: InvalidateCacheProps) => {
  if (product) {
    let productKeys: string[] = [
      "latest-products",
      "categories",
      "all-products",
    ];

    const productsId = await Product.find({}).select("_id");
    productsId.forEach((i) => {
      productKeys.push(`product-${i._id}`);
    });
    myCache.del(productKeys);
  }
  if (order) {
  }
  if (admin) {
  }
};
