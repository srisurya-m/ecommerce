import { myCache } from "../app.js";
import { TryCatch } from "../middlewares/error.js";
import { Order } from "../modals/Order.js";
import { Product } from "../modals/Product.js";
import { User } from "../modals/User.js";
import { calculatePercentage, getChartData } from "../utils/features.js";

export const getDashboardStats = TryCatch(async (req, res, next) => {
  let stats = {};
  const key = "admin-stats";
  if (myCache.has(key)) {
    stats = JSON.parse(myCache.get(key) as string);
  } else {
    const today = new Date();
    const sixMonthAgoDate = new Date();
    sixMonthAgoDate.setMonth(sixMonthAgoDate.getMonth() - 6);
    const currentMonth = {
      start: new Date(today.getFullYear(), today.getMonth(), 1),
      end: today,
    };

    const lastMonth = {
      start: new Date(today.getFullYear(), today.getMonth() - 1, 1),
      end: new Date(today.getFullYear(), today.getMonth(), 0), // by default gives last date of prev month
    };

    const currentMonthProductsPromise = Product.find({
      createdAt: {
        $gte: currentMonth.start,
        $lte: currentMonth.end,
      },
    });

    const lastMonthProductsPromise = Product.find({
      createdAt: {
        $gte: lastMonth.start,
        $lte: lastMonth.end,
      },
    });

    const currentMonthUsersPromise = User.find({
      createdAt: {
        $gte: currentMonth.start,
        $lte: currentMonth.end,
      },
    });

    const lastMonthUsersPromise = User.find({
      createdAt: {
        $gte: lastMonth.start,
        $lte: lastMonth.end,
      },
    });

    const currentMonthOrdersPromise = Order.find({
      createdAt: {
        $gte: currentMonth.start,
        $lte: currentMonth.end,
      },
    });

    const lastMonthOrdersPromise = Order.find({
      createdAt: {
        $gte: lastMonth.start,
        $lte: lastMonth.end,
      },
    });

    const lastSixMonthOrdersPromise = Order.find({
      createdAt: {
        $gte: sixMonthAgoDate,
        $lte: today,
      },
    });

    const latestTransactionPromise = Order.find({})
      .select(["orderItems", "discount", "total", "status"])
      .limit(4);

    const [
      currentMonthOrders,
      currentMonthProducts,
      currentMonthUsers,
      lastMonthOrders,
      lastMonthProducts,
      lastMonthUsers,
      productsCount,
      usersCount,
      allOrders,
      lastSixMonthOrders,
      categories,
      maleUsersCount,
      latestTransaction,
    ] = await Promise.all([
      currentMonthOrdersPromise,
      currentMonthProductsPromise,
      currentMonthUsersPromise,
      lastMonthOrdersPromise,
      lastMonthProductsPromise,
      lastMonthUsersPromise,
      Product.countDocuments(),
      User.countDocuments(),
      Order.find({}).select("total"),
      lastSixMonthOrdersPromise,
      Product.distinct("category"),
      User.countDocuments({ gender: "male" }),
      latestTransactionPromise,
    ]);

    const currentMonthRevenue = currentMonthOrders.reduce(
      (total, order) => total + (order.total || 0),
      0
    );

    const lastMonthRevenue = lastMonthOrders.reduce(
      (total, order) => total + (order.total || 0),
      0
    );

    const percentChange = {
      revenue: calculatePercentage(currentMonthRevenue, lastMonthRevenue),
      product: calculatePercentage(
        currentMonthProducts.length,
        lastMonthProducts.length
      ),
      user: calculatePercentage(
        currentMonthUsers.length,
        lastMonthUsers.length
      ),
      order: calculatePercentage(
        currentMonthOrders.length,
        lastMonthOrders.length
      ),
    };
    const revenue = allOrders.reduce(
      (total, order) => total + (order.total || 0),
      0
    );

    const count = {
      revenue,
      user: usersCount,
      product: productsCount,
      order: allOrders.length,
    };

    const orderMonthCounts = new Array(6).fill(0);
    const orderMonthlyRevenue = new Array(6).fill(0);

    lastSixMonthOrders.forEach((order) => {
      const creationDate = order.createdAt;
      const monthDiff = (today.getMonth() - creationDate.getMonth() + 12) % 12;
      if (monthDiff < 6) {
        orderMonthCounts[6 - monthDiff - 1] += 1;
        orderMonthlyRevenue[6 - monthDiff - 1] += order.total;
      }
    });

    const categoriesCountPromise = categories.map((category) =>
      Product.countDocuments({ category })
    );
    const categoriesCount = await Promise.all(categoriesCountPromise);
    const categoryCount: Record<string, number>[] = [];
    categories.forEach((category, i) => {
      categoryCount.push({
        [category]: Math.round((categoriesCount[i] / productsCount) * 100),
      });
    });

    const userGenderRatio = {
      male: maleUsersCount,
      female: usersCount - maleUsersCount,
    };

    const modifiedTransaction = latestTransaction.map((i) => ({
      _id: i._id,
      discount: i.discount,
      status: i.status,
      amount: i.total,
      quantity: i.orderItems.length,
    }));

    stats = {
      userGenderRatio,
      categoryCount,
      percentChange,
      count,
      chart: {
        order: orderMonthCounts,
        revenue: orderMonthlyRevenue,
      },
      modifiedTransaction,
    };

    myCache.set(key, JSON.stringify(stats));
  }

  return res.status(200).json({
    success: true,
    stats,
  });
});

