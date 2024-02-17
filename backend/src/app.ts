import express from "express";

//importing routes
import userRoute from "./routes/User.js";
import { connectDB } from "./utils/features.js";

connectDB();
const port = 4000;

const app = express();

app.use(express.json());

app.get("/", (req, res) => {
  res.send("API working with /api/v1");
});

// using routes
app.use("/api/v1/user", userRoute);

app.listen(port, () => {
  console.log(`server is running on http://localhost:${port}`);
});
