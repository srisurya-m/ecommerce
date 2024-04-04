import { configureStore } from "@reduxjs/toolkit";
import { userAPI } from "./api/userApi";
import { userReducer } from "./reducer/userReducer";
import { productAPI } from "./api/productApi";

export const server = import.meta.env.VITE_SERVER;
export const store = configureStore({
  reducer: {
    [userAPI.reducerPath]: userAPI.reducer,
    [productAPI.reducerPath]: productAPI.reducer,
    [userReducer.name]: userReducer.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(userAPI.middleware, productAPI.middleware),
});
