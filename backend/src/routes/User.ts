import express from "express";
import { newUser } from "../controllers/User.js";

const app = express.Router();

app.post("/new",newUser);

export default app;
