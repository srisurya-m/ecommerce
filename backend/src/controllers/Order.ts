import { TryCatch } from "../middlewares/error.js";
import { Request } from "express";
import { NewOrderRequestBody } from "../types/types.js";
import { Order } from "../modals/Order.js";
import { invalidatesCache, reduceStock } from "../utils/features.js";
import ErrorHandler from "../utils/utility-class.js";

export const newOrder = TryCatch(
  async (req: Request<{}, {}, NewOrderRequestBody>, res, next) => {
    const {
      shippingInfo,
      orderItems,
      shippingCharges,
      subtotal,
      tax,
      total,
      user,
      discount,
    } = req.body;

    if (!shippingInfo || !orderItems || !user || !subtotal || !tax || !total)
      return next(new ErrorHandler("Please Enter All Fields", 400));

    await Order.create({
      shippingInfo,
      orderItems,
      shippingCharges,
      subtotal,
      tax,
      total,
      user,
      discount,
    });

    await reduceStock(orderItems);
    await invalidatesCache({ product: true, order: true, admin: true });
    res.status(201).json({
      success: "true",
      message: "Order placed Successfully",
    });
  }
);
