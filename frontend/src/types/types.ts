export type User = {
  name: string;
  email: string;
  photo: string;
  gender: string;
  role: string;
  dob: string;
  _id: string;
};

export type Product = {
  name: string;
  price: number;
  stock: number;
  description: string;
  ratings: number;
  numOfReviews: number;
  category: string;
  photos: {
    url: string;
    public_id: string;
  }[];
  _id: string;
};

export type CartItem = {
  productId: string;
  photo: string;
  name: string;
  price: number;
  quantity: number;
  stock: number;
};

export type OrderItem = {
  productId: string;
  photo: string;
  name: string;
  price: number;
  quantity: number;
  _id: string;
};

export type ShippingInfo = {
  address: string;
  city: string;
  state: string;
  country: string;
  pinCode: string;
};

export type Order = {
  orderItems: OrderItem[];
  shippingInfo: ShippingInfo;
  subtotal: number;
  tax: number;
  shippingCharges: number;
  discount: number;
  total: number;
  status: string;
  user: {
    name: string;
    _id: string;
  };
  _id: string;
};

type percentChangeAndCount = {
  revenue: number;
  product: number;
  user: number;
  order: number;
};

type genderRatio = {
  male: number;
  female: number;
};

type modifiedTransaction = {
  _id: string;
  discount: number;
  status: "Processing" | "Shipped" | "Delivered";
  amount: number;
  quantity: number;
};

export type Statistics = {
  userGenderRatio: genderRatio;
  categoryCount: Record<string, number>[];
  percentChange: percentChangeAndCount;
  count: percentChangeAndCount;
  chart: {
    order: number[];
    revenue: number[];
  };
  modifiedTransaction: modifiedTransaction[];
};

export type Pie = {
  adminCustomers: {
    admin: number;
    customer: number;
  };
  userAgeGroup: {
    teen: number;
    adult: number;
    old: number;
  };
  orderFulfillment: {
    processing: number;
    shipped: number;
    delivered: number;
  };
  productCategories: Record<string, number>[];
  stockAvailability: {
    inStock: number;
    outOfStock: number;
  };
  revenueDistribution: {
    netMargin: number;
    discount: number;
    productionCost: number;
    burnt: number;
    marketingCost: number;
  };
};

export type Bar = {
  users: number[];
  products: number[];
  orders: number[];
};

export type Line = {
  users: number[];
  products: number[];
  discount: number[];
  revenue: number[];
};

export type Coupon = {
  code: string;
  amount: number;
  _id: string;
};

export type Review = {
  rating: number;
  comment: string;
  product: string;
  user: {
    name: string;
    photo:string;
    _id: string;
  };
  _id: string;
};
