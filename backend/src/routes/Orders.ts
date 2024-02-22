import express from "express";
import { adminOnly } from "../middlewares/auth.js";
import { newOrder } from "../controllers/Order.js";

const app = express.Router();

app.post("/new", newOrder); // /api/v1/order/new

export default app;