export const getPieCharts = TryCatch(async (req, res, next) => {
  let charts;
  const key = "admin-pie-charts";
  if (myCache.has(key)) charts = JSON.parse(myCache.get(key) as string);
  else {
    const allOrdersPromise = Order.find({}).select([
      "total",
      "discount",
      "subtotal",
      "tax",
      "shippingCharges",
    ]);
    const [
      processingOrders,
      shippedOrders,
      deliveredOrders,
      categories,
      productsCount,
      productsOutOfStock,
      allOrders,
      allUserDob,
      adminUsersCount,
      customerUsersCount,
    ] = await Promise.all([
      Order.countDocuments({ status: "Processing" }),
      Order.countDocuments({ status: "Shipped" }),
      Order.countDocuments({ status: "Delivered" }),
      Product.distinct("category"),
      Product.countDocuments(),
      Product.countDocuments({ stock: 0 }),
      allOrdersPromise,
      User.find({}).select(["dob"]),
      User.countDocuments({ role: "admin" }),
      User.countDocuments({ role: "user" }),
    ]);

    const orderFulfillment = {
      processing: processingOrders,
      shipped: shippedOrders,
      delivered: deliveredOrders,
    };

    const categoriesCountPromise = categories.map((category) =>
      Product.countDocuments({ category })
    );
    const categoriesCount = await Promise.all(categoriesCountPromise);
    const productCategories: Record<string, number>[] = [];
    categories.forEach((category, i) => {
      productCategories.push({
        [category]: Math.round((categoriesCount[i] / productsCount) * 100),
      });
    });

    const stockAvailability = {
      inStock: productsCount - productsOutOfStock,
      outOfStock: productsOutOfStock,
    };

    const grossIncome = allOrders.reduce(
      (prev, order) => prev + (order.total || 0),
      0
    );

    const discount = allOrders.reduce(
      (prev, order) => prev + (order.discount || 0),
      0
    );

    const productionCost = allOrders.reduce(
      (prev, order) => prev + (order.shippingCharges || 0),
      0
    );

    const burnt = allOrders.reduce((prev, order) => prev + (order.tax || 0), 0);
    const marketingCost = Math.round(grossIncome * (40 / 100));

    const netMargin =
      grossIncome - productionCost - discount - burnt - marketingCost;

    const revenueDistribution = {
      netMargin,
      discount,
      productionCost,
      burnt,
      marketingCost,
    };

    const userAgeGroup = {
      teen: allUserDob.filter((i) => i.age < 20).length,
      adult: allUserDob.filter((i) => i.age >= 20 && i.age < 40).length,
      old: allUserDob.filter((i) => i.age >= 40).length,
    };

    const adminCustomers = {
      admin: adminUsersCount,
      customer: customerUsersCount,
    };

    charts = {
      adminCustomers,
      userAgeGroup,
      orderFulfillment,
      productCategories,
      stockAvailability,
      revenueDistribution,
    };

    myCache.set(key, JSON.stringify(charts));
  }
  return res.status(200).json({
    success: true,
    charts,
  });
});

