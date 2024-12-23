import { stripe } from "../app.js";
import { TryCatch } from "../middlewares/error.js";
import { Coupon } from "../modals/Coupon.js";
import ErrorHandler from "../utils/utility-class.js";

export const createPaymentIntent = TryCatch(async (req, res, next) => {
  const { amount, shippingInfo, name } = req.body;
  if (!amount) {
    return next(new ErrorHandler("Please enter amount", 400));
  }
  const paymentIntent = await stripe.paymentIntents.create({
    description: "Software development services",
    shipping: {
      name,
      address: {
        line1: shippingInfo.address,
        postal_code: shippingInfo.pinCode,
        city: shippingInfo.city,
        state: shippingInfo.state,
        country: "US",
      },
    },
    amount: Number(amount) * 100,
    currency: "inr",
    payment_method_types: ["card"],
  });

  return res.status(201).json({
    success: true,
    clientSecret: paymentIntent.client_secret,
  });
});

export const newCoupon = TryCatch(async (req, res, next) => {
  const { code, amount } = req.body;
  if (!code || !amount) {
    return next(
      new ErrorHandler("Please enter both coupon code and amount", 400)
    );
  }
  await Coupon.create({ code: code, amount });
  return res.status(201).json({
    success: true,
    message: `coupon ${code} created successfully!`,
  });
});

export const applyDiscount = TryCatch(async (req, res, next) => {
  const { coupon } = req.query;
  const discount = await Coupon.findOne({ code: coupon });
  if (!discount) return next(new ErrorHandler("Invalid coupon code!", 400));
  return res.status(200).json({
    success: true,
    discount: discount.amount,
  });
});

export const allCoupons = TryCatch(async (req, res, next) => {
  const coupons = await Coupon.find({});
  if (!coupons) return next(new ErrorHandler("No coupon found!", 400));
  return res.status(200).json({
    success: true,
    coupons,
  });
});

export const deleteCoupon = TryCatch(async (req, res, next) => {
  const { id } = req.params;
  const coupon = await Coupon.findByIdAndDelete(id);
  if (!coupon) return next(new ErrorHandler("Invalid coupon code", 400));
  return res.status(200).json({
    success: true,
    message: "Coupon deleted successfully!",
  });
});

export const updateCoupon = TryCatch(async (req, res, next) => {
  const { id } = req.params;
  const { code, amount } = req.body;
  const coupon = await Coupon.findById(id);
  if (!coupon) return next(new ErrorHandler("Invalid coupon code", 400));
  if (code) coupon.code = code;
  if (coupon) coupon.amount = amount;
  await coupon.save();
  return res.status(200).json({
    success: true,
    message: "Coupon updated successfully!",
  });
});

export const getCoupon = TryCatch(async (req, res, next) => {
  const { id } = req.params;
  const coupon = await Coupon.findById(id);
  if (!coupon) return next(new ErrorHandler("Invalid coupon code", 400));
  return res.status(200).json({
    success: true,
    coupon,
  });
});
