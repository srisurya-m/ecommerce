import express from "express";
import {
  deleteUser,
  getAllUsers,
  getUser,
  newUser,
} from "../controllers/User.js";
import { adminOnly } from "../middlewares/auth.js";

const app = express.Router();

app.post("/new", newUser); // /api/v1/user/new
app.get("/all", adminOnly, getAllUsers); // /api/v1/user/all
app.get("/:id", getUser); // /api/v1/user/:id
app.delete("/:id", adminOnly, deleteUser); // /api/v1/user/:id

export default app;