export const getBarCharts = TryCatch(async (req, res, next) => {
  let charts;
  const key = "admin-bar-charts";
  if (myCache.has(key)) charts = JSON.parse(myCache.get(key) as string);
  else {
    const today = new Date();
    const sixMonthAgoDate = new Date();
    sixMonthAgoDate.setMonth(sixMonthAgoDate.getMonth() - 6);
    const twelveMonthAgoDate = new Date();
    twelveMonthAgoDate.setMonth(twelveMonthAgoDate.getMonth() - 12);
    const lastSixMonthProductsPromise = Product.find({
      createdAt: {
        $gte: sixMonthAgoDate,
        $lte: today,
      },
    });
    const lastSixMonthUsersPromise = User.find({
      createdAt: {
        $gte: sixMonthAgoDate,
        $lte: today,
      },
    }).select("createdAt");
    const lastTwelveMonthOrdersPromise = Order.find({
      createdAt: {
        $gte: twelveMonthAgoDate,
        $lte: today,
      },
    }).select("createdAt");

    const [lastTwelveMonthOrders, lastSixMonthProducts, lastSixMonthUsers] =
      await Promise.all([
        lastTwelveMonthOrdersPromise,
        lastSixMonthProductsPromise,
        lastSixMonthUsersPromise,
      ]);

    const productCount = getChartData({
      length: 6,
      docArr: lastSixMonthProducts,
      today,
    });
    const userCount = getChartData({
      length: 6,
      today,
      docArr: lastSixMonthUsers,
    });
    const orderCount = getChartData({
      length: 12,
      today,
      docArr: lastTwelveMonthOrders,
    });

    charts = {
      users: userCount,
      products: productCount,
      orders: orderCount,
    };

    myCache.set(key, JSON.stringify(charts));
  }

  return res.status(200).json({
    success: true,
    charts,
  });
});

export const getLineCharts = TryCatch(async (req, res, next) => {
  let charts;
  const key = "admin-line-charts";
  if (myCache.has(key)) charts = JSON.parse(myCache.get(key) as string);
  else {
    const today = new Date();
    const twelveMonthAgoDate = new Date();
    twelveMonthAgoDate.setMonth(twelveMonthAgoDate.getMonth() - 12);
    const lastTwelveMonthOrdersPromise = Order.find({
      createdAt: {
        $gte: twelveMonthAgoDate,
        $lte: today,
      },
    }).select(["createdAt", "discount", "total"]);
    const lastTwelveMonthProductsPromise = Product.find({
      createdAt: {
        $gte: twelveMonthAgoDate,
        $lte: today,
      },
    }).select("createdAt");
    const lastTwelveMonthUsersPromise = User.find({
      createdAt: {
        $gte: twelveMonthAgoDate,
        $lte: today,
      },
    }).select("createdAt");

    const [
      lastTwelveMonthOrders,
      lastTwelveMonthProducts,
      lastTwelveMonthUsers,
    ] = await Promise.all([
      lastTwelveMonthOrdersPromise,
      lastTwelveMonthProductsPromise,
      lastTwelveMonthUsersPromise,
    ]);

    const productCount = getChartData({
      length: 12,
      docArr: lastTwelveMonthProducts,
      today,
    });
    const userCount = getChartData({
      length: 12,
      today,
      docArr: lastTwelveMonthUsers,
    });
    const discount = getChartData({
      length: 12,
      today,
      docArr: lastTwelveMonthOrders,
      property: "discount",
    });
    const revenue = getChartData({
      length: 12,
      today,
      docArr: lastTwelveMonthOrders,
      property: "total",
    });

    charts = {
      users: userCount,
      products: productCount,
      discount,
      revenue,
    };

    myCache.set(key, JSON.stringify(charts));
  }

  return res.status(200).json({
    success: true,
    charts,
  });
});
