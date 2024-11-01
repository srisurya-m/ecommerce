import { NextFunction } from "express";
import { Request, Response } from "express";

export interface CloudinaryResponse {
  public_id: string;
  secure_url: string;
}

export interface newUserRequestBody {
  name: string;
  email: string;
  photo: string;
  gender: string;
  _id: string;
  dob: Date;
}
export interface newProductRequestBody {
  name: string;
  category: string;
  price: number;
  stock: number;
  description: string;
}

export type ControllerType = (
  req: Request,
  res: Response,
  next: NextFunction
) => Promise<void | Response<any, Record<string, any>>>;

export type SearchRequestQuery = {
  search?: string;
  price?: string;
  category?: string;
  sort?: string;
  page?: string;
};

export interface baseQuery {
  name?: {
    $regex: string; // searches for that pattern
    $options: string; // case insensitive
  };
  price?: {
    $lte: number; // less than equal
  };
  category?: string;
}

export type InvalidateCacheProps = {
  product?: boolean;
  order?: boolean;
  admin?: boolean;
  review?: boolean;
  userId?: string;
  orderId?: string;
  productId?: string | string[];
};

export type OrderItemType = {
  name: string;
  photo: string;
  price: number;
  quantity: number;
  productId: string;
};

export type ShippingInfoType = {
  address: string;
  city: string;
  state: string;
  country: string;
  pinCode: number;
};

export interface NewOrderRequestBody {
  shippingInfo: ShippingInfoType;
  user: string;
  subtotal: number;
  shippingCharges: number;
  tax: number;
  discount: number;
  total: number;
  orderItems: OrderItemType[];
}
