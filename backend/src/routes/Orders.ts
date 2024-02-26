import express from "express";
import { adminOnly } from "../middlewares/auth.js";
import {
  allOrders,
  deleteOrder,
  getSingleOrder,
  myOrders,
  newOrder,
  processOrder,
} from "../controllers/Order.js";

const app = express.Router();

app.post("/new", newOrder); // /api/v1/order/new
app.get("/my", myOrders); // /api/v1/order/my
app.get("/all", adminOnly, allOrders); // /api/v1/order/my
app.get("/all", adminOnly, allOrders); // /api/v1/order/my
app.get("/:id", getSingleOrder); // /api/v1/order/:id
app.put("/:id", adminOnly, processOrder); // /api/v1/order/:id
app.delete("/:id", adminOnly, deleteOrder); // /api/v1/order/:id

export default app;
