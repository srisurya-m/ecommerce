import { v2 as cloudinary } from "cloudinary";
import cors from "cors";
import { config } from "dotenv";
import express from "express";
import morgan from "morgan";
import Stripe from "stripe";

//importing routes
import { errorMiddleware } from "./middlewares/error.js";
import orderRoute from "./routes/Orders.js";
import paymentRoute from "./routes/Payment.js";
import productRoute from "./routes/Products.js";
import dashboardRoute from "./routes/Statistics.js";
import userRoute from "./routes/User.js";
import { connectDB, connectRedis } from "./utils/features.js";

config({
  path: "./.env",
});

const stripeKey = process.env.STRIPE_KEY || "";
export const redisTTL = process.env.REDIS_TTL || 60 * 60 * 1;
connectDB(process.env.MONGO_URI as string);
export const redis = connectRedis(process.env.REDIS_URI as string);

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
});

export const stripe = new Stripe(stripeKey);

const port = process.env.PORT || 4000;
const app = express();
app.use(express.json()); //middleware
app.use(morgan("dev"));
app.use(
  cors({
    origin: [process.env.CLIENT_URL!],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
); // can only be used for specific urls as well

app.get("/", (req, res) => {
  res.send("API working with /api/v1");
});

// using routes
app.use("/api/v1/user", userRoute);
app.use("/api/v1/product", productRoute);
app.use("/api/v1/order", orderRoute);
app.use("/api/v1/payment", paymentRoute);
app.use("/api/v1/dashboard", dashboardRoute);

//declaring the uploads folder as a static folder
app.use("/uploads", express.static("uploads"));
// using middleware(always place at last)
app.use(errorMiddleware);

app.listen(port, () => {
  console.log(`server is running on http://localhost:${port}`);
});
