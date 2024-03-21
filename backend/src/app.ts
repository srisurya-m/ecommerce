import express from "express";
import NodeCache from "node-cache";
import { config } from "dotenv";
import morgan from "morgan";

//importing routes
import userRoute from "./routes/User.js";
import productRoute from "./routes/Products.js";
import orderRoute from "./routes/Orders.js";
import paymentRoute from "./routes/Payment.js";
import { connectDB } from "./utils/features.js";
import { errorMiddleware } from "./middlewares/error.js";

config({
  path: "./.env",
});

connectDB(process.env.MONGO_URI as string);
export const myCache = new NodeCache();

const port = process.env.PORT || 4000;
const app = express();
app.use(express.json()); //middleware
app.use(morgan("dev"));

app.get("/", (req, res) => {
  res.send("API working with /api/v1");
});

// using routes
app.use("/api/v1/user", userRoute);
app.use("/api/v1/product", productRoute);
app.use("/api/v1/order", orderRoute);
app.use("/api/v1/payment", paymentRoute);

//declaring the uploads folder as a static folder
app.use("/uploads", express.static("uploads"));
// using middleware(always place at last)
app.use(errorMiddleware);

app.listen(port, () => {
  console.log(`server is running on http://localhost:${port}`);
});
