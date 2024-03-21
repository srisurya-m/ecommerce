import express from "express";
import { adminOnly } from "../middlewares/auth.js";
import {
  allCoupons,
  applyDiscount,
  deleteCoupon,
  newCoupon,
} from "../controllers/Payment.js";

const app = express.Router();

app.post("/coupon/new", adminOnly, newCoupon); // /api/v1/payment/coupon/new
app.get("/discount", applyDiscount); // /api/v1/payment/discount
app.get("/coupon/all", adminOnly, allCoupons); // /api/v1/payment/coupon/all
app.delete("/coupon/:id", adminOnly, deleteCoupon); // /api/v1/payment/coupon/:id

export default app;
