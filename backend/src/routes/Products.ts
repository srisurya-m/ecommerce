import express from "express";
import {
  deleteProduct,
  getAdminProducts,
  getAllCategories,
  getAllProducts,
  getLatestProducts,
  getSingleProduct,
  newProduct,
  updateProduct,
} from "../controllers/Product.js";
import { adminOnly } from "../middlewares/auth.js";
import { multiUpload, singleUpload } from "../middlewares/multer.js";

const app = express.Router();

app.post("/new", adminOnly, multiUpload, newProduct); // api/v1/product/new
app.get("/latest", getLatestProducts); // api/v1/product/latest
app.get("/all", getAllProducts); // api/v1/product/all
app.get("/categories", getAllCategories); // api/v1/product/categories
app.get("/admin-products", adminOnly, getAdminProducts); // api/v1/product/admin-products
app
  .route("/:id")
  .get(getSingleProduct)
  .put(adminOnly,multiUpload, updateProduct)
  .delete(adminOnly,deleteProduct);

export default app;
