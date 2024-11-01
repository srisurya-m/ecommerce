import { Request } from "express";
import { redis, redisTTL } from "../app.js";
import { TryCatch } from "../middlewares/error.js";
import { Order } from "../modals/Order.js";
import { NewOrderRequestBody } from "../types/types.js";
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

    const order = await Order.create({
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
    await invalidatesCache({
      product: true,
      order: true,
      admin: true,
      userId: user,
      productId: order.orderItems.map((i) => String(i.productId)),
    });
    return res.status(201).json({
      success: "true",
      message: "Order placed Successfully",
    });
  }
);

export const myOrders = TryCatch(async (req, res, next) => {
  const { id: user } = req.query;
  let orders;
  orders = await redis.get(`my-orders-${user}`);
  if (orders) orders = JSON.parse(orders);
  else {
    orders = await Order.find({ user });
    await redis.setex(`my-orders-${user}`, redisTTL, JSON.stringify(orders));
  }

  return res.status(200).json({
    success: "true",
    orders,
  });
});

export const allOrders = TryCatch(async (req, res, next) => {
  let orders;
  orders = await redis.get("all-orders");
  if (orders) orders = JSON.parse(orders);
  else {
    orders = await Order.find().populate("user", "name");
    await redis.setex("all-orders", redisTTL, JSON.stringify(orders));
  }

  return res.status(200).json({
    success: "true",
    orders,
  });
});

export const getSingleOrder = TryCatch(async (req, res, next) => {
  const id = req.params.id;
  let order;
  order = await redis.get(`order-${id}`);
  if (order) order = JSON.parse(order);
  else {
    order = await Order.findById(id).populate("user", "name");
    if (!order) return next(new ErrorHandler("Order not found", 404));

    await redis.setex(`order-${id}`, redisTTL, JSON.stringify(order));
  }

  return res.status(200).json({
    success: "true",
    order,
  });
});

export const processOrder = TryCatch(async (req, res, next) => {
  const id = req.params.id;

  const order = await Order.findById(id);
  if (!order) return next(new ErrorHandler("Order not found", 404));

  switch (order.status) {
    case "Processing":
      order.status = "Shipped";
      break;
    case "Shipped":
      order.status = "Delivered";
      break;

    default:
      order.status = "Delivered";
      break;
  }
  await order.save();
  await invalidatesCache({
    product: false,
    order: true,
    admin: true,
    userId: order.user,
    orderId: String(order._id),
  });
  return res.status(200).json({
    success: "true",
    message: "Order processed Successfully",
  });
});

export const deleteOrder = TryCatch(async (req, res, next) => {
  const id = req.params.id;

  const order = await Order.findById(id);
  if (!order) return next(new ErrorHandler("Order not found", 404));

  await order.deleteOne();
  await invalidatesCache({
    product: false,
    order: true,
    admin: true,
    userId: order.user,
    orderId: String(order._id),
  });
  return res.status(200).json({
    success: "true",
    message: "Order deleted Successfully",
  });
});
