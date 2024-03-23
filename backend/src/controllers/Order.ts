import { TryCatch } from "../middlewares/error.js";
import { Request } from "express";
import { NewOrderRequestBody } from "../types/types.js";
import { Order } from "../modals/Order.js";
import { invalidatesCache, reduceStock } from "../utils/features.js";
import ErrorHandler from "../utils/utility-class.js";
import { myCache } from "../app.js";

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

    const order=await Order.create({
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
    invalidatesCache({
      product: true,
      order: true,
      admin: true,
      userId: user,
      productId:order.orderItems.map(i=>String(i.productId))
    });
    return res.status(201).json({
      success: "true",
      message: "Order placed Successfully",
    });
  }
);

export const myOrders = TryCatch(async (req, res, next) => {
  const { id: user } = req.query;
  let orders = [];
  if (myCache.has(`my-orders-${user}`))
    orders = JSON.parse(myCache.get(`my-orders-${user}`) as string);

  orders = await Order.find({ user });
  myCache.set(`my-orders-${user}`, JSON.stringify(orders));

  return res.status(200).json({
    success: "true",
    orders,
  });
});

export const allOrders = TryCatch(async (req, res, next) => {
  let orders = [];
  if (myCache.has("all-orders"))
    orders = JSON.parse(myCache.get("all-orders") as string);

  orders = await Order.find().populate("user", "name");
  myCache.set("all-orders", JSON.stringify(orders));

  return res.status(200).json({
    success: "true",
    orders,
  });
});

export const getSingleOrder = TryCatch(async (req, res, next) => {
  const id = req.params.id;
  let order;
  if (myCache.has(`order-${id}`))
    order = JSON.parse(myCache.get(`order-${id}`) as string);

  order = await Order.findById(id).populate("user", "name");
  if (!order) return next(new ErrorHandler("Order not found", 404));

  myCache.set(`order-${id}`, JSON.stringify(order));

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
  invalidatesCache({
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
  invalidatesCache({
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
