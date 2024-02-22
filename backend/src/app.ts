import express from "express";
import NodeCache from "node-cache";

//importing routes
import userRoute from "./routes/User.js";
import productRoute from "./routes/Products.js";
import { connectDB } from "./utils/features.js";
import { errorMiddleware } from "./middlewares/error.js";

connectDB();
export const myCache=new NodeCache();

const port = 4000;
const app = express();
app.use(express.json()); //middleware

app.get("/", (req, res) => {
  res.send("API working with /api/v1");
});

// using routes
app.use("/api/v1/user", userRoute);
app.use("/api/v1/product", productRoute);


//declaring the uploads folder as a static folder
app.use("/uploads",express.static("uploads"));
// using middleware(always place at last)
app.use(errorMiddleware);

app.listen(port, () => {
  console.log(`server is running on http://localhost:${port}`);
});
